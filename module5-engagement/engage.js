/* ===================================================================
   MODULE 5 -- Engagement (part 1 of 3): XP, streaks, daily goal, custom goals
   State lives on the Student object (student.engage) so it is saved by
   Store.saveStudent() with everything else -- no extra storage layer.
   Rule: a streak day = the daily question target was met that day.
   =================================================================== */

const Engage = {
  XP_PER_CORRECT: 10, XP_ROUND: 20, XP_MASTERED: 50, XP_DAILY_BONUS: 25, XP_GOAL: 30,

  today(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; },
  daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return this.today(d); },

  get(s = CURRENT) {
    if (!s.engage) s.engage = { xp: 0, streak: { count: 0, best: 0, last: null }, activity: {}, dailyTarget: 5, bonusDay: null, customGoals: [] };
    return s.engage;
  },
  // works on raw JSON students too (leaderboard) -- never mutates
  xpOf(s) { return s.engage?.xp || 0; },
  levelOf(xp) { return 1 + Math.floor(xp / 100); },
  streakOf(s) {
    const st = s.engage?.streak; if (!st?.last) return 0;
    return (st.last === this.today() || st.last === this.daysAgo(1)) ? st.count : 0;
  },
  weekXp(s) {
    let t = 0; for (let i = 0; i < 7; i++) t += s.engage?.activity?.[this.daysAgo(i)]?.xp || 0; return t;
  },
  todayQ() { return this.get().activity[this.today()]?.q || 0; },

  /** Called by the quiz runner after every submitted round. Returns a summary for the UI. */
  onQuiz({ correct, total, newlyMastered }) {
    const e = this.get(), t = this.today();
    const a = e.activity[t] || (e.activity[t] = { q: 0, c: 0, xp: 0 });
    let gain = correct * this.XP_PER_CORRECT + this.XP_ROUND + (newlyMastered ? this.XP_MASTERED : 0);
    a.q += total; a.c += correct;
    const out = { gain: 0, streakUp: false, dailyDone: false, goalsDone: [], streak: 0 };

    if (a.q >= e.dailyTarget && e.bonusDay !== t) {           // daily goal reached for the first time today
      e.bonusDay = t; gain += this.XP_DAILY_BONUS; out.dailyDone = true;
      if (e.streak.last !== t) {
        e.streak.count = (e.streak.last === this.daysAgo(1)) ? e.streak.count + 1 : 1;
        e.streak.last = t; e.streak.best = Math.max(e.streak.best, e.streak.count); out.streakUp = true;
      }
    }
    for (const g of e.customGoals) {                           // auto-tracked custom goals
      if (g.done || g.type === "manual") continue;
      if (g.type === "questions") g.progress += total;
      if (g.type === "mastered" && newlyMastered) g.progress += 1;
      if (g.progress >= g.target) { g.done = true; g.doneOn = t; gain += this.XP_GOAL; out.goalsDone.push(g.title); }
    }
    e.xp += gain; a.xp += gain; out.gain = gain; out.streak = this.streakOf(CURRENT);
    return out;
  },

  addGoal({ title, type, target, deadline }) {
    this.get().customGoals.unshift({ id: "G" + Date.now(), title: title.trim(), type, target: type === "manual" ? 1 : Math.max(1, +target || 1),
      progress: 0, deadline: deadline || null, done: false, created: this.today() });
  },

  /** Compact card for the dashboard. */
  dashCard() {
    const e = this.get(), q = this.todayQ(), pct = Math.min(100, Math.round(q / e.dailyTarget * 100)), s = this.streakOf(CURRENT);
    const open = e.customGoals.filter(g => !g.done).length;
    return `
    <div class="grid cols-3" style="margin-bottom:16px;">
      <div class="card"><h3>🔥 Streak</h3><div class="stat">${s}<span style="font-size:16px;color:var(--text-faint);"> day${s === 1 ? "" : "s"}</span></div>
        <div class="stat-label">${s ? "best: " + e.streak.best : "meet today's goal to start one"}</div></div>
      <div class="card"><h3>🎯 Daily goal</h3><div class="stat">${Math.min(q, e.dailyTarget)}<span style="font-size:16px;color:var(--text-faint);"> / ${e.dailyTarget} questions</span></div>
        <div class="mastery-bar" style="margin-top:10px;"><span style="width:${pct}%"></span></div></div>
      <div class="card"><h3>⭐ Level ${this.levelOf(e.xp)}</h3><div class="stat">${e.xp}<span style="font-size:16px;color:var(--text-faint);"> XP</span></div>
        <div class="stat-label">${open} custom goal${open === 1 ? "" : "s"} open · <a href="#/goals" style="color:var(--accent);">manage</a></div></div>
    </div>`;
  },
};

