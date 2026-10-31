/* ===================================================================
   MODULE 6 -- Code Practice (part 2 of 2): language engines, state, XP,
   the course-wise challenge list (#/practice) and the Code Scratchpad (#/practice/<id>).

   Every course has its own challenges (challenges-<course>.js), shown in the order of that
   course's roadmap (prerequisites first). A challenge has a language:
     javascript  Web Worker sandbox (offline)                    -> DSA, OOP
     python      Pyodide (Python in WebAssembly, CDN, cached)     -> Python
     sql         sql.js  (SQLite in WebAssembly, CDN, cached)     -> DBMS, SQL tasks
     java/c/cpp  remote compiler (Judge0 API)                     -> Java, C, C++

   State lives on student.engage.practice (persisted by Store like the rest of the engagement data):
     practice = { solved: {id: {at, xp}}, drafts: {id: [{name, at, code}]}, code: {id: lastCode}, peeked: {id: true} }
   =================================================================== */

const LANGS = {
  javascript: { label: "JavaScript (Sandbox)", tab: "  ", io: "js",  note: "JavaScript runs in an isolated Web Worker with a 3-second limit." },
  python:     { label: "Python 3",             tab: "    ", io: "stdin", note: "Python runs in your browser (Pyodide). The first run downloads the engine from a CDN - it needs internet once, then it is cached." },
  sql:        { label: "SQL (SQLite)",         tab: "  ", io: "sql", note: "SQL runs in your browser on SQLite (sql.js, loaded from a CDN on first use)." },
  java:       { label: "Java",                 tab: "    ", io: "stdin", remote: true, note: "Java is compiled on a remote compiler server (Judge0) - internet required. Class must be named Main." },
  c:          { label: "C",                    tab: "    ", io: "stdin", remote: true, note: "C is compiled on a remote compiler server (Judge0) - internet required." },
  cpp:        { label: "C++",                  tab: "    ", io: "stdin", remote: true, note: "C++ is compiled on a remote compiler server (Judge0) - internet required." },
};

// ================================================================ engine 1: JavaScript (Worker / iframe)
// This function's source is injected into the Worker / iframe, so it must be self-contained.
function _sandboxJob() {
  const MAX_CHARS = 20000;
  self.addEventListener("message", (ev) => {
    const d = ev.data || {};
    if (typeof d.code !== "string") return;
    const out = []; let size = 0, err = null;
    const fmt = (a) => {
      if (typeof a === "string") return a;
      try { const j = JSON.stringify(a); return j === undefined ? String(a) : j; } catch (e) { return String(a); }
    };
    const log = (...args) => { const s = args.map(fmt).join(" "); if (size < MAX_CHARS) { out.push(s); size += s.length; } };
    console.log = console.info = console.warn = console.error = log;
    self.input = d.input;
    try { (0, eval)(d.code); } catch (e) { err = (e && e.name ? e.name + ": " : "") + (e && e.message !== undefined ? e.message : String(e)); }
    setTimeout(() => {
      const msg = { out: out.join("\n"), err };
      if (self.parent && self.parent !== self) self.parent.postMessage(msg, "*"); else self.postMessage(msg);
    }, 0);
  });
}

function runSandboxed(code, input, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    let done = false, cleanup = () => {};
    const finish = (r) => {
      if (done) return; done = true; clearTimeout(timer); cleanup();
      resolve({ out: "", err: null, timedOut: false, ...r, ms: Math.round(performance.now() - t0) });
    };
    const timer = setTimeout(() => finish({ timedOut: true }), timeoutMs);

    const viaIframe = () => {
      const f = document.createElement("iframe");
      f.setAttribute("sandbox", "allow-scripts"); f.style.display = "none";
      const onMsg = (ev) => { if (ev.source === f.contentWindow && ev.data && "out" in ev.data) finish({ out: ev.data.out, err: ev.data.err }); };
      window.addEventListener("message", onMsg);
      cleanup = () => { window.removeEventListener("message", onMsg); f.remove(); };
      f.srcdoc = `<!doctype html><script>(${_sandboxJob.toString()})()<\/script>`;
      f.onload = () => f.contentWindow.postMessage({ code, input }, "*");
      document.body.appendChild(f);
    };

    if (Practice.noWorker) { viaIframe(); return; }
    try {
      const url = URL.createObjectURL(new Blob([`(${_sandboxJob.toString()})()`], { type: "text/javascript" }));
      const w = new Worker(url);
      cleanup = () => { w.terminate(); URL.revokeObjectURL(url); };
      w.onmessage = (ev) => finish({ out: ev.data.out, err: ev.data.err });
      w.onerror = (ev) => { if (done) return; if (ev.preventDefault) ev.preventDefault(); Practice.noWorker = true; cleanup(); viaIframe(); };
      w.postMessage({ code, input });
    } catch (e) { Practice.noWorker = true; viaIframe(); }
  });
}

