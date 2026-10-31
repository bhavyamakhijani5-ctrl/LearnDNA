/* ===================================================================
   MODULE 3 -- Dashboard, Roadmap & Analytics UI
   Everything the learner looks at once logged in: course picker +
   self-assessment, dashboard, roadmap, knowledge-graph explorer,
   topic detail (with external links/videos), revision planner and
   analytics. Depends on globals from Module 4/core.js (h, esc, shell,
   navigate, toast, CURRENT, GOALS, SUBJECT_GRAPHS, currentGraph,
   subjectStyle, persist) and the Module 1 / Module 2 classes.
   =================================================================== */

// ---------------------------------------------------------------- learning links
function topicLinks(t) {
  const q = encodeURIComponent(t.title.toLowerCase().includes(t.domain.toLowerCase()) ? t.title : `${t.title} ${t.domain}`);
  const g = (extra) => `https://www.google.com/search?q=${q}+${extra}`;
  return [
    ["▶ YouTube tutorial", `https://www.youtube.com/results?search_query=${q}+tutorial`],
    ["🎓 Full course (YouTube)", `https://www.youtube.com/results?search_query=${q}+full+course`],
    ["📚 GeeksforGeeks", g("site:geeksforgeeks.org")],
    ["📖 W3Schools / Docs", g("site:w3schools.com")],
    ["🧪 Practice problems", g("practice+problems+site:hackerrank.com+OR+site:leetcode.com")],
    ["🏫 NPTEL / freeCodeCamp", g("site:nptel.ac.in+OR+site:freecodecamp.org")],
  ];
}
function chips(t, all) {
  const l = topicLinks(t);
  return (all ? l : [l[0], l[4], l[1]]).map(([n, u]) => `<a class="chip" href="${u}" target="_blank" rel="noopener noreferrer">${n}</a>`).join("");
}
async function loadVideos(t, el) {
  if (!el) return;
  const key = localStorage.getItem("learndna:ytkey");
  const keyBox = (msg) => {
    el.innerHTML = `${msg || ""}<div class="yt-key"><input id="yt-key" placeholder="YouTube Data API v3 key (optional)"><button class="btn small" id="yt-save">Save &amp; load</button></div><p class="hint">The YouTube links above already work without a key. A free key is available from Google Cloud Console.</p>`;
    document.getElementById("yt-save").onclick = () => { const v = document.getElementById("yt-key").value.trim(); if (v) { localStorage.setItem("learndna:ytkey", v); loadVideos(t, el); } };
  };
  if (!key) return keyBox();
  el.innerHTML = `<p class="hint">Loading videos…</p>`;
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=4&q=${encodeURIComponent(t.title + " " + t.domain + " tutorial")}&key=${encodeURIComponent(key)}`);
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || "YouTube API error");
    el.innerHTML = `<div class="yt-grid">${d.items.map(v => `<a class="yt-card" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=${v.id.videoId}"><img src="${v.snippet.thumbnails.medium.url}" alt=""><span>${esc(v.snippet.title)}</span><small>${esc(v.snippet.channelTitle)}</small></a>`).join("")}</div><button class="btn ghost small" id="yt-clear">Change API key</button>`;
    document.getElementById("yt-clear").onclick = () => { localStorage.removeItem("learndna:ytkey"); loadVideos(t, el); };
  } catch (ex) { localStorage.removeItem("learndna:ytkey"); keyBox(`<div class="error-msg">${esc(ex.message)}</div>`); }
}

// ---------------------------------------------------------------- onboarding

let onboardingGoal = null;

function renderOnboarding() {
  onboardingGoal = onboardingGoal || CURRENT.activeGoalId || null;

  root.innerHTML = h`
  <div class="center-screen">
    <div class="auth-card" style="max-width:640px;">
      <div class="brand">${HELIX_SVG}<div><div class="brand-name">LearnDNA</div><div class="brand-tag">step 1 of 2 — choose a goal</div></div></div>
      <h1 style="font-size:20px;margin-bottom:6px;">Hi ${esc(CURRENT.name.split(" ")[0])}, what are you working toward?</h1>
      <p style="color:var(--text-dim);font-size:13.5px;margin-bottom:18px;">LearnDNA maps your goal backward through prerequisites to build your roadmap.</p>
      <div id="goal-list">
        ${[...GOALS.values()].map(g => {
          const style = subjectStyle(g.id);
          return `
          <button class="goal-option ${onboardingGoal === g.id ? "selected" : ""}" data-goal="${g.id}" style="--accent:${style.color};">
            <div class="g-title"><span class="g-icon">${style.icon}</span>${esc(g.title)}</div>
            <div class="g-desc">${esc(g.description)}</div>
            <div class="g-meta">${g.requiredTopicIds.length} topics in this path</div>
          </button>`;
        }).join("")}
      </div>
      <button class="btn block" id="goal-next" ${onboardingGoal ? "" : "disabled"}>Next — quick self-assessment</button>
    </div>
  </div>`;

  root.querySelectorAll("[data-goal]").forEach(btn => {
    btn.addEventListener("click", () => { onboardingGoal = btn.dataset.goal; renderOnboarding(); });
  });
  document.getElementById("goal-next").addEventListener("click", () => {
    if (!onboardingGoal) return;
    renderAssessment(onboardingGoal);
  });
}

function renderAssessment(goalId) {
  const graph = SUBJECT_GRAPHS.get(goalId);
  const roadmap = graph.buildRoadmapForGoal(GOALS.get(goalId).requiredTopicIds);
  const picks = {}; // topicId -> score, only set once the user actually clicks an option

  root.innerHTML = h`
  <div class="center-screen">
    <div class="auth-card" style="max-width:640px;">
      <div class="brand">${HELIX_SVG}<div><div class="brand-name">LearnDNA</div><div class="brand-tag">step 2 of 2 — self-assessment</div></div></div>
      <h1 style="font-size:20px;margin-bottom:4px;">How well do you know these already?</h1>
      <p style="color:var(--text-dim);font-size:13.5px;margin-bottom:4px;">Be honest — quizzes later will refine this. This seeds your Knowledge DNA.</p>
      <p class="hint" id="assess-count" style="margin-bottom:14px;"></p>
      <div id="assess-list">
        ${roadmap.map(t => `
          <div class="assess-item" data-item="${t.id}">
            <div><div class="a-title">${esc(t.title)}</div><div class="a-meta">${t.domain} · ${t.difficulty.toLowerCase()}</div></div>
            <div class="assess-opts" data-topic="${t.id}">
              <button data-score="0">Don't know</button>
              <button data-score="40">Somewhat</button>
              <button data-score="85">Confident</button>
            </div>
          </div>`).join("")}
      </div>
      <button class="btn block" id="assess-done" style="margin-top:18px;" disabled>Answer all topics to continue</button>
    </div>
  </div>`;

  const total = roadmap.length;
  const doneBtn = document.getElementById("assess-done");
  const countEl = document.getElementById("assess-count");
  const refreshCount = () => {
    const answered = Object.keys(picks).length;
    countEl.textContent = `${answered} / ${total} answered`;
    if (answered === total) { doneBtn.disabled = false; doneBtn.textContent = "Build my Knowledge DNA"; }
    else { doneBtn.disabled = true; doneBtn.textContent = `Answer all topics to continue (${total - answered} left)`; }
  };
  refreshCount();

  root.querySelectorAll(".assess-opts").forEach(group => {
    const topicId = group.dataset.topic;
    group.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        picks[topicId] = Number(btn.dataset.score);
        group.querySelectorAll("button").forEach(b => b.classList.remove("picked"));
        btn.classList.add("picked");
        group.closest(".assess-item").classList.add("answered");
        refreshCount();
      });
    });
  });

  document.getElementById("assess-done").addEventListener("click", () => {
    if (Object.keys(picks).length < total) {
      const firstUnanswered = roadmap.find(t => picks[t.id] === undefined);
      if (firstUnanswered) {
        const el = root.querySelector(`[data-item="${firstUnanswered.id}"]`);
        el.classList.add("shake");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el.classList.remove("shake"), 500);
      }
      return;
    }
    roadmap.forEach(t => {
      CURRENT.dna.setMastery(t.id, picks[t.id]);
      CURRENT.progress.recordSession(t.id, picks[t.id]);
    });
    CURRENT.activeGoalId = goalId;
    persist();
    onboardingGoal = null;
    toast("Knowledge DNA created");
    navigate("/dashboard");
  });
}

// ---------------------------------------------------------------- multi-course

// A subject is "touched" once any of its topics has a progress record — dna.masteryMap
// is keyed by topic id and topic ids are unique across every subject, so mastery on one
// subject never overlaps or gets wiped by starting another.
function subjectStatus(subjId) {
  const topics = SUBJECT_GRAPHS.get(subjId).getAllTopics();
  const started = topics.some(t => !!CURRENT.progress.progressByTopic[t.id]);
  const completed = topics.filter(t => CURRENT.dna.getMastery(t.id) >= PASS_THRESHOLD).length;
  const avg = Math.round(topics.reduce((sum, t) => sum + CURRENT.dna.getMastery(t.id), 0) / topics.length);
  return { started, completed, total: topics.length, avg, done: completed === topics.length };
}

function renderSubjects() {
  const cards = [...GOALS.values()].map(g => {
    const style = subjectStyle(g.id);
    const st = subjectStatus(g.id);
    const isCurrent = g.id === CURRENT.activeGoalId;
    const label = st.done ? "Completed" : st.started ? "In progress" : "Not started";
    return h`
      <div class="card course-card" style="--accent:${style.color};">
        <div class="course-head"><span class="g-icon">${style.icon}</span><h3>${esc(g.title)}</h3>${isCurrent ? `<span class="badge building">viewing</span>` : ""}</div>
        <p class="hint" style="margin:2px 0 10px;">${esc(g.description)}</p>
        <div class="mastery-bar"><span style="width:${st.avg}%;background:${st.done ? "var(--teal)" : "var(--accent)"}"></span></div>
        <div class="course-meta"><span>${st.completed}/${st.total} mastered</span><span class="${st.done ? "" : st.started ? "" : "hint"}">${label}</span></div>
        <button class="btn ${isCurrent ? "ghost" : ""} small" data-subj="${g.id}" data-started="${st.started}" style="margin-top:10px;">${isCurrent ? "Go to dashboard" : st.started ? "Continue course" : "Start course"}</button>
      </div>`;
  }).join("");

  const content = h`
    <div class="page-head">
      <div class="eyebrow">my courses</div>
      <h1>Start a new course anytime</h1>
      <p class="lede">Progress is tracked per topic, so switching or adding a course never touches what you've already built in another one.</p>
    </div>
    <div class="grid cols-3">${cards}</div>
  `;
  shell("subjects", content);

  root.querySelectorAll("[data-subj]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.subj;
      if (id === CURRENT.activeGoalId) { navigate("/dashboard"); return; }
      if (btn.dataset.started === "true") {
        CURRENT.activeGoalId = id;
        persist();
        toast("Switched to " + GOALS.get(id).title);
        navigate("/dashboard");
      } else {
        renderAssessment(id); // fresh subject: quick self-assessment seeds its Knowledge DNA
      }
    });
  });
}

// ---------------------------------------------------------------- dashboard

function renderDashboard() {
  const graph = currentGraph();
  const engine = currentEngine();
  const goal = GOALS.get(CURRENT.activeGoalId);
  const dnaScore = CURRENT.dna.getOverallDnaScore();
  const completed = CURRENT.progress.countCompleted();
  const recs = engine.recommend(CURRENT, goal.id, 3);
  const weak = engine.weakTopics(CURRENT, 50).slice(0, 4);
  const revisionDue = getRevisionQueue(CURRENT, graph);

  const content = h`
    ${typeof Home !== "undefined" ? Home.hero(recs, goal) + Home.mainRow(goal) : ""}
    <div class="section-title" style="margin-bottom:10px;">your knowledge dna</div>
    <p class="lede" style="margin:-4px 0 14px;">A live snapshot of what you know, what's next, and what needs revision — for ${esc(goal.title)}.</p>

    <div class="grid cols-3" style="margin-bottom:16px;">
      <div class="card">
        <h3>Overall DNA score</h3>
        <div class="stat-row"><span class="stat">${dnaScore.toFixed(0)}%</span></div>
        <div class="mastery-bar" style="margin-top:10px;"><span style="width:${dnaScore}%"></span></div>
      </div>
      <div class="card">
        <h3>Topics mastered</h3>
        <div class="stat">${completed}<span style="font-size:16px;color:var(--text-faint);"> / ${goal.requiredTopicIds.length}</span></div>
        <div class="stat-label">required for this goal</div>
      </div>
      <div class="card">
        <h3>Due for revision</h3>
        <div class="stat" style="color:${revisionDue.length ? "var(--amber)" : "var(--text)"}">${revisionDue.length}</div>
        <div class="stat-label">${revisionDue.length ? "topics slipping" : "you're all caught up"}</div>
      </div>
    </div>

    ${Engage.dashCard()}

    <div class="grid cols-2">
      <div class="card">
        <h3>Recommended next</h3>
        ${recs.length ? recs.map(r => `
          <div style="padding:10px 0;border-bottom:1px solid var(--border);">
            <a href="#/topic/${r.topic.id}" style="color:var(--text);text-decoration:none;font-size:14px;">${esc(r.topic.title)}</a>
            <div style="color:var(--text-faint);font-size:12px;margin-top:3px;">${esc(r.reason)}</div>
          </div>`).join("") : `<div class="empty" style="padding:20px 0;">Nothing ready right now — check the roadmap for what unlocks next.</div>`}
      </div>
      <div class="card">
        <h3>Weak areas</h3>
        ${weak.length ? weak.map(t => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);">
            <a href="#/topic/${t.id}" style="color:var(--text);text-decoration:none;font-size:14px;">${esc(t.title)}</a>
            <span class="mono" style="color:var(--coral);font-size:13px;">${CURRENT.dna.getMastery(t.id)}%</span>
          </div>`).join("") : `<div class="empty" style="padding:20px 0;">No weak spots detected yet.</div>`}
      </div>
    </div>

    <div class="divider"></div>
    <div class="section-title">quick actions</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a class="btn" href="#/roadmap">View full roadmap</a>
      <a class="btn ghost" href="#/graph">Explore Knowledge Graph</a>
      <a class="btn ghost" href="#/revision">Open revision planner</a>
      <a class="btn ghost" href="#/tutor">Ask AI tutor</a>
      <a class="btn ghost" href="#/community">Leaderboard</a>
      <a class="btn ghost" href="#/subjects">Start / switch another course</a>
    </div>
  `;
  shell("dashboard", content);
  if (typeof Home !== "undefined") Home.bind();
}

// ---------------------------------------------------------------- roadmap

function renderRoadmap() {
  const graph = currentGraph();
  const goal = GOALS.get(CURRENT.activeGoalId);
  const roadmap = graph.buildRoadmapForGoal(goal.requiredTopicIds);
  const masteryLookup = (id) => CURRENT.dna.getMastery(id);

  let nextFound = false;
  const rows = roadmap.map((t, i) => {
    const mastery = CURRENT.dna.getMastery(t.id);
    const ready = graph.isReadyToLearn(t.id, masteryLookup);
    const completedFlag = mastery >= PASS_THRESHOLD;
    let tag = "";
    if (!nextFound && !completedFlag && ready) { tag = `<span class="badge building">start here</span>`; nextFound = true; }
    return h`
      <div class="topic-row" data-go="${t.id}" style="cursor:pointer;flex-wrap:wrap;">
        <span class="t-index mono">${String(i + 1).padStart(2, "0")}</span>
        <div class="t-main">
          <div class="t-title">${esc(t.title)} <span class="mono" style="color:var(--text-faint);font-size:11px;">${t.id}</span></div>
          <div class="mastery-bar t-bar"><span style="width:${mastery}%;background:${completedFlag ? "var(--teal)" : ready ? "var(--amber)" : "var(--coral)"}"></span></div>
        </div>
        <div class="t-side">
          ${tag}
          ${completedFlag ? masteryBadge(mastery) : ready ? "" : `<span class="badge locked">locked</span>`}
          <span class="mono" style="color:var(--text-dim);font-size:13px;">${mastery}%</span>
        </div>
        <div class="chips">${chips(t)}</div>
      </div>`;
  }).join("");

  const content = h`
    <div class="page-head">
      <div class="eyebrow">roadmap</div>
      <h1>${esc(goal.title)}</h1>
      <p class="lede">Goal-backward planning: every prerequisite this goal transitively needs, ordered by a topological sort so you never hit a locked topic.</p>
    </div>
    ${rows}
  `;
  shell("roadmap", content);
  root.querySelectorAll("[data-go]").forEach(r => r.addEventListener("click", e => { if (e.target.closest("a")) return; navigate("/topic/" + r.dataset.go); }));
}

// ---------------------------------------------------------------- graph explorer

function renderGraph() {
  const graph = currentGraph();
  const layers = graph.computeLayers();
  const byLayer = new Map();
  for (const t of graph.getAllTopics()) {
    const l = layers.get(t.id);
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l).push(t);
  }
  const colW = 168, rowH = 92, padX = 60, padY = 40;
  const maxRows = Math.max(...[...byLayer.values()].map(a => a.length));
  const width = padX * 2 + (Math.max(...layers.values()) + 1) * colW;
  const height = padY * 2 + maxRows * rowH;

  const pos = {};
  for (const [layer, topics] of byLayer) {
    const colX = padX + layer * colW + colW / 2;
    const startY = padY + (height - padY * 2 - topics.length * rowH) / 2;
    topics.forEach((t, i) => { pos[t.id] = { x: colX, y: startY + i * rowH + rowH / 2 }; });
  }

  const masteryLookup = (id) => CURRENT.dna.getMastery(id);
  const nodeColor = (t) => {
    const m = CURRENT.dna.getMastery(t.id);
    if (m >= PASS_THRESHOLD) return "var(--teal)";
    if (graph.isReadyToLearn(t.id, masteryLookup)) return "var(--amber)";
    return "var(--coral)";
  };

  let edgesSvg = "";
  for (const t of graph.getAllTopics()) {
    for (const preId of graph.getPrerequisiteIds(t.id)) {
      const a = pos[preId], b = pos[t.id];
      const midX = (a.x + b.x) / 2;
      edgesSvg += `<path class="graph-edge" d="M${a.x + 46},${a.y} C${midX},${a.y} ${midX},${b.y} ${b.x - 46},${b.y}"/>`;
    }
  }

  let nodesSvg = "";
  for (const t of graph.getAllTopics()) {
    const p = pos[t.id];
    const color = nodeColor(t);
    nodesSvg += h`
      <g class="graph-node" data-topic="${t.id}" transform="translate(${p.x},${p.y})">
        <circle r="26" fill="rgba(255,255,255,0.03)" stroke="${color}"/>
        <text class="g-id" text-anchor="middle" y="-32">${t.id}</text>
        <text text-anchor="middle" y="5">${wrapTitle(t.title)}</text>
      </g>`;
  }

  const content = h`
    <div class="page-head">
      <div class="eyebrow">knowledge graph explorer</div>
      <h1>Topics &amp; prerequisites</h1>
      <p class="lede">Nodes are topics, edges point from a prerequisite to what it unlocks. Click a node for details.</p>
    </div>
    <div class="graph-wrap">
      <svg viewBox="0 0 ${width} ${height}" width="100%" style="min-width:${Math.max(width, 640)}px;">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
    </div>
    <div class="legend">
      <span><span class="sw" style="background:var(--teal);"></span>mastered (≥ ${PASS_THRESHOLD}%)</span>
      <span><span class="sw" style="background:var(--amber);"></span>ready to start</span>
      <span><span class="sw" style="background:var(--coral);"></span>locked — prerequisites missing</span>
    </div>
  `;
  shell("graph", content);

  root.querySelectorAll(".graph-node").forEach(node => {
    node.addEventListener("click", () => navigate("/topic/" + node.dataset.topic));
  });
}