// ---------------------------------------------------------------- Goals page
function renderGoals() {
  const e = Engage.get(), q = Engage.todayQ(), s = Engage.streakOf(CURRENT);
  const pct = Math.min(100, Math.round(q / e.dailyTarget * 100));
  const xpIn = e.xp % 100;

  const cells = [];
  for (let i = 34; i >= 0; i--) {
    const day = Engage.daysAgo(i), n = e.activity[day]?.q || 0;
    const lvl = n === 0 ? 0 : n >= e.dailyTarget ? 1 : 0.45;
    cells.push(`<div class="hm-cell" title="${day}: ${n} questions" style="${lvl ? `background:var(--accent);opacity:${lvl}` : ""}"></div>`);
  }

  const goalRow = g => {
    const p = g.type === "manual" ? (g.done ? 100 : 0) : Math.min(100, Math.round(g.progress / g.target * 100));
    const late = g.deadline && !g.done && g.deadline < Engage.today();
    const kind = g.type === "questions" ? `${g.progress}/${g.target} quiz questions` : g.type === "mastered" ? `${g.progress}/${g.target} topics mastered` : "manual checklist";
    return `<div class="goal-row ${g.done ? "done" : ""}">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:14px;">${g.done ? "✅ " : ""}${esc(g.title)}</div>
        <div class="hint" style="margin:3px 0 6px;">${kind}${g.deadline ? ` · due ${esc(g.deadline)}` : ""}${late ? ` · <span style="color:var(--red)">overdue</span>` : ""}</div>
        <div class="mastery-bar"><span style="width:${p}%"></span></div>
      </div>
      ${g.type === "manual" && !g.done ? `<button class="btn small" data-done="${g.id}">Mark done</button>` : ""}
      <button class="btn ghost small" data-del="${g.id}" aria-label="Delete goal">✕</button>
    </div>`;
  };

  shell("goals", `
    <div class="page-head"><div class="eyebrow">streaks &amp; goals</div><h1>Stay consistent</h1>
      <p class="lede">Hit your daily target to grow your streak. You can also create custom goals — they auto-track quiz questions or topics mastered.</p></div>

    <div class="grid cols-3" style="margin-bottom:16px;">
      <div class="card"><h3>🔥 Current streak</h3><div class="stat">${s}<span style="font-size:16px;color:var(--text-faint);"> days</span></div><div class="stat-label">best ever: ${e.streak.best}</div></div>
      <div class="card"><h3>🎯 Today</h3><div class="stat">${Math.min(q, e.dailyTarget)}<span style="font-size:16px;color:var(--text-faint);"> / ${e.dailyTarget}</span></div>
        <div class="mastery-bar" style="margin:10px 0 8px;"><span style="width:${pct}%"></span></div>
        <label class="hint">Daily target:
          <select id="daily-target" class="mini-select">${[3, 5, 10, 15, 20].map(n => `<option ${n === e.dailyTarget ? "selected" : ""}>${n}</option>`).join("")}</select> questions</label></div>
      <div class="card"><h3>⭐ Level ${Engage.levelOf(e.xp)}</h3><div class="stat">${e.xp}<span style="font-size:16px;color:var(--text-faint);"> XP</span></div>
        <div class="mastery-bar" style="margin-top:10px;"><span style="width:${xpIn}%"></span></div><div class="stat-label">${100 - xpIn} XP to next level</div></div>
    </div>

    <div class="card" style="margin-bottom:16px;"><h3>Last 5 weeks</h3><div class="heatmap">${cells.join("")}</div>
      <div class="hint" style="margin-top:8px;">Dark = daily target met · light = some practice. XP: +10 per correct answer, +20 per round, +50 per mastered topic, +25 daily bonus, +30 per custom goal.</div></div>

    <div class="card" style="margin-bottom:16px;"><h3>🏅 Badges (${Badges.count()}/${BADGES.length})</h3>${Badges.html()}</div>

    <div class="card"><h3>My custom goals</h3>
      <form id="goal-form" class="goal-form">
        <input id="g-title" placeholder="e.g. Finish Java OOP before end sem" maxlength="80" required>
        <select id="g-type"><option value="questions">Answer N quiz questions</option><option value="mastered">Master N topics</option><option value="manual">Manual checklist item</option></select>
        <input id="g-target" type="number" min="1" max="500" value="20" style="width:80px;">
        <input id="g-due" type="date" title="Deadline (optional)">
        <button class="btn" type="submit">Add goal</button>
      </form>
      ${e.customGoals.length ? e.customGoals.map(goalRow).join("") : `<div class="empty" style="padding:18px 0;">No custom goals yet — add one above.</div>`}
    </div>`);

  document.getElementById("daily-target").addEventListener("change", ev => { e.dailyTarget = +ev.target.value; persist(); renderGoals(); });
  const typeSel = document.getElementById("g-type"), tgt = document.getElementById("g-target");
  typeSel.addEventListener("change", () => { tgt.style.display = typeSel.value === "manual" ? "none" : ""; });
  document.getElementById("goal-form").addEventListener("submit", ev => {
    ev.preventDefault();
    Engage.addGoal({ title: document.getElementById("g-title").value, type: typeSel.value, target: tgt.value, deadline: document.getElementById("g-due").value });
    persist(); renderGoals();
  });
  root.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { e.customGoals = e.customGoals.filter(g => g.id !== b.dataset.del); persist(); renderGoals(); }));
  root.querySelectorAll("[data-done]").forEach(b => b.addEventListener("click", () => {
    const g = e.customGoals.find(x => x.id === b.dataset.done); if (!g) return;
    g.done = true; g.progress = 1; g.doneOn = Engage.today(); e.xp += Engage.XP_GOAL;
    const a = e.activity[Engage.today()] || (e.activity[Engage.today()] = { q: 0, c: 0, xp: 0 }); a.xp += Engage.XP_GOAL;
    persist(); toast(`Goal done! +${Engage.XP_GOAL} XP`); renderGoals();
  }));
}
