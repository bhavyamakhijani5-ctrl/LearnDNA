/* ===================================================================
   MODULE 5 -- Engagement (part 3 of 3): AI Tutor + quiz explanations
   Two modes, same UI:
     * Online  -- if the student pastes an Anthropic API key (stored only in
                  this browser's localStorage), questions go to the Claude API.
     * Offline -- no key needed: a rule-based tutor built from the Knowledge
                  Graph (topic facts, prerequisites, resources, practice Qs).
   =================================================================== */

const Tutor = {
  KEY: "learndna:aikey",
  msgs: [], topicId: "", pending: null,

  PROV: "learndna:provider", GKEY: "learndna:geminikey", GMODEL: "learndna:geminimodel",
  provider() { return localStorage.getItem(this.PROV) || (localStorage.getItem(this.KEY) && !localStorage.getItem(this.GKEY) ? "claude" : "gemini"); },
  hasKey() { return !!localStorage.getItem(this.provider() === "gemini" ? this.GKEY : this.KEY); },
  modeLabel() { return this.hasKey() ? (this.provider() === "gemini" ? "Gemini online" : "Claude online") : "offline"; },
  fmt(text) { // safe mini-markdown: code blocks, `code`, **bold**, [links](#/route | https://…)
    let s = esc(text);
    s = s.replace(/```([\s\S]*?)```/g, (_, c) => `<pre>${c.replace(/^\w*\n/, "").replace(/\n/g, "&#10;")}</pre>`);
    s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\[([^\]]+)\]\((#\/[^)\s"]+|https?:\/\/[^)\s"]+)\)/g, (m, a, b) => `<a href="${b}"${b[0] === "#" ? "" : ' target="_blank" rel="noopener noreferrer"'}>${a}</a>`);
    return s.replace(/\n/g, "<br>");
  },

  allTopics() { return currentGraph().getAllTopics(); },
  STOP: new Set(["what", "is", "are", "the", "an", "of", "in", "on", "to", "and", "explain", "tell", "about", "me", "kya", "hai", "hota", "yeh", "batao", "samjhao", "samjha", "how", "does", "why", "define", "meaning", "mean", "topic", "kaise", "kyu", "kyun", "concept", "notes", "give", "example", "examples", "quiz", "answer"]),
  stem(w) { return w.replace(/ies$/, "y").replace(/(es|s)$/, ""); },
  findTopic(text) {
    const low = text.toLowerCase(), all = this.allTopics();
    const exact = all.find(t => low.includes(t.title.toLowerCase())); if (exact) return exact;
    const q = (low.match(/[a-z+#]+/g) || []).filter(w => w.length >= 3 && !this.STOP.has(w)).map(w => this.stem(w));
    let best = null, bs = 0;
    for (const t of all) { const tw = new Set((t.title.toLowerCase().match(/[a-z+#]+/g) || []).map(w => this.stem(w))); const sc = q.filter(w => tw.has(w)).length; if (sc > bs) { bs = sc; best = t; } }
    return best;
  },

  context() {
    const weak = currentEngine().weakTopics(CURRENT, 50).slice(0, 4).map(t => `${t.title} (${CURRENT.dna.getMastery(t.id)}%)`);
    return `You are the AI tutor inside LearnDNA, a learning app for a college student (${CURRENT.branch}, year ${CURRENT.year}) preparing for end-semester exams. ` +
      `Current course: ${GOALS.get(CURRENT.activeGoalId).title}. Weak topics: ${weak.join(", ") || "none yet"}. ` +
      `Answer EXACTLY what the student asked, directly, in simple English unless they write in another language. ` +
      `For "what is X" give: a 1-2 line definition, a tiny example (code if relevant), and one exam tip. Use markdown bullets/code blocks. Max ~180 words.`;
  },

  async askModel(system, messages) { return this.provider() === "gemini" ? this.askGemini(system, messages) : this.askClaude(system, messages); },

  async askGemini(system, messages) {
    const key = localStorage.getItem(this.GKEY), first = localStorage.getItem(this.GMODEL) || "gemini-3.6-flash";
    const msgs = messages.slice(); while (msgs.length && msgs[0].role !== "user") msgs.shift();
    const body = JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: msgs.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: 1500 } });
    let err;
    for (const model of [...new Set([first, "gemini-flash-latest", "gemini-2.5-flash"])]) {   // fall back if a model id is retired
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        const txt = (d.candidates?.[0]?.content?.parts || []).map(x => x.text || "").join("");
        if (txt) return txt;
        throw new Error(d.promptFeedback?.blockReason ? "Gemini blocked the response: " + d.promptFeedback.blockReason : "Gemini returned an empty response. Please try again.");
      }
      err = new Error(d.error?.message || "Gemini API error " + r.status);
      if (r.status !== 404 && !/not found|not supported/i.test(err.message)) break;
    }
    throw err;
  },

  async askClaude(system, messages) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": localStorage.getItem(this.KEY), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 900, system, messages }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || "API error");
    return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  },

  // grade the student's reply to the last practice question ("B", "palindrome", "answer" ...)
  gradePending(text) {
    const p = this.pending; if (!p) return null;
    const low = text.trim().toLowerCase().replace(/[.)!]+$/, "");
    if (/^(answer|reveal|batao|dikha|solution|show answer|answer batao)$/.test(low)) { this.pending = null; return `✅ Correct answer: **${p.options[p.answer]}**${p.exp ? "\n" + p.exp : ""}`; }
    let i = /^[a-d]$/.test(low) ? "abcd".indexOf(low) : p.options.findIndex(o => o.length > 1 && (low === o.toLowerCase() || low.includes(o.toLowerCase())));
    if (i < 0) return null;
    this.pending = null;
    const ok = i === p.answer, d = DEFS[p.tid];
    return (ok ? `✅ **Correct!** ${p.options[i]} is right.` : `❌ **Wrong** — you chose *${p.options[i]}*. Correct answer: **${p.options[p.answer]}**.`) +
      (d ? `\n\n📘 ${d[0]}` : "") + `\n\nType "quiz me" for another question.`;
  },

  // ------------------------------------------------ offline brain
  offline(text, topic) {
    const g = currentGraph(), low = text.toLowerCase();
    if (!topic) {
      const weak = currentEngine().weakTopics(CURRENT, 50).slice(0, 3);
      return `Which topic would you like explained? Pick one from the dropdown above or type its name in your message.\n\nYour weak topics: ${weak.map(t => `**${t.title}** (${CURRENT.dna.getMastery(t.id)}%)`).join(", ") || "none yet"}.\nAvailable: ${this.allTopics().map(t => t.title).join(", ")}.`;
    }
    const m = CURRENT.dna.getMastery(topic.id), pre = g.dfsPrerequisiteChain(topic.id);
    const qs = SEED_QUIZZES[topic.id] || [];
    if (/quiz|test|question|practice|puch/.test(low) && qs.length) {
      const q = { ...qs[Math.floor(Math.random() * qs.length)], tid: topic.id }; this.pending = q;
      return `📝 **${topic.title}** — practice question:\n${q.q}\n${q.options.map((o, i) => `${"ABCD"[i]}) ${o}`).join("\n")}\n\n(Type the option letter or the answer — or say "answer" to reveal it.)`;
    }
    if (/prereq|pehle|before|require/.test(low)) {
      return pre.length ? `You should know these before **${topic.title}**:\n${pre.map(p => `• ${p.title} — your mastery ${CURRENT.dna.getMastery(p.id)}%`).join("\n")}` : `**${topic.title}** has no prerequisites — you can start right away.`;
    }
    const d = DEFS[topic.id];
    if (/note|summary|revise|cheat/.test(low) && d) return `📝 **${topic.title}**\n${d[0]}\n${d[1].map(x => "• " + x).join("\n")}\n\nFull notes: [Revision notes](#/revision)`;
    if (d) return `📘 **${topic.title}** (${topic.difficulty.toLowerCase()}, ~${topic.estimatedMinutes} min)\n**Definition:** ${d[0]}\n\n**Key points:**\n${d[1].map(x => "• " + x).join("\n")}\n\nYour mastery: ${m}%${m >= PASS_THRESHOLD ? " ✅" : ""}${pre.length ? ` · Prerequisites: ${pre.map(p => p.title).join(", ")}` : ""}\n` +
      (this.hasKey() ? "" : `(Add a Gemini key in AI settings for answers with examples and more detail.)`);
    const facts = qs.slice(0, 3).map(q => `• ${q.q.replace(/\?$/, "")} → **${q.options[q.answer]}**`);
    return `📘 **${topic.title}** (${topic.difficulty}, ~${topic.estimatedMinutes} min)\nYour mastery: ${m}%${m >= PASS_THRESHOLD ? " ✅ mastered" : ""}\n\n` +
      (facts.length ? `Key points:\n${facts.join("\n")}\n\n` : "") +
      (pre.length ? `Prerequisites: ${pre.map(p => p.title).join(", ")}.\n` : "") +
      `Next step: ${m >= PASS_THRESHOLD ? "take a revision quiz." : "take a quiz round — type \"quiz me\" or press the Quiz button."}\n` +
      `(Add an API key below for detailed AI explanations.)`;
  },

  async reply(text) {
    const graded = this.gradePending(text); if (graded) return { text: graded };
    const act = Assistant.intent(text); // app-aware commands first (works offline too)
    if (act) return act;
    const topic = this.findTopic(text) || (this.topicId ? currentGraph().getTopic(this.topicId) : null);
    if (!this.hasKey()) return { text: this.offline(text, topic), topic };
    const hist = this.msgs.slice(-10).map(m => ({ role: m.role, content: m.raw }));
    if (!hist.length || hist[hist.length - 1].role !== "user" || hist[hist.length - 1].content !== text) hist.push({ role: "user", content: text });
    const sys = this.context() + (topic ? ` The student is probably asking about the topic "${topic.title}" (use it only if relevant to their question).` : "");
    return { text: await this.askModel(sys, hist), topic };
  },

  // ------------------------------------------------ quiz explanation blocks
  expBlock(q, picked) {
    const ok = picked === q.answer;
    return `<div class="q-exp ${ok ? "ok" : "bad"}">
      <strong>${ok ? "✔ Correct" : "✘ Wrong"}</strong> — correct answer: <strong>${esc(q.options[q.answer])}</strong>
      ${!ok && picked !== null ? `<div>You chose: ${esc(q.options[picked])}</div>` : ""}
      ${q.exp ? `<div style="margin-top:4px;">${esc(q.exp)}</div>` : DEFS[q.tid] ? `<div style="margin-top:4px;">📘 ${esc(DEFS[q.tid][0])}</div>` : ""}
      <div style="margin-top:6px;"><button class="btn ghost small" data-ai-exp="${q.idx}">🤖 Explain why</button> <a class="chip" href="#/tutor/${q.tid || ""}">Open AI tutor</a></div>
      <div class="ai-exp" id="ai-exp-${q.idx}"></div></div>`;
  },

  async explainInline(q, picked) {
    const box = document.getElementById("ai-exp-" + q.idx); if (!box) return;
    const topic = q.tid ? currentGraph().getTopic(q.tid) : null;
    if (!this.hasKey()) {
      const links = topic ? chips(topic, false) : "";
      box.innerHTML = `<p class="hint">Concept: <strong>${esc(topic?.title || q.from)}</strong>. Check these resources to understand it, or add an API key in AI Tutor for a step-by-step explanation.</p><div class="chips">${links}</div>`;
      return;
    }
    box.innerHTML = `<p class="hint">Thinking…</p>`;
    try {
      const prompt = `Quiz question: ${q.q}\nOptions: ${q.options.join(" | ")}\nCorrect answer: ${q.options[q.answer]}\nStudent chose: ${picked === null ? "nothing" : q.options[picked]}\nExplain in 2-4 short sentences why the correct answer is right and, if the student was wrong, why their choice is wrong.`;
      box.innerHTML = `<p class="exp-text">${this.fmt(await this.askModel(this.context(), [{ role: "user", content: prompt }]))}</p>`;
    } catch (ex) { box.innerHTML = `<div class="error-msg">${esc(ex.message)}</div>`; }
  },
};

// ---------------------------------------------------------------- AI tutor page
function renderTutor(topicId) {
  if (topicId && currentGraph().topics.has(topicId)) Tutor.topicId = topicId;
  const t = Tutor.topicId ? currentGraph().getTopic(Tutor.topicId) : null;
  const starters = t ? [`Explain ${t.title} simply`, `Quiz me on ${t.title}`, `What are the prerequisites of ${t.title}?`] : ["Which topic should I study next?", "Explain my weakest topic"];

  shell("tutor", `
    <div class="page-head"><div class="eyebrow">ai tutor</div><h1>Ask your tutor</h1>
      <p class="lede">${Tutor.hasKey() ? `Online mode — answers are powered by ${Tutor.provider() === "gemini" ? "Google Gemini" : "Claude"}.` : "Offline mode — answers come from built-in notes. Add a Gemini API key below for detailed answers."}</p></div>
    <div class="card">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
        <label class="hint">Topic:
          <select id="tutor-topic" class="mini-select"><option value="">Any / detect from message</option>
            ${Tutor.allTopics().map(x => `<option value="${x.id}" ${x.id === Tutor.topicId ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select></label>
        <button class="btn ghost small" id="tutor-clear">Clear chat</button>
      </div>
      <div class="chat" id="chat">${Tutor.msgs.length ? Tutor.msgs.map(m => `<div class="msg ${m.role}">${m.html}</div>`).join("") : `<div class="hint">Ask me anything — concepts, prerequisites, or "quiz me".</div>`}</div>
      <div class="chips" style="margin:10px 0;">${starters.map(s => `<button class="chip" data-starter="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <form id="chat-form" class="goal-form"><input id="chat-in" placeholder="Type your question…" autocomplete="off" style="flex:1;" required><button class="btn" id="chat-send" type="submit">Send</button></form>
    </div>
    <details class="card" style="margin-top:14px;" ${Tutor.hasKey() ? "" : "open"}><summary style="cursor:pointer;font-weight:600;font-size:14px;">AI settings — Gemini / Claude API key</summary>
      <p class="hint" style="margin:10px 0;">Free Gemini key: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">aistudio.google.com/apikey</a>. The key is stored only in your browser's localStorage (never on a server or in the code). Don't share your key with anyone.</p>
      <div class="goal-form"><label class="hint">Provider <select id="ai-prov" class="mini-select"><option value="gemini" ${Tutor.provider() === "gemini" ? "selected" : ""}>Google Gemini</option><option value="claude" ${Tutor.provider() === "claude" ? "selected" : ""}>Anthropic Claude</option></select></label>
        <input id="gem-model" placeholder="gemini-3.6-flash" value="${esc(localStorage.getItem(Tutor.GMODEL) || "")}" style="width:190px;" title="Gemini model id (optional)"></div>
      <div class="yt-key" style="margin-bottom:8px;"><input id="gem-key" type="password" placeholder="Gemini API key (AIza…)" value="${esc(localStorage.getItem(Tutor.GKEY) || "")}"></div>
      <div class="yt-key"><input id="ai-key" type="password" placeholder="Claude API key (optional, sk-ant-…)" value="${esc(localStorage.getItem(Tutor.KEY) || "")}"></div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;"><button class="btn small" id="ai-save">Save</button><button class="btn ghost small" id="ai-test">Test connection</button><button class="btn ghost small" id="ai-del">Remove keys</button></div>
    </details>`);

  const chat = document.getElementById("chat"); chat.scrollTop = chat.scrollHeight;
  const send = async (text) => {
    text = text.trim(); if (!text) return;
    Tutor.msgs.push({ role: "user", raw: text, html: esc(text) });
    const inp = document.getElementById("chat-in"); inp.value = "";
    chat.insertAdjacentHTML("beforeend", `<div class="msg user">${esc(text)}</div><div class="msg assistant" id="typing">…</div>`); chat.scrollTop = chat.scrollHeight;
    document.getElementById("chat-send").disabled = true;
    let out;
    let nav = null; try { const r = await Tutor.reply(text); out = r.text; nav = r.nav; } catch (ex) { out = "⚠ " + ex.message; }
    Tutor.msgs.push({ role: "assistant", raw: out, html: Tutor.fmt(out) });
    renderTutor(); if (nav) setTimeout(() => navigate(nav), 700);
  };
  document.getElementById("chat-form").addEventListener("submit", e => { e.preventDefault(); send(document.getElementById("chat-in").value); });
  root.querySelectorAll("[data-starter]").forEach(b => b.addEventListener("click", () => send(b.dataset.starter)));
  document.getElementById("tutor-topic").addEventListener("change", e => { Tutor.topicId = e.target.value; Tutor.pending = null; renderTutor(); });
  document.getElementById("tutor-clear").addEventListener("click", () => { Tutor.msgs = []; Tutor.pending = null; renderTutor(); });
  document.getElementById("ai-save").addEventListener("click", () => {
    const set = (k, id) => { const v = document.getElementById(id).value.trim(); if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); };
    set(Tutor.GKEY, "gem-key"); set(Tutor.KEY, "ai-key"); set(Tutor.GMODEL, "gem-model"); localStorage.setItem(Tutor.PROV, document.getElementById("ai-prov").value);
    toast("Saved"); renderTutor();
  });
  document.getElementById("ai-test").addEventListener("click", async () => {
    document.getElementById("ai-save").click(); toast("Testing…");
    try { await Tutor.askModel("Reply with the single word OK.", [{ role: "user", content: "ping" }]); toast("✅ Connected: " + Tutor.modeLabel()); } catch (ex) { toast("❌ " + ex.message); }
  });
  document.getElementById("ai-del").addEventListener("click", () => { [Tutor.GKEY, Tutor.KEY, Tutor.GMODEL, Tutor.PROV].forEach(k => localStorage.removeItem(k)); toast("Keys removed"); renderTutor(); });
}