function wrapTitle(title) {
  const words = title.split(" ");
  if (words.length === 1) return esc(title);
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");
  return `<tspan x="0" dy="-6">${esc(line1)}</tspan><tspan x="0" dy="13">${esc(line2)}</tspan>`;
}

// ---------------------------------------------------------------- topic detail

function renderTopicDetail(topicId) {
  QS = null;
  const graph = currentGraph();
  const t = graph.getTopic(topicId);
  const masteryLookup = (id) => CURRENT.dna.getMastery(id);
  const mastery = CURRENT.dna.getMastery(t.id);
  const ready = graph.isReadyToLearn(t.id, masteryLookup);
  const explanation = graph.explain(t.id, masteryLookup);
  const progress = CURRENT.progress.getOrCreate(t.id);
  const dependents = [...graph.getDependentIds(t.id)].map(id => graph.getTopic(id));

  const content = h`
    <div class="page-head">
      <div class="eyebrow">topic · ${t.domain} · ${t.difficulty.toLowerCase()} · ~${t.estimatedMinutes} min</div>
      <div class="detail-header">
        <div>
          <h1>${esc(t.title)}</h1>
          <p class="lede">${masteryBadge(mastery)} <span class="mono" style="color:var(--text-dim);margin-left:8px;">${mastery}% mastery</span></p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="sbtn ${Saved.has(CURRENT.activeGoalId + "|" + t.id) ? "on" : ""}" data-save="${CURRENT.activeGoalId}|${t.id}" title="Save to profile" style="font-size:22px;">★</button>
          <a class="btn ghost" href="#/tutor/${t.id}">Ask AI</a><a class="btn" href="#/quiz/${t.id}">Take quiz</a></div>
      </div>
    </div>

    <div class="explain-box ${ready ? "ready" : "blocked"}">${esc(explanation)}</div>

    <div class="section-title">learning resources</div>
    ${t.resources.map(r => {
      const done = progress.completedResources?.includes(r.id);
      return `
      <div class="resource-row ${done ? "done" : ""}">
        <button class="circle ${done ? "on" : ""}" data-resource="${r.id}" ${!ready ? "disabled" : ""} title="${done ? "Completed" : "Mark complete"}" aria-label="Mark complete"></button>
        <span class="r-type">${r.type}</span>
        <span class="r-title">${esc(r.title)}</span>
      </div>`;
    }).join("")}

    <div class="section-title" style="margin-top:22px;">course &amp; extra practice</div>
    <div class="chips">${chips(t, true)}</div>
    <div class="section-title" style="margin-top:22px;">top youtube videos</div>
    <div id="yt-box"></div>

    ${dependents.length ? `
      <div class="section-title" style="margin-top:22px;">unlocks next</div>
      ${dependents.map(d => `<a class="topic-row" href="#/topic/${d.id}" style="padding:12px 16px;"><div class="t-main"><div class="t-title" style="margin:0;">${esc(d.title)}</div></div></a>`).join("")}
    ` : ""}

    <div style="margin-top:26px;"><a class="btn ghost" href="#/roadmap">← back to roadmap</a></div>
  `;
  shell("topic", content);
  loadVideos(t, document.getElementById("yt-box"));

  root.querySelectorAll("[data-resource]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!ready) return;
      const rid = btn.dataset.resource;
      progress.completedResources = progress.completedResources || [];
      if (!progress.completedResources.includes(rid)) progress.completedResources.push(rid);
      const bumped = Math.min(100, mastery + 15);
      CURRENT.dna.setMastery(t.id, bumped);
      CURRENT.progress.recordSession(t.id, bumped);
      persist();
      toast("Progress saved — mastery up to " + bumped + "%");
      renderTopicDetail(topicId);
    });
  });
}

