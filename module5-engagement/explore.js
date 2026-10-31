/* ===================================================================
   MODULE 5 -- Explore: "I want to learn ___" search across every subject
   and saved topics ("profile"). Clean minimal UI (no animated background).
   =================================================================== */

const Saved = {
  list() { const e = Engage.get(); return e.saved || (e.saved = []); },
  has(key) { return this.list().includes(key); },
  toggle(key) { const l = this.list(), i = l.indexOf(key); if (i >= 0) l.splice(i, 1); else l.push(key); persist(); return i < 0; },
};

function allTopics() { return SEED_SUBJECTS.flatMap(s => s.topics.map(t => ({ ...t, sid: s.id, stitle: s.title.split(" (")[0] }))); }

function openTopic(sid, tid) {
  if (sid !== CURRENT.activeGoalId) { CURRENT.activeGoalId = sid; persist(); toast("Switched course to " + GOALS.get(sid).title); }
  navigate("/topic/" + tid);
}

function renderExplore() {
  const all = allTopics();
  const row = t => `<div class="lrow" data-go="${t.sid}|${t.id}"><button class="sbtn ${Saved.has(t.sid + "|" + t.id) ? "on" : ""}" data-save="${t.sid}|${t.id}" title="Save to profile">★</button><span>${esc(t.title)}</span><span class="meta">${esc(t.stitle)} · ${t.difficulty.toLowerCase()} · ${t.minutes}m</span></div>`;
  const savedRows = Saved.list().map(k => { const [sid, tid] = k.split("|"); return all.find(t => t.sid === sid && t.id === tid); }).filter(Boolean);
  const recs = currentEngine().recommend(CURRENT, CURRENT.activeGoalId, 4).map(r => all.find(t => t.sid === CURRENT.activeGoalId && t.id === r.topic.id)).filter(Boolean);

  shell("explore", `
    <div class="hero">
      <div class="hero-badge">✦ Explore</div>
      <h1>What do you want to <span class="grad">learn</span> today?</h1>
      <p class="hero-sub">${all.length} topics · ${SEED_SUBJECTS.length} subjects — search above or pick a subject below.</p>
      <div class="search-box"><span class="search-ic" aria-hidden="true">⌕</span>
        <input class="hero-search" id="q" autocomplete="off" aria-label="Search topics" placeholder="Try: ${esc(all[Math.floor(Math.random() * all.length)].title)}">
        <kbd class="search-kbd">Enter ↵</kbd></div>
      <div class="res-list" id="res" style="display:none;"></div>
      <div class="quick-chips">${SEED_SUBJECTS.map(sj => { const st = subjectStyle(sj.id); return `<button type="button" class="qchip" data-chip="${esc(sj.title.split(" (")[0])}" style="--c:${st.color};"><span>${st.icon}</span>${esc(sj.title.split(" (")[0])}</button>`; }).join("")}</div>
    </div>
    ${recs.length ? `<div class="section-title">recommended for you</div><div class="card" style="padding:4px 0;">${recs.map(row).join("")}</div>` : ""}
    <div class="section-title" style="margin-top:22px;">saved topics (${savedRows.length})</div>
    <div class="card" style="padding:4px 0;">${savedRows.length ? savedRows.map(row).join("") : `<div class="empty" style="padding:18px;">Tap ★ on any topic to save it — saved topics show up here.</div>`}</div>`);

  const q = document.getElementById("q"), res = document.getElementById("res"); q.focus();
  root.querySelectorAll("[data-chip]").forEach(b => b.addEventListener("click", () => { q.value = b.dataset.chip; q.dispatchEvent(new Event("input")); q.focus(); }));
  const ph = setInterval(() => { if (!document.body.contains(q)) return clearInterval(ph); if (!q.value) q.placeholder = "Try: " + all[Math.floor(Math.random() * all.length)].title; }, 2200);
  q.addEventListener("input", () => {
    const s = q.value.trim().toLowerCase(); if (!s) { res.style.display = "none"; return; }
    const hits = all.filter(t => (t.title + " " + t.domain + " " + t.stitle).toLowerCase().includes(s)).slice(0, 8);
    res.style.display = "block";
    res.innerHTML = hits.map(row).join("") + `<div class="lrow" data-ask="${esc(q.value)}">🤖 Ask the assistant: "${esc(q.value)}"</div>`;
  });
  q.addEventListener("keydown", e => { if (e.key === "Enter") { const f = res.querySelector("[data-go]") || res.querySelector("[data-ask]"); if (f) f.click(); } });
  root.querySelector(".main").addEventListener("click", e => {
    const ask = e.target.closest("[data-ask]"); if (ask) { Assistant.open(ask.dataset.ask); return; }
    if (e.target.closest("[data-save]")) return;
    const go = e.target.closest("[data-go]"); if (go) { const [sid, tid] = go.dataset.go.split("|"); openTopic(sid, tid); }
  });
}

// save-star works everywhere (explore rows + topic page header)
document.addEventListener("click", e => {
  const b = e.target.closest("[data-save]"); if (!b || !CURRENT) return;
  e.stopPropagation();
  const on = Saved.toggle(b.dataset.save); b.classList.toggle("on", on); toast(on ? "Saved to profile" : "Removed from profile");
}, true);