// ================================================================ engines 2 + 3: Python (Pyodide) and SQL (sql.js)
// Both run in a persistent Web Worker that loads a WebAssembly runtime from a CDN once.
// Worker protocol: -> {type:"ready"} | {type:"initError", error}   and   {type:"run",...} -> {type:"result", out, err, ms}
function _pyWorkerJob() {
  const BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  let py = null;
  const PY = [
    "import sys, io, traceback",
    "__out = io.StringIO()",
    "sys.stdin = io.StringIO(__inp); sys.stdout = __out; sys.stderr = __out",
    "__err = None",
    "try:",
    "    exec(compile(__src, 'main.py', 'exec'), {'__name__': '__main__'})",
    "except BaseException as e:",
    "    __err = ''.join(traceback.format_exception_only(type(e), e)).strip()",
    "sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__",
    "(__out.getvalue(), __err)",
  ].join("\n");
  const init = (async () => {
    importScripts(BASE + "pyodide.js");
    py = await loadPyodide({ indexURL: BASE });
    self.postMessage({ type: "ready" });
  })().catch((e) => self.postMessage({ type: "initError", error: String((e && e.message) || e) }));
  self.onmessage = async (ev) => {
    const d = ev.data;
    if (!d || d.type !== "run") return;
    await init;
    if (!py) return;
    const t0 = performance.now();
    try {
      await py.loadPackagesFromImports(d.code);
      py.globals.set("__src", d.code); py.globals.set("__inp", d.input);
      const res = await py.runPythonAsync(PY);
      const arr = res.toJs ? res.toJs() : res;
      self.postMessage({ type: "result", out: arr[0], err: arr[1] || null, ms: Math.round(performance.now() - t0) });
    } catch (e) {
      self.postMessage({ type: "result", out: "", err: String((e && e.message) || e), ms: Math.round(performance.now() - t0) });
    }
  };
}

function _sqlWorkerJob() {
  const BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/";
  let SQL = null;
  const init = (async () => {
    importScripts(BASE + "sql-wasm.js");
    SQL = await initSqlJs({ locateFile: (f) => BASE + f });
    self.postMessage({ type: "ready" });
  })().catch((e) => self.postMessage({ type: "initError", error: String((e && e.message) || e) }));
  self.onmessage = async (ev) => {
    const d = ev.data;
    if (!d || d.type !== "run") return;
    await init;
    if (!SQL) return;
    const t0 = performance.now();
    let out = "", err = null;
    const db = new SQL.Database();
    try {
      const res = await db.exec(d.script);
      const last = res.length ? res[res.length - 1] : null;      // like the sqlite3 shell: show the last result set
      if (last) out = last.values.map((r) => r.map((v) => (v === null ? "" : String(v))).join("|")).join("\n");
    } catch (e) { err = String((e && e.message) || e); }
    try { db.close(); } catch (e) {}
    self.postMessage({ type: "result", out, err, ms: Math.round(performance.now() - t0) });
  };
}

class CdnEngine {
  constructor(job, name) { this.job = job; this.name = name; this.worker = null; this.ready = false; this.pending = null; this.onReady = null; }
  start() {
    const url = URL.createObjectURL(new Blob([`(${this.job.toString()})()`], { type: "text/javascript" }));
    const w = this.worker = new Worker(url);
    this.ready = false;
    w.onmessage = (ev) => {
      const d = ev.data || {};
      if (d.type === "ready") { this.ready = true; if (this.onReady) this.onReady(); }
      else if (d.type === "initError") this.fail(`Could not load the ${this.name} engine from the CDN - check your internet connection. (${d.error})`);
      else if (d.type === "result" && this.pending) { const p = this.pending; this.pending = null; p(d); }
    };
    w.onerror = (ev) => { if (ev.preventDefault) ev.preventDefault(); this.fail(`The ${this.name} engine could not start in this browser (${ev.message || "blocked"}).`); };
  }
  reset() { try { if (this.worker) this.worker.terminate(); } catch (e) {} this.worker = null; this.ready = false; this.onReady = null; }
  fail(msg) { const p = this.pending; this.pending = null; this.reset(); if (p) p({ type: "result", out: "", err: msg, net: true, ms: 0 }); }

