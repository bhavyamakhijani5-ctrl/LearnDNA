/* ===================================================================
   MODULE 2 -- Adaptive Engine & Quiz System (part 2 of 2: quiz runner)
   Round-based quiz UI: pulls questions for the topic + its
   prerequisites (revision), shuffles, scores, and blends the result
   into Knowledge DNA mastery -- repeats in new rounds until
   PASS_THRESHOLD (Module 1/data.js) is reached.
   =================================================================== */

// ---------------------------------------------------------------- quiz

const QUIZ_ROUND = 5;
let QS = null; // { topicId, round, seen }
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function renderQuiz(topicId) {
  const graph = currentGraph();
  const t = graph.getTopic(topicId);
  const look = (id) => CURRENT.dna.getMastery(id);
  if (!graph.isReadyToLearn(topicId, look)) {
    shell("quiz", `<div class="page-head"><h1>${esc(t.title)}</h1></div><div class="explain-box blocked">${esc(graph.explain(topicId, look))}</div><a class="btn ghost" href="#/topic/${t.id}">← back</a>`);
    return;
  }
  if (!QS || QS.topicId !== topicId) QS = { topicId, round: 0, seen: {} };

  // pool = this topic's questions + revision questions from its prerequisites
  const pool = [
    ...(SEED_QUIZZES[topicId] || []).map(q => ({ ...q, from: t.title, tid: topicId })),
    ...graph.dfsPrerequisiteChain(topicId).flatMap(p => (SEED_QUIZZES[p.id] || []).map(q => ({ ...q, from: p.title, rev: true, tid: p.id }))),
  ];
  // least-seen questions first, so every new round shows fresh ones before repeating
  const picked = shuffle(pool).sort((a, b) => ((QS.seen[a.q] || 0) - (QS.seen[b.q] || 0)) || (!!a.rev - !!b.rev)).slice(0, QUIZ_ROUND);
  picked.forEach(q => QS.seen[q.q] = (QS.seen[q.q] || 0) + 1);
  const questions = picked.map((q, idx) => {
    const order = shuffle(q.options.map((_, i) => i));
    return { idx, tid: q.tid, exp: q.exp, q: q.q, rev: q.rev, from: q.from, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
  });
  QS.round++;
  const round = QS.round;
  const answers = new Array(questions.length).fill(null);
  let result = null;

  function paint() {
    const answered = answers.filter(a => a !== null).length;
    const content = `
      <div class="page-head">
        <div class="eyebrow">quiz · round ${round}</div>
        <h1>${esc(t.title)}</h1>
        <p class="lede">Mastery ${CURRENT.dna.getMastery(t.id)}% — A topic counts as mastered at ${PASS_THRESHOLD}%. New rounds keep coming until you get there.</p>
      </div>
      <div class="card">
        <div class="round-bar"><span>Round ${round}</span><span>${answered}/${questions.length} answered</span></div>
        <div class="mastery-bar" style="margin-bottom:14px;"><span style="width:${answered / questions.length * 100}%"></span></div>
        ${questions.map((q, qi) => `
          <div class="quiz-q">
            ${q.rev ? `<div class="rev-tag">REVISION · ${esc(q.from)}</div>` : ""}
            <div class="q-text">${qi + 1}. ${esc(q.q)}</div>
            ${q.options.map((opt, oi) => {
              let cls = "quiz-opt";
              if (result) { if (oi === q.answer) cls += " correct"; else if (answers[qi] === oi) cls += " wrong"; }
              else if (answers[qi] === oi) cls += " picked";
              return `<button class="${cls}" data-q="${qi}" data-o="${oi}" ${result ? "disabled" : ""}>${esc(opt)}</button>`;
            }).join("")}
            ${result ? Tutor.expBlock(q, answers[qi]) : ""}
          </div>`).join("")}
        ${result ? `
          <div class="divider"></div>
          <p style="font-size:15px;">Score: <strong>${result.correct}/${questions.length}</strong> (${result.score}%) — mastery ${result.old}% → <strong style="color:var(--teal)">${result.now}%</strong></p>
          <p class="hint">⭐ +${result.eng.gain} XP${result.eng.dailyDone ? " · 🎯 daily goal done" : ""}${result.eng.streakUp ? ` · 🔥 streak ${result.eng.streak}` : ""}${result.eng.goalsDone.length ? " · ✅ goal: " + result.eng.goalsDone.map(esc).join(", ") : ""}</p>
          ${result.now >= PASS_THRESHOLD
            ? `<div class="explain-box ready">🎉 Topic mastered! The topics that depend on it are now unlocked.</div><a class="btn" href="#/topic/${t.id}">Back to topic</a> <a class="btn ghost" href="#/roadmap">Roadmap</a>`
            : `<div class="explain-box blocked">Not mastered yet (${result.now}% / ${PASS_THRESHOLD}%). The next round brings new questions — keep going.</div><button class="btn" id="quiz-next">Start round ${round + 1} →</button> <a class="btn ghost" href="#/topic/${t.id}">Revise topic</a>`}
        ` : `<button class="btn" id="quiz-submit" ${answers.includes(null) ? "disabled" : ""}>Submit round ${round}</button>`}
      </div>`;
    shell("quiz", content);
    root.querySelectorAll(".quiz-opt").forEach(btn => btn.addEventListener("click", () => {
      if (result) return;
      answers[Number(btn.dataset.q)] = Number(btn.dataset.o);
      paint();
    }));
    const sub = document.getElementById("quiz-submit");
    if (sub) sub.addEventListener("click", () => {
      const correct = answers.filter((a, i) => a === questions[i].answer).length;
      const score = Math.round(correct / questions.length * 100);
      const old = CURRENT.dna.getMastery(t.id);
      const now = Math.round(0.4 * old + 0.6 * score);
      CURRENT.dna.setMastery(t.id, now);
      CURRENT.progress.recordSession(t.id, now);
      persist();
      const eng = Engage.onQuiz({ correct, total: questions.length, newlyMastered: old < PASS_THRESHOLD && now >= PASS_THRESHOLD });
      persist();
      result = { correct, score, old, now, eng };
      paint();
    });
    root.querySelectorAll("[data-ai-exp]").forEach(b => b.addEventListener("click", () => { const qi = Number(b.dataset.aiExp); Tutor.explainInline(questions[qi], answers[qi]); }));
    const nxt = document.getElementById("quiz-next");
    if (nxt) nxt.addEventListener("click", () => renderQuiz(topicId));
  }
  paint();
}
