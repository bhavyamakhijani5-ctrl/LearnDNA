/* ===================================================================
   MODULE 5 -- Home (dashboard top section), inspired by DevHarbour's home page:
   greeting + "Learn. Build. Compete. Grow." tiles, popular coding challenges
   for the current course, and a live leaderboard.
   Used by renderDashboard() in module 3 (guarded with typeof Home).
   =================================================================== */

const Home = {
  /** everyone on this device ranked by weekly or all-time XP */
  rows(weekly) {
    const byEmail = Object.fromEntries(Store.listStudents().map(s => [s.email, s]));
    byEmail[CURRENT.email] = JSON.parse(JSON.stringify(CURRENT));
    return Object.values(byEmail).map(s => ({ email: s.email, xp: weekly ? Engage.weekXp(s) : Engage.xpOf(s) })).sort((a, b) => b.xp - a.xp);
  },
  myRank() { const r = this.rows(true); return { pos: r.findIndex(x => x.email === CURRENT.email) + 1, of: r.length }; },

  hero(recs, goal) {
    const list = typeof Practice !== "undefined" ? Practice.forCourse(goal.id) : [];
    const solved = list.filter(c => Practice.isSolved(c.id)).length;
    const e = Engage.get(), streak = Engage.streakOf(CURRENT), min = e.activity[Engage.today()]?.min || 0, rk = this.myRank();
    const next = recs[0];
    const tile = (cls, icon, word, line, href) => `
      <a class="hm-tile ${cls}" href="${href}"><span class="hm-ic">${icon}</span><span class="hm-word">${word}</span><span class="hm-line">${line}</span><span class="hm-go">→</span></a>`;
    return `
    <section class="hm-hero">
      <div class="hm-eyebrow">${esc(goal.title)}</div>
      <h1 class="hm-title">Hi, <span class="hm-name">${esc(CURRENT.name)}</span>!</h1>
      <p class="hm-tag"><span>Learn.</span> <span>Build.</span> <span>Compete.</span> <span>Grow.</span></p>
      <div class="hm-tiles">
        ${tile("t-learn", "📘", "Learn", next ? `Next up: ${esc(next.topic.title)}` : "Open your roadmap", next ? `#/topic/${next.topic.id}` : "#/roadmap")}
        ${tile("t-build", "💻", "Build", list.length ? `${solved} of ${list.length} challenges solved` : "Coding practice", "#/practice")}
        ${tile("t-compete", "🏆", "Compete", rk.of > 1 ? `Rank #${rk.pos} of ${rk.of} this week` : "Climb the leaderboard", "#/community")}
        ${tile("t-grow", "🌱", "Grow", `${streak ? "🔥 " + streak + "-day streak · " : ""}${min} focus min today`, "#/focus")}
      </div>
    </section>`;
  },

  mainRow(goal) {
    const all = typeof Practice !== "undefined" ? Practice.forCourse(goal.id) : [];
    const pick = all.filter(c => !Practice.isSolved(c.id)).concat(all.filter(c => Practice.isSolved(c.id))).slice(0, 5);
    const w = Practice.filter.board;
    const rows = pick.map(c => `
      <a class="pr-row" href="#/practice/${c.id}">
        <span class="pr-idx">${String(all.indexOf(c) + 1).padStart(2, "0")}</span>
        <span class="pr-title">${esc(c.title)}${Practice.isSolved(c.id) ? ` <span class="pr-done">✓</span>` : ""}<small class="pr-lang-tag">${esc(LANGS[c.lang].label)}</small></span>
        <span class="pr-cat">${esc(Practice.topicTitle(goal.id, c.topic))}</span>
        <span class="pr-diff ${c.difficulty}">${c.difficulty}</span>
        <span class="btn small pr-go">${Practice.isSolved(c.id) ? "Review" : "Solve"} →</span>
      </a>`).join("");
    return `
    <div class="pr-layout hm-row">
      <div class="card">
        <div class="hm-card-head"><h3>Popular Coding Challenges</h3><a href="#/practice" class="hm-more">View all →</a></div>
        ${rows || `<div class="empty" style="padding:20px 0;">No coding challenges for this course yet.</div>`}
      </div>
      <div class="card">
        <div class="hm-card-head"><h3>Leaderboard</h3><span class="badge hm-live">● Live</span></div>
        <div class="seg" style="margin:12px 0 8px;"><button data-hboard="week" class="${w === "week" ? "on" : ""}">Weekly</button><button data-hboard="all" class="${w === "all" ? "on" : ""}">All-time</button></div>
        <div id="hm-board">${practiceBoardHtml()}</div>
        <a href="#/community" class="hm-more" style="display:block;margin-top:10px;">Full leaderboard &amp; groups →</a>
      </div>
    </div>`;
  },

  bind() {
    root.querySelectorAll("[data-hboard]").forEach(b => b.addEventListener("click", () => {
      Practice.filter.board = b.dataset.hboard;
      root.querySelectorAll("[data-hboard]").forEach(x => x.classList.toggle("on", x === b));
      document.getElementById("hm-board").innerHTML = practiceBoardHtml();
    }));
  },
};