  /** payload: fields sent to the worker; runMs: time limit once the engine is loaded. */
  run(payload, runMs, onStatus) {
    return new Promise((resolve) => {
      if (this.pending) this.fail("Another run was still in progress.");
      if (!this.worker) this.start();
      let timer;
      const arm = (ms) => { clearTimeout(timer); timer = setTimeout(() => { this.pending = null; this.reset(); resolve({ out: "", err: null, timedOut: true, ms: runMs }); }, ms); };
      this.pending = (d) => { clearTimeout(timer); resolve({ out: d.out || "", err: d.err || null, timedOut: false, net: !!d.net, ms: d.ms }); };
      if (this.ready) arm(runMs);
      else { if (onStatus) onStatus(`⏳ Loading the ${this.name} engine (first run only)…`); arm(120000); this.onReady = () => arm(runMs); }
      this.worker.postMessage({ type: "run", ...payload });
    });
  }
}
const PyEngine = new CdnEngine(_pyWorkerJob, "Python");
const SqlEngine = new CdnEngine(_sqlWorkerJob, "SQL");

// ================================================================ engine 4: remote compiler (Judge0) for Java / C / C++
const JUDGE_IDS = { java: 62, c: 50, cpp: 54 };       // Judge0 CE language ids
const judgeUrl = () => (localStorage.getItem("learndna:judge0") || "https://ce.judge0.com").replace(/\/+$/, "");

async function runJudge(lang, code, input) {
  const t0 = performance.now();
  const base = judgeUrl();
  const done = (r) => ({ out: "", err: null, timedOut: false, net: false, ...r, ms: Math.round(performance.now() - t0) });
  try {
    const sub = await fetch(`${base}/submissions?base64_encoded=false&wait=false`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_code: code, language_id: JUDGE_IDS[lang], stdin: input, cpu_time_limit: 3, wall_time_limit: 10 }),
    });
    if (!sub.ok) throw new Error(`server answered ${sub.status}`);
    const { token } = await sub.json();
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, i < 3 ? 500 : 900));
      const res = await fetch(`${base}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time`);
      if (!res.ok) throw new Error(`server answered ${res.status}`);
      const j = await res.json();
      const id = j.status ? j.status.id : 0;
      if (id <= 2) continue;                                              // 1 = in queue, 2 = processing
      if (id === 6) return done({ out: "", err: (j.compile_output || "Compilation error").trim() });
      if (id === 5) return done({ out: j.stdout || "", timedOut: true });
      if (id >= 7) return done({ out: j.stdout || "", err: (j.stderr || j.message || j.status.description || "Runtime error").trim() });
      return done({ out: j.stdout || "", ms: j.time ? Math.round(parseFloat(j.time) * 1000) : undefined });
    }
    return done({ timedOut: true });
  } catch (e) {
    return done({ net: true, err: `Could not reach the compiler server (${base}). Check your internet connection, or set another Judge0 server with "⚙ Compiler server". (${e.message})` });
  }
}

// ================================================================ one entry point for all languages
function buildSql(ch, user, input) { return ch.tpl.split("{{USER}}").join(user).split("{{INPUT}}").join(input); }

async function runChallenge(ch, code, input, onStatus) {
  switch (ch.lang) {
    case "python": return PyEngine.run({ code, input }, /numpy|pandas/.test(code) ? 40000 : 6000, onStatus);
    case "sql":    return SqlEngine.run({ script: buildSql(ch, code, input) }, 6000, onStatus);
    case "java": case "c": case "cpp": return runJudge(ch.lang, code, input);
    default:       return runSandboxed(code, input);
  }
}
const normOut = (s) => String(s || "").replace(/\r/g, "").split("\n").map(l => l.trimEnd()).join("\n").trim();

