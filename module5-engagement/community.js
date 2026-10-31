/* ===================================================================
   MODULE 5 -- Engagement (part 2 of 3): Leaderboard & Study Groups
   Everything is browser-local (localStorage), same as the rest of the
   app: students who sign up on the SAME browser/device compete with
   each other. A real multi-device leaderboard would need a backend
   (listed as future scope).
   =================================================================== */

const Groups = {
  KEY: "learndna:groups",
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || "{}"); } catch { return {}; } },
  save(g) { localStorage.setItem(this.KEY, JSON.stringify(g)); },
  mine(email) { return Object.values(this.all()).filter(g => g.members.includes(email)); },
  create(name, email) {
    const all = this.all(); let code;
    do { code = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join(""); } while (all[code]);
    all[code] = { code, name: name.trim(), owner: email, members: [email], created: Date.now() };
    this.save(all); return code;
  },
  join(code, email) {
    const all = this.all(), g = all[code.trim().toUpperCase()];
    if (!g) throw new Error("No group found with this code.");
    if (g.members.includes(email)) throw new Error("You're already in this group.");
    g.members.push(email); this.save(all); return g;
  },
  leave(code, email) {
    const all = this.all(), g = all[code]; if (!g) return;
    g.members = g.members.filter(m => m !== email);
    if (!g.members.length) delete all[code]; else if (g.owner === email) g.owner = g.members[0];
    this.save(all);
  },
};

let COMM = { tab: "global", period: "all" };

function rankRows(students, period) {
  return students.map(s => ({
    email: s.email, name: s.name, demo: !!s.demo,
    xp: period === "week" ? Engage.weekXp(s) : Engage.xpOf(s),
    level: Engage.levelOf(Engage.xpOf(s)), streak: Engage.streakOf(s),
    dna: Math.round(new KnowledgeDNA(s.id, s.dna?.masteryMap).getOverallDnaScore()),
  })).sort((a, b) => b.xp - a.xp || b.streak - a.streak);
}

