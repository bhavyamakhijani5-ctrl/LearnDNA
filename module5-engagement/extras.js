/* ===================================================================
   MODULE 5 -- Extras: dark/light theme, achievement badges, focus timer.
   =================================================================== */

const Theme = {
  KEY: "learndna:theme",
  get() { return localStorage.getItem(this.KEY) || "dark"; },
  apply() { document.documentElement.dataset.theme = this.get(); },
  toggle() { localStorage.setItem(this.KEY, this.get() === "dark" ? "light" : "dark"); this.apply(); },
};
Theme.apply();
document.addEventListener("click", e => { if (e.target.closest("#theme-btn")) { Theme.toggle(); e.target.closest("#theme-btn").textContent = Theme.get() === "dark" ? "☀ Light mode" : "🌙 Dark mode"; } });

// ---------------------------------------------------------------- badges
const BADGES = [
  ["🌱", "First Steps", "Complete a quiz round", (s, e) => e.xp > 0],
  ["🔥", "On Fire", "3-day streak", (s, e) => e.streak.best >= 3],
  ["⚡", "Unstoppable", "7-day streak", (s, e) => e.streak.best >= 7],
  ["💯", "Centurion", "Earn 100 XP", (s, e) => e.xp >= 100],
  ["🎓", "Scholar", "Earn 500 XP", (s, e) => e.xp >= 500],
  ["🧬", "Mastermind", "Master 1 topic", s => s.progress.countCompleted() >= 1],
  ["🏛", "Polymath", "Master 3 topics", s => s.progress.countCompleted() >= 3],
  ["✅", "Goal Getter", "Finish a custom goal", (s, e) => e.customGoals.some(g => g.done)],
  ["⏱", "Deep Focus", "60 focus minutes", (s, e) => (e.focusMin || 0) >= 60],
  ["💻", "Code Ninja", "Solve a coding challenge", s => Practice.solvedOf(s) >= 1],
  ["🛠", "Problem Solver", "Solve 5 coding challenges", s => Practice.solvedOf(s) >= 5],
  ["👥", "Team Player", "Join a study group", s => Groups.mine(s.email).length > 0],
];
const Badges = {
  count() { const e = Engage.get(); return BADGES.filter(b => b[3](CURRENT, e)).length; },
  html() {
    const e = Engage.get();
    return `<div class="badges">${BADGES.map(([ic, n, d, f]) => `<div class="bdg ${f(CURRENT, e) ? "" : "lock"}"><div class="e">${ic}</div><div class="n">${n}</div><div class="d">${d}</div></div>`).join("")}</div>`;
  },
};

// (the focus timer now lives in timer.js -- Flip Clock & Study Countdown)