// ================================================================ state + XP
const Practice = {
  noWorker: false,
  filter: { subject: null, topic: "All", q: "", board: "week" },

  get(s = CURRENT) {
    const e = Engage.get(s);
    if (!e.practice) e.practice = { solved: {}, drafts: {}, code: {}, peeked: {} };
    e.practice.peeked = e.practice.peeked || {};
    return e.practice;
  },
  solvedOf(s) { return Object.keys(s.engage?.practice?.solved || {}).length; },       // works on raw JSON students too
  byId(id) { return CHALLENGES.find(c => c.id === id); },
  isSolved(id) { return !!this.get().solved[id]; },
  xpEarned() { return Object.values(this.get().solved).reduce((t, x) => t + (x.xp || 0), 0); },

  subject(id) { return SEED_SUBJECTS.find(s => s.id === id); },
  /** topic ids of a course in roadmap order (prerequisites first; ties keep the course's own order) */
  topicOrder(subjectId) {
    const s = this.subject(subjectId); if (!s) return [];
    const indeg = new Map(s.topics.map(t => [t.id, 0]));
    (s.edges || []).forEach(([, to]) => indeg.set(to, (indeg.get(to) || 0) + 1));
    const order = [], left = s.topics.map(t => t.id);
    while (left.length) {
      const i = left.findIndex(id => indeg.get(id) === 0); const id = left.splice(i < 0 ? 0 : i, 1)[0];
      order.push(id); (s.edges || []).forEach(([from, to]) => { if (from === id) indeg.set(to, indeg.get(to) - 1); });
    }
    return order;
  },
  topicTitle(subjectId, topicId) { return this.subject(subjectId)?.topics.find(t => t.id === topicId)?.title || topicId; },
  /** challenges of a course, sorted by roadmap order */
  forCourse(subjectId) {
    const order = this.topicOrder(subjectId);
    return CHALLENGES.filter(c => c.subject === subjectId)
      .map((c, i) => ({ c, i })).sort((a, b) => order.indexOf(a.c.topic) - order.indexOf(b.c.topic) || a.i - b.i).map(x => x.c);
  },

  /** Called once all tests pass. Returns XP granted (0 if the challenge was already solved). */
  award(ch) {
    const P = this.get();
    if (P.solved[ch.id]) return 0;
    const gain = P.peeked[ch.id] ? Math.max(5, Math.round(ch.xp * 0.25)) : ch.xp;
    const e = Engage.get(), t = Engage.today();
    const a = e.activity[t] || (e.activity[t] = { q: 0, c: 0, xp: 0 });
    e.xp += gain; a.xp += gain; a.code = (a.code || 0) + 1;
    P.solved[ch.id] = { at: Date.now(), xp: gain };
    persist();
    return gain;
  },
};

// ================================================================ list page
function practiceCourse() {
  const id = CURRENT.activeGoalId;
  const list = Practice.forCourse(id);
  return { id, list, title: Practice.subject(id)?.title || "this course" };
}

function practiceRowsHtml() {
  const { id, list } = practiceCourse();
  const f = Practice.filter, q = f.q.trim().toLowerCase();
  const rows = list.map((c, i) => ({ c, i })).filter(({ c }) =>
    (f.topic === "All" || c.topic === f.topic) &&
    (!q || (c.title + " " + Practice.topicTitle(id, c.topic) + " " + c.difficulty + " " + LANGS[c.lang].label).toLowerCase().includes(q)));
  if (!rows.length) return `<div class="empty" style="padding:26px 0;">No challenges match - try another topic or clear the search.</div>`;
  return rows.map(({ c, i }) => `
    <a class="pr-row" href="#/practice/${c.id}">
      <span class="pr-idx">${String(i + 1).padStart(2, "0")}</span>
      <span class="pr-title">${esc(c.title)}${Practice.isSolved(c.id) ? ` <span class="pr-done" title="Solved">✓</span>` : ""}<small class="pr-lang-tag">${esc(LANGS[c.lang].label)}</small></span>
      <span class="pr-cat">${esc(Practice.topicTitle(id, c.topic))}</span>
      <span class="pr-diff ${c.difficulty}">${c.difficulty}</span>
      <span class="btn small pr-go">${Practice.isSolved(c.id) ? "Review" : "Solve"} →</span>
    </a>`).join("");
}

