/* ===================================================================
   MODULE 4 -- Login & Integration (part 2 of 3: app core)
   Wires Module 1 (data/graph/models) into runtime Knowledge Graph
   instances, holds shared globals/utilities, the hash router, the
   login/register screen, and the sidebar shell used by every
   Module 3 screen. Loads LAST of all module scripts because it fires
   the app boot (DOMContentLoaded -> render()).
   =================================================================== */

/* ===================================================================
   app.js — routing + screen rendering (Presentation Layer).
   In the original Java project this role belonged to the Swing GUI
   package (MainFrame, LoginFrame, DashboardPanel, RoadmapPanel,
   TopicExplorerPanel, QuizPanel). Same screens, same flow, now HTML.
   =================================================================== */

const root = document.getElementById("app");

// ---- build one Knowledge Graph PER SUBJECT + a Goal per subject (Domain layer wiring) ----
// Each subject (Java, C, C++, Python, DSA, DBMS, OOP...) is its own independent
// graph — prerequisites only make sense within a subject, so they never mix.
const SUBJECT_GRAPHS = new Map(); // subjectId -> KnowledgeGraph
const GOALS = new Map();          // subjectId -> Goal (requiredTopicIds = every topic in that subject)

SEED_SUBJECTS.forEach(subj => {
  const g = new KnowledgeGraph();
  subj.topics.forEach(t => g.addTopic(new Topic(t)));
  subj.edges.forEach(([pre, topic]) => g.addPrerequisite(pre, topic));
  SUBJECT_GRAPHS.set(subj.id, g);
  GOALS.set(subj.id, new Goal({
    id: subj.id,
    title: subj.title,
    description: subj.description,
    requiredTopicIds: subj.topics.map(t => t.id),
  }));
});

function currentGraph() {
  return SUBJECT_GRAPHS.get(CURRENT.activeGoalId);
}
function currentEngine() {
  return new RuleBasedRecommendationEngine(currentGraph(), GOALS);
}

// per-subject accent colour + icon, used to give each track its own identity
const SUBJECT_STYLE = {
  JAVA:   { color: "#EA580C", icon: "☕" },
  C:      { color: "#2563EB", icon: "🅲" },
  CPP:    { color: "#7C3AED", icon: "🎯" },
  PYTHON: { color: "#16A34A", icon: "🐍" },
  DSA:    { color: "#DB2777", icon: "🧩" },
  DBMS:   { color: "#0891B2", icon: "🗄️" },
  OOP:    { color: "#CA8A04", icon: "🧬" },
};
function subjectStyle(id) { return SUBJECT_STYLE[id] || { color: "#4F46E5", icon: "📘" }; }

let CURRENT = null; // active Student

// ---------------------------------------------------------------- utils

function h(strings, ...vals) { return strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ""), ""); }
function esc(str) { const d = document.createElement("div"); d.textContent = str ?? ""; return d.innerHTML; }
function navigate(hash) { location.hash = hash; }
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}
function masteryBadge(score) {
  if (score >= PASS_THRESHOLD) return `<span class="badge mastered">mastered</span>`;
  if (score > 0) return `<span class="badge building">building</span>`;
  return `<span class="badge neutral">not started</span>`;
}
function fmtDate(iso) {
  if (!iso) return "never";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// ---------------------------------------------------------------- router

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  const email = Auth.currentEmail();
  if (email) CURRENT = Store.loadStudent(email);
  render();
});