function boardHtml(rows) {
  if (!rows.length) return `<div class="empty" style="padding:18px 0;">No data yet.</div>`;
  return `<table class="board"><thead><tr><th>#</th><th>Student</th><th>Lvl</th><th>XP</th><th>🔥</th><th>DNA</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr class="${r.email === CURRENT.email ? "me" : ""}"><td>${["🥇", "🥈", "🥉"][i] || i + 1}</td>
      <td>${esc(r.name)}${r.email === CURRENT.email ? " (you)" : ""}${r.demo ? ` <span class="badge neutral">demo</span>` : ""}</td>
      <td>${r.level}</td><td><strong>${r.xp}</strong></td><td>${r.streak}</td><td>${r.dna}%</td></tr>`).join("")}</tbody></table>`;
}

function renderCommunity() {
  const everyone = Store.listStudents();
  const byEmail = Object.fromEntries(everyone.map(s => [s.email, s]));
  byEmail[CURRENT.email] = JSON.parse(JSON.stringify(CURRENT)); // freshest copy of me
  const students = Object.values(byEmail);
  const periodSel = `<select id="period" class="mini-select"><option value="all" ${COMM.period === "all" ? "selected" : ""}>All time</option><option value="week" ${COMM.period === "week" ? "selected" : ""}>This week</option></select>`;
  let body;

  if (COMM.tab === "global") {
    body = `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><h3 style="margin:0;">Leaderboard — all students on this device</h3>${periodSel}</div>
      ${boardHtml(rankRows(students, COMM.period))}
      <div class="hint" style="margin-top:10px;">Only accounts created in this browser are shown. For a demo,
        ${students.some(s => s.demo) ? `<button class="btn ghost small" id="demo-off">Remove demo classmates</button>` : `<button class="btn ghost small" id="demo-on">Add 5 demo classmates</button>`}</div></div>`;
  } else {
    const mine = Groups.mine(CURRENT.email);
    body = `<div class="grid cols-2" style="margin-bottom:16px;">
        <div class="card"><h3>Create a study group</h3><form id="g-create" class="goal-form"><input id="gc-name" placeholder="e.g. AIML-C End Sem Squad" maxlength="40" required><button class="btn" type="submit">Create</button></form></div>
        <div class="card"><h3>Join with a code</h3><form id="g-join" class="goal-form"><input id="gj-code" placeholder="6-letter code" maxlength="6" style="text-transform:uppercase;" required><button class="btn" type="submit">Join</button></form><div id="g-err" class="error-msg"></div></div>
      </div>
      ${mine.length ? mine.map(g => `<div class="card" style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div><h3 style="margin:0;color:var(--text);font-size:16px;">${esc(g.name)}</h3><div class="hint">${g.members.length} member${g.members.length > 1 ? "s" : ""} · code <span class="mono code-pill" data-copy="${g.code}" title="Click to copy">${g.code}</span></div></div>
          <button class="btn ghost small" data-leave="${g.code}">Leave</button></div>
        ${boardHtml(rankRows(g.members.map(m => byEmail[m]).filter(Boolean), "week"))}
        <div class="hint">Group ranking = this week's XP.</div></div>`).join("")
        : `<div class="empty">You're not in any group yet — create one or join with a code.</div>`}`;
  }

  shell("community", `
    <div class="page-head"><div class="eyebrow">community</div><h1>Leaderboard &amp; Study Groups</h1>
      <p class="lede">Earn XP, climb the rankings and compete with friends in study groups.</p></div>
    <div class="tabs"><button data-tab="global" class="${COMM.tab === "global" ? "on" : ""}">🏆 Leaderboard</button><button data-tab="groups" class="${COMM.tab === "groups" ? "on" : ""}">👥 Study groups</button></div>
    ${body}`);

  root.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => { COMM.tab = b.dataset.tab; renderCommunity(); }));
  const ps = document.getElementById("period"); if (ps) ps.addEventListener("change", () => { COMM.period = ps.value; renderCommunity(); });
  const on = document.getElementById("demo-on"); if (on) on.addEventListener("click", () => { seedDemoClassmates(); renderCommunity(); });
  const off = document.getElementById("demo-off"); if (off) off.addEventListener("click", () => { removeDemoClassmates(); renderCommunity(); });
  const gc = document.getElementById("g-create"); if (gc) gc.addEventListener("submit", e => { e.preventDefault(); Groups.create(document.getElementById("gc-name").value, CURRENT.email); renderCommunity(); });
  const gj = document.getElementById("g-join"); if (gj) gj.addEventListener("submit", e => {
    e.preventDefault();
    try { Groups.join(document.getElementById("gj-code").value, CURRENT.email); renderCommunity(); }
    catch (ex) { document.getElementById("g-err").textContent = ex.message; }
  });
  root.querySelectorAll("[data-leave]").forEach(b => b.addEventListener("click", () => { Groups.leave(b.dataset.leave, CURRENT.email); renderCommunity(); }));
  root.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => { navigator.clipboard?.writeText(b.dataset.copy); toast("Code copied: " + b.dataset.copy); }));
}

// clearly-labelled fake students so the leaderboard isn't empty during a demo/viva
function seedDemoClassmates() {
  const names = ["Aarav Kulkarni", "Sneha Patil", "Rohan Deshmukh", "Ishita Joshi", "Kabir Shah"], xps = [420, 310, 250, 180, 90];
  names.forEach((n, i) => {
    const email = `demo${i + 1}@demo.local`, act = {};
    for (let d = 0; d < 7; d++) act[Engage.daysAgo(d)] = { q: 5, c: 4, xp: Math.round(xps[i] / 9) };
    const s = { id: "DEMO" + i, name: n, email, demo: true, dna: { masteryMap: { T1: 40 + i * 10 } },
      engage: { xp: xps[i], streak: { count: 5 - i, best: 6, last: Engage.today() }, activity: act, dailyTarget: 5, customGoals: [] } };
    localStorage.setItem(Store.KEY_PREFIX + "student:" + email, JSON.stringify(s));
  });
}
function removeDemoClassmates() {
  Object.keys(localStorage).filter(k => k.startsWith(Store.KEY_PREFIX + "student:demo") && k.endsWith("@demo.local")).forEach(k => localStorage.removeItem(k));
}