function practiceBoardHtml() {
  const byEmail = Object.fromEntries(Store.listStudents().map(s => [s.email, s]));
  byEmail[CURRENT.email] = JSON.parse(JSON.stringify(CURRENT));                    // freshest copy of me
  const weekly = Practice.filter.board === "week";
  const rows = Object.values(byEmail).map(s => ({
    email: s.email, name: s.name, solved: Practice.solvedOf(s),
    xp: weekly ? Engage.weekXp(s) : Engage.xpOf(s),
  })).sort((a, b) => b.xp - a.xp || b.solved - a.solved).slice(0, 8);
  return rows.map((r, i) => `
    <div class="pr-lb ${r.email === CURRENT.email ? "me" : ""}">
      <span class="pr-lb-rank">${["🥇", "🥈", "🥉"][i] || i + 1}</span>
      <span class="pr-lb-who"><b>${esc(r.name)}${r.email === CURRENT.email ? " (you)" : ""}</b><small>${r.solved} solved</small></span>
      <span class="pr-lb-xp">${r.xp} XP</span>
    </div>`).join("");
}

function renderPractice(id) {
  const ch = id && Practice.byId(id);
  if (ch) { renderScratchpad(ch); return; }

  const { id: courseId, list, title } = practiceCourse();
  const P = Practice.get(), f = Practice.filter;
  if (f.subject !== courseId) { f.subject = courseId; f.topic = "All"; f.q = ""; }      // new course -> reset the filters
  const solvedHere = list.filter(c => P.solved[c.id]);
  const xpHere = solvedHere.reduce((t, c) => t + P.solved[c.id].xp, 0);
  const diff = (d) => `${solvedHere.filter(c => c.difficulty === d).length}/${list.filter(c => c.difficulty === d).length}`;
  const topics = Practice.topicOrder(courseId).filter(t => list.some(c => c.topic === t));

  shell("practice", `
    <div class="page-head"><div class="eyebrow">code practice · ${esc(title)}</div><h1>Hi, ${esc(CURRENT.name.split(" ")[0])}! Practice. Solve. Level up.</h1>
      <p class="lede">Coding challenges for <b>${esc(title)}</b>, arranged in the order of your roadmap - one set per topic, in the course's own language. Every solved challenge earns XP for the leaderboard.</p></div>

    <div class="grid cols-3" style="margin-bottom:16px;">
      <div class="card"><h3>✅ Solved</h3><div class="stat">${solvedHere.length}<span style="font-size:16px;color:var(--text-faint);"> / ${list.length}</span></div>
        <div class="mastery-bar" style="margin-top:10px;"><span style="width:${list.length ? Math.round(solvedHere.length / list.length * 100) : 0}%"></span></div></div>
      <div class="card"><h3>⭐ Practice XP</h3><div class="stat">${xpHere}<span style="font-size:16px;color:var(--text-faint);"> XP</span></div>
        <div class="stat-label">Easy ${PRACTICE_XP.Easy} · Medium ${PRACTICE_XP.Medium} · Hard ${PRACTICE_XP.Hard} per challenge</div></div>
      <div class="card"><h3>📊 By difficulty</h3><div class="pr-diffstat"><span class="pr-diff Easy">Easy ${diff("Easy")}</span><span class="pr-diff Medium">Medium ${diff("Medium")}</span><span class="pr-diff Hard">Hard ${diff("Hard")}</span></div></div>
    </div>

    <div class="pr-layout">
      <div class="card">
        <h3 style="font-size:16px;color:var(--text);">${esc(title)} - Coding Challenges</h3>
        <div class="pr-chips"><button class="pr-chip ${f.topic === "All" ? "on" : ""}" data-topic="All">All topics</button>${topics.map(t => `<button class="pr-chip ${f.topic === t ? "on" : ""}" data-topic="${esc(t)}">${esc(Practice.topicTitle(courseId, t))}</button>`).join("")}</div>
        <input id="pr-search" class="pr-search" placeholder="Search challenges…" value="${esc(f.q)}" autocomplete="off">
        <div id="pr-rows">${practiceRowsHtml()}</div>
      </div>
      <div class="card">
        <div class="pr-lb-head"><h3 style="font-size:16px;color:var(--text);margin:0;">Leaderboard</h3><span class="badge neutral">this device</span></div>
        <div class="seg" style="margin:12px 0 8px;"><button data-board="week" class="${f.board === "week" ? "on" : ""}">Weekly</button><button data-board="all" class="${f.board === "all" ? "on" : ""}">All-time</button></div>
        <div id="pr-board">${practiceBoardHtml()}</div>
        <div class="hint" style="margin-top:10px;">Switch course from the sidebar to practise another subject. XP is shared with the quiz system.</div>
      </div>
    </div>`);

  root.querySelectorAll("[data-topic]").forEach(b => b.addEventListener("click", () => { f.topic = b.dataset.topic; renderPractice(); }));
  root.querySelectorAll("[data-board]").forEach(b => b.addEventListener("click", () => { f.board = b.dataset.board; renderPractice(); }));
  document.getElementById("pr-search").addEventListener("input", (ev) => { f.q = ev.target.value; document.getElementById("pr-rows").innerHTML = practiceRowsHtml(); });
}