function render() {
  const hash = location.hash.replace(/^#\/?/, "") || (CURRENT ? "dashboard" : "login");
  const [route, param] = hash.split("/");

  if (!CURRENT) { renderLogin(); return; }

  // Defensive: a profile saved by an older version of this app (before the
  // multi-subject update) may point at a goal id that no longer exists.
  // Instead of crashing into a blank page, just send them back to onboarding.
  if (CURRENT.activeGoalId && !GOALS.has(CURRENT.activeGoalId)) {
    CURRENT.activeGoalId = null;
  }
  if (!CURRENT.activeGoalId && route !== "onboarding") { navigate("/onboarding"); return; }

  try {
    switch (route) {
      case "login": renderLogin(); break;
      case "onboarding": renderOnboarding(); break;
      case "dashboard": renderDashboard(); break;
      case "graph": renderGraph(); break;
      case "roadmap": renderRoadmap(); break;
      case "topic": renderTopicDetail(param); break;
      case "quiz": renderQuiz(param); break;
      case "revision": renderRevision(); break;
      case "analytics": renderAnalytics(); break;
      case "subjects": renderSubjects(); break;
      case "goals": renderGoals(); break;
      case "tutor": renderTutor(param); break;
      case "community": renderCommunity(); break;
      case "explore": renderExplore(); break;
      case "focus": renderFocus(); break;
      case "practice": renderPractice(param); break;
      default: renderDashboard();
    }
  } catch (err) {
    console.error("LearnDNA render error:", err);
    root.innerHTML = `
      <div class="center-screen">
        <div class="auth-card">
          <h1 style="font-size:19px;margin-bottom:10px;">Something went out of sync</h1>
          <p style="color:var(--text-dim);font-size:13.5px;margin-bottom:18px;">
            This usually happens when old saved data doesn't match the current app version.
            Resetting your local profile will fix it — you'll just redo the quick setup.
          </p>
          <button class="btn block" id="reset-btn">Reset &amp; start fresh</button>
        </div>
      </div>`;
    document.getElementById("reset-btn").addEventListener("click", () => {
      Store.clearAll();
      CURRENT = null;
      navigate("/login");
      location.reload();
    });
  }
}

function persist() { Store.saveStudent(CURRENT); }

// ---------------------------------------------------------------- brand

const HELIX_SVG = `<svg class="helix" viewBox="0 0 26 26" fill="none">
  <path d="M6 2c0 6 14 6 14 12s-14 6-14 12" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 2c0 6-14 6-14 12s14 6 14 12" stroke="#FB7185" stroke-width="2" stroke-linecap="round"/>
  <line x1="7.3" y1="6" x2="18.7" y2="6" stroke="#c7c1b2" stroke-width="1.4"/>
  <line x1="13" y1="13" x2="13" y2="13" stroke="#c7c1b2" stroke-width="1.4"/>
  <line x1="7.3" y1="20" x2="18.7" y2="20" stroke="#c7c1b2" stroke-width="1.4"/>
</svg>`;

// ---------------------------------------------------------------- login

function pwField(id, label, ac) {
  return `<div class="field"><label>${label}</label><div class="pw-wrap"><input type="password" id="${id}" autocomplete="${ac}" required><button type="button" class="pw-eye" data-eye="${id}" aria-label="Show or hide password">Show</button></div></div>`;
}

function renderLogin(mode = "login", pre = {}) {
  const reg = mode === "register";
  const $ = (id) => document.getElementById(id);
  root.innerHTML = `
  <div class="auth-split">
    <aside class="auth-side">
      <div class="brand">${HELIX_SVG}<div><div class="brand-name">LearnDNA</div><div class="brand-tag">smart learning engine</div></div></div>
      <div class="side-body">
        <h2>Build your <span class="grad">Knowledge DNA</span> and learn smarter.</h2>
        <p class="side-lede">A prerequisite graph for every topic, a personalized roadmap and adaptive quizzes — all in one place.</p>
        <ul class="side-points">
          <li><span>🧬</span><div><b>Knowledge Graph</b><small>See exactly what to learn first</small></div></li>
          <li><span>🎯</span><div><b>Adaptive Roadmap</b><small>Planned backward from your goal</small></div></li>
          <li><span>🔥</span><div><b>Streaks &amp; Revision</b><small>Stop forgetting what you've learned</small></div></li>
        </ul>
      </div>
      <div class="side-foot">© LearnDNA · VIT Pune</div>
    </aside>
    <section class="auth-main"><div class="auth-card" style="max-width:${reg ? 440 : 410}px;">
      <div class="auth-title"><h1>${reg ? "Create your account" : "Welcome back"}</h1><p>${reg ? "Quick 2-minute setup, then start learning." : "Sign in to pick up where you left off."}</p></div>
      <div class="auth-tabs"><button data-mode="login" class="${reg ? "" : "on"}">Sign in</button><button data-mode="register" class="${reg ? "on" : ""}">Create account</button></div>
      ${pre.notice ? `<div class="explain-box ready" style="margin-bottom:14px;">${esc(pre.notice)}</div>` : ""}
      <form id="auth-form">
        ${reg ? `<div class="field"><label>Full name</label><input type="text" id="f-name" autocomplete="name" value="${esc(pre.name || "")}" required></div>` : ""}
        <div class="field"><label>College email</label><input type="email" id="f-email" autocomplete="email" placeholder="you@vit.edu" value="${esc(pre.email || "")}" required></div>
        ${pwField("f-pass", reg ? "Create password" : "Password", reg ? "new-password" : "current-password")}
        ${reg ? pwField("f-pass2", "Confirm password", "new-password") + `<div class="meter"><span id="meter-bar"></span></div><div id="meter-label" class="hint"></div><ul id="rules" class="rules"></ul>`
              : `<label class="remember"><input type="checkbox" id="f-remember"> Keep me signed in on this device</label>`}
        <button class="btn block" id="auth-btn" type="submit">${reg ? "Create account" : "Sign in"}</button>
      </form>
      <div id="login-error" class="error-msg"></div>
    </div></section>
  </div>`;

  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => renderLogin(b.dataset.mode)));
  root.querySelectorAll("[data-eye]").forEach(b => b.addEventListener("click", () => {
    const i = $(b.dataset.eye), show = i.type === "password";
    i.type = show ? "text" : "password"; b.textContent = show ? "Hide" : "Show";
  }));

  if (reg) {
    const paint = () => {
      const r = Auth.rules($("f-pass").value, $("f-name").value, $("f-email").value);
      const ok = r.filter(x => x[1]).length;
      $("rules").innerHTML = r.map(x => `<li class="${x[1] ? "ok" : ""}">${x[1] ? "✓" : "○"} ${x[0]}</li>`).join("");
      $("meter-bar").style.width = Math.round(ok / r.length * 100) + "%";
      $("meter-bar").style.background = ok <= 2 ? "var(--red)" : ok < r.length ? "var(--amber)" : "var(--green)";
      $("meter-label").textContent = $("f-pass").value ? (ok <= 2 ? "Weak" : ok < r.length ? "Almost there" : "Strong password") : "";
    };
    ["f-pass", "f-name", "f-email"].forEach(id => $(id).addEventListener("input", paint));
    paint();
  }

  $("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("login-error"), btn = $("auth-btn");
    err.textContent = ""; btn.disabled = true;
    try {
      const email = $("f-email").value.trim().toLowerCase(), pw = $("f-pass").value;
      if (reg) {
        if (pw !== $("f-pass2").value) throw new Error("Passwords don't match.");
        CURRENT = await Auth.register($("f-name").value, email, pw);
        Auth.start(email, false);
      } else {
        const old = Store.loadStudent(email);
        if (!Auth.has(email) && old) { renderLogin("register", { email, name: old.name, notice: "This profile was created in an older version (no password). Set a password to claim your progress." }); return; }
        if (!Auth.has(email)) throw new Error("No account found — please use 'Create account' first.");
        CURRENT = await Auth.login(email, pw);
        Auth.start(email, $("f-remember").checked);
      }
      navigate(CURRENT.activeGoalId ? "/dashboard" : "/onboarding");
      render();
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
  });
}