// ---------------------------------------------------------------- revision

function renderRevision() {
  const graph = currentGraph();
  const due = getRevisionQueue(CURRENT, graph);
  const content = h`
    <div class="page-head">
      <div class="eyebrow">revision planner</div>
      <h1>Keep it fresh</h1>
      <p class="lede">Topics you've completed but haven't revisited in 3+ days, ranked by how urgently they need review.</p>
    </div>
    ${due.length ? due.map(d => `
      <div class="rev-row">
        <div>
          <div style="font-size:14.5px;">${esc(d.topic.title)}</div>
          <div style="color:var(--text-faint);font-size:12.5px;margin-top:3px;">last studied ${d.daysSince} day${d.daysSince === 1 ? "" : "s"} ago · mastery ${d.mastery}%</div>
        </div>
        <a class="btn small" href="#/quiz/${d.topic.id}">Quick review quiz</a>
      </div>`).join("") : `
      <div class="empty">
        <div class="display">Nothing due</div>
        <p>Come back after a few days of study — LearnDNA will flag topics before you forget them.</p>
      </div>`}
    ${Notes.html(new Set(due.map(d => d.topic.id)))}
  `;
  shell("revision", content);
  Notes.bind();
}

function renderAnalytics() {
  const graph = currentGraph();
  const goal = GOALS.get(CURRENT.activeGoalId);
  const topics = graph.getAllTopics();
  const byDomain = {};
  topics.forEach(t => {
    byDomain[t.domain] = byDomain[t.domain] || [];
    byDomain[t.domain].push(t);
  });

  const content = h`
    <div class="page-head">
      <div class="eyebrow">analytics</div>
      <h1>Progress by domain</h1>
      <p class="lede">Average mastery across every topic in each domain of the Knowledge Graph.</p>
    </div>
    <div class="grid cols-3" style="margin-bottom:24px;">
      ${Object.entries(byDomain).map(([domain, ts]) => {
        const avg = Math.round(ts.reduce((sum, t) => sum + CURRENT.dna.getMastery(t.id), 0) / ts.length);
        return `<div class="card"><h3>${esc(domain)}</h3><div class="stat">${avg}%</div><div class="mastery-bar" style="margin-top:10px;"><span style="width:${avg}%"></span></div></div>`;
      }).join("")}
    </div>

    <div class="section-title">every topic</div>
    <div class="card">
      ${topics.map(t => {
        const m = CURRENT.dna.getMastery(t.id);
        return `<div style="display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid var(--border);">
          <span style="width:150px;font-size:13.5px;flex-shrink:0;">${esc(t.title)}</span>
          <div class="mastery-bar" style="flex:1;"><span style="width:${m}%"></span></div>
          <span class="mono" style="width:40px;text-align:right;font-size:12.5px;color:var(--text-dim);">${m}%</span>
        </div>`;
      }).join("")}
    </div>
  `;
  shell("analytics", content);
}