// ================================================================ scratchpad page
function renderScratchpad(ch) {
  const P = Practice.get();
  const L = LANGS[ch.lang];
  const saved = P.solved[ch.id];
  const startCode = P.code[ch.id] ?? ch.starter;
  const sample = ch.tests[0];
  const topicName = Practice.topicTitle(ch.subject, ch.topic);
  const draftOpts = () => `<option value="">Load Saved Draft…</option>${(P.drafts[ch.id] || []).map((d, i) => `<option value="${i}">${esc(d.name)}</option>`).join("")}`;
  const course = Practice.forCourse(ch.subject), next = course[course.indexOf(ch) + 1];
  const isSql = ch.lang === "sql";
  let busy = false, saveT;

  shell("practice", `
    <a class="pr-back" href="#/practice">← All challenges</a>
    <div class="pr-titlebar">
      <h1>${esc(ch.title)}</h1>
      <span class="pr-diff ${ch.difficulty}">${ch.difficulty}</span><span class="badge neutral">${esc(topicName)}</span>
      <span class="badge neutral">${esc(L.label)}</span>
      <span class="badge ${saved ? "mastered" : "building"}">${saved ? `Solved · +${saved.xp} XP` : `+${ch.xp} XP`}</span>
    </div>

    <div class="card pr-problem">
      <p>${esc(ch.statement).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>")}</p>
      ${ch.schema ? `<p class="hint" style="margin-top:8px;"><b>${isSql ? "Tables" : "Model"}:</b> <code>${esc(ch.schema)}</code></p>` : ""}
      <p class="hint" style="margin-top:8px;"><b>Input / output:</b> ${esc(ch.format)}</p>
      <div class="pr-help">
        <button class="btn ghost small" id="pr-hint">💡 Hint</button>
        <button class="btn ghost small" id="pr-sol" title="Viewing the solution before solving reduces the XP to 25%">Show solution</button>
        ${L.remote ? `<button class="btn ghost small" id="pr-judge" title="Use a different Judge0 compiler server">⚙ Compiler server</button>` : ""}
      </div>
      <div id="pr-help-box"></div>
    </div>

    <div class="card pr-scratch">
      <div class="pr-scratch-head">
        <div><h2>Code Scratchpad</h2><p class="hint">Write, test and save algorithmic drafts</p></div>
        <div class="pr-drafts"><select id="pr-draft-sel" class="mini-select">${draftOpts()}</select><button class="btn ghost small" id="pr-save">Save Draft</button></div>
      </div>
      <div class="pr-work">
        <div class="pr-editor">
          <div class="pr-toolbar">
            <span class="pr-lang">${esc(L.label)}</span>
            <span class="pr-spacer"></span>
            <button class="btn small" id="pr-run">▶ Run Code</button>
            <button class="btn small pr-submit" id="pr-submit">Submit</button>
            <button class="btn ghost small" id="pr-reset">Reset</button>
            <button class="btn ghost small" id="pr-copy">Copy</button>
          </div>
          <textarea id="pr-code" class="pr-code" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off">${esc(startCode)}</textarea>
        </div>
        <div class="pr-io">
          <div class="pr-label">${isSql ? "Test data (INSERT statements)" : "Input (stdin)"}</div>
          <textarea id="pr-input" class="pr-box pr-in" spellcheck="false" rows="3">${esc(sample.input)}</textarea>
          <div class="pr-label">Console / execution output</div>
          <pre id="pr-out" class="pr-box pr-outbox"><span class="pr-muted">Press Run Code (Ctrl+Enter)</span></pre>
          <div id="pr-verdict" class="pr-verdict" hidden></div>
        </div>
      </div>
      <div id="pr-tests"></div>
      <div class="hint" style="margin-top:12px;">${ch.lang === "javascript" ? "Your program reads the global string <code>input</code> and prints with <code>console.log</code>." : isSql ? "Your SQL runs after the test data. The result of the last SELECT is the output (rows shown as <code>a|b|c</code>)." : "Your program reads from standard input and prints to standard output."} ${esc(L.note)} Drafts are stored privately in this browser.</div>
    </div>`);

  const $ = (x) => document.getElementById(x);
  const ed = $("pr-code"), inp = $("pr-input"), out = $("pr-out"), verdict = $("pr-verdict");

  const setVerdict = (cls, html) => { verdict.hidden = !html; verdict.className = "pr-verdict " + cls; verdict.innerHTML = html || ""; };
  const status = (msg) => { out.innerHTML = `<span class="pr-muted">${esc(msg)}</span>`; };
  const showResult = (r) => {
    if (r.timedOut) { out.innerHTML = `<span class="pr-err">⏱ Time limit exceeded - check for an infinite loop or slow code.</span>`; return; }
    const parts = [];
    if (r.out) parts.push(esc(r.out));
    if (r.err) parts.push(`<span class="pr-err">${esc(r.err)}</span>`);
    out.innerHTML = parts.join("\n") || `<span class="pr-muted">(no output)</span>`;
  };
  const busyUI = (on) => { busy = on; ["pr-run", "pr-submit"].forEach(i => $(i).disabled = on); $("pr-run").textContent = on ? "Running…" : "▶ Run Code"; };
  const keepCode = () => { clearTimeout(saveT); saveT = setTimeout(() => { P.code[ch.id] = ed.value; persist(); }, 500); };

  ed.addEventListener("input", keepCode);
  ed.addEventListener("keydown", (ev) => {
    if (ev.key === "Tab") {                                       // Tab inserts spaces instead of leaving the editor
      ev.preventDefault();
      const s = ed.selectionStart, e2 = ed.selectionEnd;
      ed.value = ed.value.slice(0, s) + L.tab + ed.value.slice(e2); ed.selectionStart = ed.selectionEnd = s + L.tab.length; keepCode();
    } else if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") { ev.preventDefault(); $("pr-run").click(); }
  });

  $("pr-run").addEventListener("click", async () => {
    if (busy) return; busyUI(true); setVerdict("", ""); $("pr-tests").innerHTML = ""; status("Running…");
    const input = inp.value.replace(/\r/g, "");
    const r = await runChallenge(ch, ed.value, input, status);
    busyUI(false); showResult(r); P.code[ch.id] = ed.value; persist();
    const known = ch.tests.find(t => t.input.trim() === input.trim());
    if (r.net) setVerdict("bad", "✕ Engine / network problem - see the message above");
    else if (r.timedOut || r.err) setVerdict("bad", `✕ ${r.timedOut ? "Time limit exceeded" : ch.lang === "sql" ? "SQL error" : "Compile / runtime error"}`);
    else if (known) { const ok = normOut(r.out) === known.expected; setVerdict(ok ? "ok" : "bad", ok ? `✓ Correct on this sample (${r.ms} ms)` : `✕ Expected:<br><code style="white-space:pre-wrap">${esc(known.expected)}</code>`); }
    else setVerdict("info", `Finished in ${r.ms} ms`);
  });

  $("pr-submit").addEventListener("click", async () => {
    if (busy) return; busyUI(true); setVerdict("", "");
    const rows = []; let netErr = null;
    for (let i = 0; i < ch.tests.length; i++) {
      status(`Running test ${i + 1} of ${ch.tests.length}…`);
      const t = ch.tests[i], r = await runChallenge(ch, ed.value, t.input, status);
      if (r.net) { netErr = r; break; }
      rows.push({ t, r, pass: !r.err && !r.timedOut && normOut(r.out) === t.expected });
    }
    busyUI(false); P.code[ch.id] = ed.value;
    if (netErr) { persist(); showResult(netErr); setVerdict("bad", "✕ Could not run the tests - nothing was graded"); $("pr-tests").innerHTML = ""; return; }
    const passed = rows.filter(x => x.pass).length, all = passed === rows.length;
    out.innerHTML = `<span class="${all ? "pr-ok" : "pr-err"}">${passed} / ${rows.length} test cases passed</span>`;
    let gain = 0; if (all) gain = Practice.award(ch); else persist();
    setVerdict(all ? "ok" : "bad", all
      ? (gain ? `🎉 Accepted! +${gain} XP${P.peeked[ch.id] ? " (reduced - solution was viewed)" : ""}` : "✓ Accepted - already solved earlier, no extra XP.")
      : `✕ ${rows.length - passed} test case${rows.length - passed === 1 ? "" : "s"} failed - see details below.`);
    if (gain) toast(`✅ ${ch.title} solved! +${gain} XP`);
    const cell = (s) => `<code style="white-space:pre-wrap">${esc(String(s).slice(0, 160))}</code>`;
    $("pr-tests").innerHTML = `
      <table class="board pr-testtbl"><thead><tr><th></th><th>${isSql ? "Test data" : "Input"}</th><th>Expected</th><th>Your output</th><th>Time</th></tr></thead><tbody>
      ${rows.map((x, i) => `<tr class="${x.pass ? "pass" : "fail"}"><td>${x.pass ? "✓" : "✕"} #${i + 1}</td>
        <td>${cell(x.t.input.replace(/\n/g, " ⏎ ").slice(0, 70))}</td><td>${cell(x.t.expected)}</td>
        <td>${cell(x.r.timedOut ? "time limit exceeded" : x.r.err ? x.r.err : normOut(x.r.out) || "(empty)")}</td><td>${x.r.ms ?? ""} ms</td></tr>`).join("")}</tbody></table>
      ${all && next ? `<div style="margin-top:12px;"><a class="btn small" href="#/practice/${next.id}">Next: ${esc(next.title)} →</a></div>` : ""}`;
    if (gain) { const b = document.querySelector(".pr-titlebar .badge.building"); if (b) { b.className = "badge mastered"; b.textContent = `Solved · +${gain} XP`; } }
  });

  $("pr-reset").addEventListener("click", () => { ed.value = ch.starter; inp.value = sample.input; delete P.code[ch.id]; persist(); setVerdict("", ""); $("pr-tests").innerHTML = ""; out.innerHTML = `<span class="pr-muted">Starter code restored.</span>`; });
  $("pr-copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(ed.value); } catch { ed.select(); document.execCommand("copy"); }
    toast("Code copied");
  });

  $("pr-save").addEventListener("click", () => {
    const list = P.drafts[ch.id] || (P.drafts[ch.id] = []);
    const name = `Draft ${list.length + 1} · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    list.unshift({ name, at: Date.now(), code: ed.value }); if (list.length > 10) list.pop();
    P.code[ch.id] = ed.value; persist(); $("pr-draft-sel").innerHTML = draftOpts(); toast("Draft saved");
  });
  $("pr-draft-sel").addEventListener("change", (ev) => {
    const d = (P.drafts[ch.id] || [])[+ev.target.value]; if (!d) return;
    ed.value = d.code; P.code[ch.id] = d.code; persist(); toast(`Loaded ${d.name}`); ev.target.value = "";
  });

  $("pr-hint").addEventListener("click", () => { $("pr-help-box").innerHTML = `<div class="explain-box ready" style="margin-top:10px;">💡 ${esc(ch.hint)}</div>`; });
  $("pr-sol").addEventListener("click", () => {
    if (!P.solved[ch.id] && !P.peeked[ch.id]) {
      if (!confirm("Show the model solution? If you solve this challenge after viewing it, you only earn 25% of the XP.")) return;
      P.peeked[ch.id] = true; persist();
    }
    $("pr-help-box").innerHTML = `<pre class="pr-solution">${esc(ch.solutionCode)}</pre>`;
  });
  const jb = $("pr-judge");
  if (jb) jb.addEventListener("click", () => {
    const v = prompt("Judge0 compiler server URL (leave empty for the default https://ce.judge0.com):", localStorage.getItem("learndna:judge0") || "");
    if (v === null) return;
    if (v.trim()) localStorage.setItem("learndna:judge0", v.trim()); else localStorage.removeItem("learndna:judge0");
    toast("Compiler server updated");
  });
}