function logout() {
  Assistant.unmount(); Auth.end(); CURRENT = null; QS = null; Tutor.msgs = []; Tutor.topicId = ""; Tutor.pending = null;
  navigate("/login"); render();
}

// ---------------------------------------------------------------- shell

const NAV_ITEMS = [
  ["dashboard", "Dashboard"],
  ["explore", "Explore"],
  ["graph", "Knowledge Graph"],
  ["roadmap", "Roadmap"],
  ["revision", "Revision"],
  ["analytics", "Analytics"],
  ["goals", "Streaks & Goals"],
  ["practice", "Code Practice"],
  ["tutor", "AI Tutor"],
  ["community", "Leaderboard & Groups"],
  ["focus", "Focus Timer"],
  ["subjects", "My Courses"],
];

function shell(route, contentHtml) {
  const style = subjectStyle(CURRENT.activeGoalId);
  root.innerHTML = h`
  <div class="shell" style="--accent:${style.color};">
    <aside class="sidebar">
      <div class="brand">${HELIX_SVG}<div><div class="brand-name">LearnDNA</div><div class="brand-tag">smart learning engine</div></div></div>
      <nav class="nav">
        ${NAV_ITEMS.map(([r, label]) => `<a href="#/${r}" class="${route === r ? "active" : ""}"><span class="dot"></span>${label}</a>`).join("")}
      </nav>
      <div class="sidebar-footer">
        <div class="who">${esc(CURRENT.name)}</div>
        <a class="subject-pill" href="#/subjects" style="border-color:${style.color};color:${style.color};">${style.icon} ${esc(GOALS.get(CURRENT.activeGoalId)?.title ?? "")} · switch</a>
        <button id="theme-btn" style="margin-right:6px;">${Theme.get() === "dark" ? "☀ Light mode" : "🌙 Dark mode"}</button><button id="logout-btn">Sign out</button>
      </div>
    </aside>
    <main class="main">${contentHtml}</main>
  </div>`;
  document.getElementById("logout-btn").addEventListener("click", logout);
  Assistant.mount();
}
