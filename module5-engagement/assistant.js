/* ===================================================================
   MODULE 5 -- LearnDNA Assistant: floating chatbot available on every screen.
   1) Intent router: understands app commands (English; a few Hindi keywords still work) and acts on
      the student's real data -- navigate, stats, weak topics, next topic,
      study plan, set daily goal, add goal, switch course, start quiz, rank...
   2) Anything else -> Claude API if a key is saved, else the offline tutor.
   Shares chat history with the AI Tutor page (Tutor.msgs).
   =================================================================== */

const Assistant = {
  NAV: { dashboard: "/dashboard", roadmap: "/roadmap", graph: "/graph", revision: "/revision", analytics: "/analytics", goal: "/goals", streak: "/goals", tutor: "/tutor",
         leaderboard: "/community", community: "/community", group: "/community", explore: "/explore", focus: "/focus", timer: "/focus", practice: "/practice", coding: "/practice", code: "/practice", course: "/subjects", subject: "/subjects" },
  SUGGEST: ["What's my streak?", "What should I study next?", "7-day study plan", "Weak topics", "Open roadmap"],

  // ------------------------------------------------ intent router
  intent(raw) {
    const t = raw.toLowerCase().trim(), e = Engage.get(), g = currentGraph(), first = CURRENT.name.split(" ")[0];
    const L = (id, txt) => `[${txt}](#/topic/${id})`;
    const dna = Math.round(CURRENT.dna.getOverallDnaScore()), goal = GOALS.get(CURRENT.activeGoalId);
    const topicIn = () => g.getAllTopics().find(x => t.includes(x.title.toLowerCase()));

    if (/^(hi+|hello|hey|namaste|yo|hola|good (morning|evening|afternoon))\b/.test(t))
      return { text: `Hey ${first}! 👋 You've answered ${Math.min(Engage.todayQ(), e.dailyTarget)}/${e.dailyTarget} questions today, streak ${Engage.streakOf(CURRENT)} 🔥. Tell me what you'd like to do — try "what should I study next?" or "study plan".` };
    if (/thank|shukriya|thanks|thx/.test(t)) return { text: "Anytime! 💪 Keep going — you've got this." };
    if (/who are you|tum kaun|your name|aap kaun/.test(t)) return { text: "I'm the **LearnDNA Assistant** — I use your Knowledge DNA, goals and streak to help you study. I can also explain concepts and control the app for you." };
    if (/\b(help|what can you do|kya kar sakte|features|commands)\b/.test(t))
      return { text: `I can help with:\n• **Navigate:** "open roadmap", "go to leaderboard"\n• **Stats:** "my streak", "my progress", "my rank"\n• **Guide:** "what should I study next", "weak topics", "revision due"\n• **Plan:** "7-day study plan"\n• **Actions:** "set daily goal to 10", "add goal answer 30 questions", "switch to python", "start quiz on Collections"\n• **Learn:** "explain OOP Concepts", "quiz me on JDBC", "prerequisites of Spring Boot"\n• You can also speak using the mic 🎤.` };

    const setGoal = t.match(/(?:daily|roz|rozana)\D*(?:goal|target)\D*(\d+)|set\D*goal\D*to\D*(\d+)/);
    if (setGoal) { const n = Math.max(1, Math.min(50, +(setGoal[1] || setGoal[2]))); e.dailyTarget = n; persist(); return { text: `✅ Daily goal is now **${n} questions**.`, nav: "/goals" }; }

    const add = raw.match(/^\s*(?:add|create|new|bana\w*|set)\s+(?:a\s+|ek\s+)?(?:custom\s+)?goal\s*[:\-]?\s*(.+)$/i);
    if (add) {
      const txt = add[1].trim(), qn = txt.match(/(\d+)\s*(?:quiz\s*)?(?:questions?|qs?)\b/i), mn = txt.match(/master\w*\s+(\d+)|(\d+)\s+topics?/i);
      const goal2 = qn ? { type: "questions", target: +qn[1] } : mn ? { type: "mastered", target: +(mn[1] || mn[2]) } : { type: "manual", target: 1 };
      Engage.addGoal({ title: txt, ...goal2 }); persist();
      return { text: `✅ Goal added: **${txt}** (${goal2.type === "manual" ? "manual checklist" : "auto-tracked: " + goal2.target}).`, nav: "/goals" };
    }

    if (/\b(switch|change|badlo|badal|shift)\b/.test(t)) {
      const alias = { CPP: ["c++", "cpp"], DSA: ["dsa", "data structures"], DBMS: ["dbms", "database"], OOP: ["oop"], PYTHON: ["python"], JAVA: ["java"], C: ["c programming", "c language"] };
      const s = SEED_SUBJECTS.find(x => (alias[x.id] || [x.id.toLowerCase()]).some(k => new RegExp("(^|[^a-z+])" + k.replace(/\+/g, "\\+") + "($|[^a-z+])").test(t)));
      if (s) { CURRENT.activeGoalId = s.id; persist(); return { text: `🔄 Switched your course to **${s.title}**.`, nav: "/dashboard" }; }
    }

    if (/\b(start|take|begin|shuru|lagao)\b.*\bquiz\b|\bquiz\b.*\b(start|shuru)\b/.test(t)) {
      const hit = allTopics().find(x => t.includes(x.title.toLowerCase()) && x.sid === CURRENT.activeGoalId) || allTopics().find(x => t.includes(x.title.toLowerCase()));
      if (hit && hit.sid !== CURRENT.activeGoalId) { CURRENT.activeGoalId = hit.sid; persist(); }
      const g2 = currentGraph(), tp = hit ? g2.getTopic(hit.id) : currentEngine().recommend(CURRENT, CURRENT.activeGoalId, 1)[0]?.topic;
      if (tp) return g2.isReadyToLearn(tp.id, id => CURRENT.dna.getMastery(id)) ? { text: `📝 Starting the quiz on **${tp.title}**!`, nav: "/quiz/" + tp.id }
        : { text: `🔒 **${tp.title}** is still locked: ${g2.explain(tp.id, id => CURRENT.dna.getMastery(id))}`, nav: "/topic/" + tp.id };
    }

    const nv = t.match(/\b(?:open|go to|goto|kholo|khol|le chal|take me to|navigate to|chalo)\b.*?\b(dashboard|roadmap|graph|revision|analytics|goals?|streaks?|tutor|leaderboard|community|groups?|explore|focus|timer|practice|coding|code|courses?|subjects?)\b/);
    if (nv) return { text: `🚀 Opening **${nv[1]}**…`, nav: this.NAV[nv[1].replace(/s$/, "")] || this.NAV[nv[1]] };

    if (/\b(plan|schedule|timetable)\b/.test(t)) {
      const days = Math.max(1, Math.min(30, +(t.match(/(\d+)\s*-?\s*(?:day|din|days)/)?.[1] || 7))), budget = CURRENT.availableMinutesPerDay || 90;
      const order = g.topologicalOrder().map(x => x.id || x).filter(id => goal.requiredTopicIds.includes(id) && CURRENT.dna.getMastery(id) < PASS_THRESHOLD);
      if (!order.length) return { text: "🎉 You've already mastered every topic in this course! Check the revision planner.", nav: "/revision" };
      const plan = []; let d = 1, left = budget, cur = [];
      for (const id of order) { let need = g.getTopic(id).estimatedMinutes; while (need > 0) {
        if (d > days - 1) break; const use = Math.min(need, left); cur.push(`${L(id, g.getTopic(id).title)} (${use}m)`); need -= use; left -= use;
        if (left === 0) { plan.push(cur); cur = []; d++; left = budget; } } if (d > days - 1) break; }
      if (cur.length && d <= days - 1) plan.push(cur);
      const rest = order.length - new Set(plan.flat().map(x => x.match(/#\/topic\/(\w+)/)[1])).size;
      return { text: `📅 **${days}-day plan** (${budget} min/day, in prerequisite order):\n${plan.map((p, i) => `• **Day ${i + 1}:** ${p.join(", ")}`).join("\n")}\n• **Day ${days}:** Revision + full quiz rounds${rest > 0 ? `\n\n⚠ ${rest} topic${rest > 1 ? "s" : ""} didn't fit in this plan — add more days or daily minutes.` : ""}` };
    }

    if (/\b(weak|kamzor|struggl|improve|pichh?de)/.test(t)) {
      const w = currentEngine().weakTopics(CURRENT, 50).slice(0, 5);
      return { text: w.length ? `📉 Your weak topics:\n${w.map(x => `• ${L(x.id, x.title)} — ${CURRENT.dna.getMastery(x.id)}%`).join("\n")}\n\nStart with the weakest one.` : "No weak topics found — great going! 🎯" };
    }
    if (/(what|kya|kaunsa).*(study|padh|next|karu)|recommend|next topic|suggest/.test(t)) {
      const r = currentEngine().recommend(CURRENT, goal.id, 3);
      return { text: r.length ? `🎯 Study these next:\n${r.map(x => `• ${L(x.topic.id, x.topic.title)} — ${x.reason}`).join("\n")}` : "No topic is ready right now — check the roadmap to see what unlocks next.", nav: r.length ? null : "/roadmap" };
    }
    if (/revis|dobara|repeat/.test(t) && !/explain/.test(t)) {
      const q = getRevisionQueue(CURRENT, g).slice(0, 5);
      return { text: q.length ? `🔁 Revision due:\n${q.map(x => `• ${L(x.topic.id, x.topic.title)} — not reviewed for ${x.daysSince} days (${x.mastery}%)`).join("\n")}` : "No revision due ✅" };
    }
    if (/\b(rank|leaderboard|position|kaun aage)\b/.test(t)) {
      const all = Store.listStudents().filter(s => s.email !== CURRENT.email).concat([CURRENT]).sort((a, b) => Engage.xpOf(b) - Engage.xpOf(a));
      return { text: `🏆 Your rank is **#${all.findIndex(s => s.email === CURRENT.email) + 1}** of ${all.length} (on this device) — ${e.xp} XP.`, nav: "/community" };
    }
    if (/\b(streak|xp|level|progress|score|kitna|performance|how am i)\b/.test(t)) {
      const done = CURRENT.progress.countCompleted();
      return { text: `📊 **${first}, here are your stats**\n• 🔥 Streak: **${Engage.streakOf(CURRENT)}** (best ${e.streak.best})\n• 🎯 Today: ${Math.min(Engage.todayQ(), e.dailyTarget)}/${e.dailyTarget} questions\n• ⭐ Level ${Engage.levelOf(e.xp)} — ${e.xp} XP\n• 🧬 DNA score: ${dna}% · mastered ${done}/${goal.requiredTopicIds.length}` };
    }
    if (/\b(practice|coding|code|dsa problems?|challenges?)\b/.test(t)) return { text: "💻 Opening Code Practice — solve challenges in the in-browser scratchpad and earn XP.", nav: "/practice" };
    if (/focus|pomodoro|timer/.test(t)) return { text: "⏱ Opening the focus timer — +1 XP for every focused minute.", nav: "/focus" };
    if (/\b(dark|light|theme)\b/.test(t)) { Theme.toggle(); return { text: `🎨 Theme: **${Theme.get()}**` }; }
    if (/motivat|bore|thak|tired|demotiv|stress|nervous|dar lag|give up/.test(t))
      return { text: `${first}, that's completely normal — end-sem pressure hits everyone. 💛 Take one small step: **25 minutes of focus** + 5 questions. Your streak is ${Engage.streakOf(CURRENT)} days and your DNA score is ${dna}% — your progress is real. Say "study plan" and I'll break it into small chunks.` };
    return null;
  },

  // ------------------------------------------------ widget UI
  sync() { const c = subjectStyle(CURRENT.activeGoalId).color; ["fab", "asst"].forEach(id => document.getElementById(id)?.style.setProperty("--accent", c)); },
  mount() {
    if (document.getElementById("asst")) { this.sync(); return; }
    document.body.insertAdjacentHTML("beforeend", `
      <button class="fab" id="fab" aria-label="Open assistant" title="LearnDNA Assistant">💬</button>
      <section class="asst" id="asst" aria-label="LearnDNA Assistant">
        <div class="asst-head"><span>🧬 LearnDNA Assistant</span><span class="badge neutral" id="asst-mode"></span><span class="sp"></span>
          <button id="asst-clear" title="Clear chat">🗑</button><button id="asst-x" title="Close">✕</button></div>
        <div class="chat" id="asst-chat"></div>
        <div class="chips" id="asst-chips"></div>
        <form class="asst-in" id="asst-form"><input id="asst-q" placeholder="Ask me anything…" autocomplete="off" required><button type="button" class="mic" id="asst-mic" title="Voice">🎤</button><button class="btn" type="submit">Send</button></form>
      </section>`);
    const $ = id => document.getElementById(id);
    $("fab").onclick = () => this.toggle();
    $("asst-x").onclick = () => this.toggle(false);
    $("asst-clear").onclick = () => { Tutor.msgs = []; Tutor.pending = null; this.paint(); };
    $("asst-form").onsubmit = e => { e.preventDefault(); const v = $("asst-q").value; $("asst-q").value = ""; this.send(v); };
    $("asst-chips").innerHTML = this.SUGGEST.map(s => `<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join("");
    $("asst-chips").onclick = e => { const b = e.target.closest("[data-s]"); if (b) this.send(b.dataset.s); };
    $("asst-chat").onclick = e => { if (e.target.closest("a[href^='#/']")) this.toggle(false); };
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) $("asst-mic").style.display = "none";
    else $("asst-mic").onclick = () => {
      const r = new SR(); r.lang = "en-IN"; r.interimResults = false; $("asst-mic").classList.add("rec");
      r.onresult = ev => this.send(ev.results[0][0].transcript);
      r.onend = r.onerror = () => $("asst-mic").classList.remove("rec");
      try { r.start(); } catch { /* already listening */ }
    };
    this.sync(); this.paint();
  },
  unmount() { ["fab", "asst"].forEach(id => document.getElementById(id)?.remove()); },
  toggle(force) {
    const p = document.getElementById("asst"); if (!p) return;
    const on = force ?? !p.classList.contains("open"); p.classList.toggle("open", on);
    if (on) { this.paint(); document.getElementById("asst-q").focus(); }
  },
  open(prefill) { this.mount(); this.toggle(true); if (prefill) this.send(prefill); },
  paint() {
    const c = document.getElementById("asst-chat"); if (!c) return;
    document.getElementById("asst-mode").textContent = Tutor.modeLabel();
    const hello = `<div class="msg assistant">Hi ${esc(CURRENT.name.split(" ")[0])}! I'm your study assistant. Ask about your streak, study plan, weak topics or any concept. Type "help" to see what I can do.</div>`;
    c.innerHTML = hello + Tutor.msgs.map(m => `<div class="msg ${m.role}">${m.html}</div>`).join("");
    c.scrollTop = c.scrollHeight;
  },
  async send(text) {
    text = (text || "").trim(); if (!text) return;
    Tutor.msgs.push({ role: "user", raw: text, html: esc(text) }); this.paint();
    document.getElementById("asst-chat").insertAdjacentHTML("beforeend", `<div class="msg assistant dots"><span>●</span><span>●</span><span>●</span></div>`);
    document.getElementById("asst-chat").scrollTop = 1e6;
    let out, nav = null;
    try { await new Promise(r => setTimeout(r, 300)); const r = await Tutor.reply(text); out = r.text; nav = r.nav; } catch (ex) { out = "⚠ " + ex.message; }
    Tutor.msgs.push({ role: "assistant", raw: out, html: Tutor.fmt(out) }); this.paint();
    if (nav) setTimeout(() => navigate(nav), 700);
  },
};
