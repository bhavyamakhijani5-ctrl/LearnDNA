/* MODULE 2 — Adaptive Engine & Quiz System: rule-based recommendation engine (next-best topic, mastery blend). */
/* ===================================================================
   engine.js — mirrors learndna.engine.RuleBasedRecommendationEngine.
   score = goal relevance + prerequisite readiness + weakness urgency
           + time fit + difficulty preference match
   =================================================================== */

class RuleBasedRecommendationEngine {
  constructor(graph, goals) {
    this.graph = graph;
    this.goals = goals; // Map goalId -> Goal
  }

  recommend(student, goalId, topN = 3) {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error(`Unknown goal: ${goalId}`);

    const masteryLookup = (topicId) => student.dna.getMastery(topicId);
    const ranked = [];

    for (const topicId of goal.requiredTopicIds) {
      if (!this.graph.topics.has(topicId)) continue;
      const topic = this.graph.getTopic(topicId);
      const mastery = masteryLookup(topicId);
      if (mastery >= PASS_THRESHOLD) continue; // already mastered

      const ready = this.graph.isReadyToLearn(topicId, masteryLookup);
      if (!ready) continue;

      const score = this._scoreTopic(topic, student, mastery, ready);
      const reason = this._buildReason(topic, student, mastery, ready);
      ranked.push(new Recommendation(topic, score, reason));
    }

    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, topN);
  }

  _scoreTopic(topic, student, mastery, ready) {
    let score = 40; // goal relevance
    score += ready ? 20 : 0;
    score += (100 - mastery) * 0.3; // weakness urgency
    score += topic.estimatedMinutes <= student.availableMinutesPerDay ? 15 : 0; // time fit
    if (topic.difficulty === student.preferredDifficulty) score += 5;
    return Math.round(score * 10) / 10;
  }

  _buildReason(topic, student, mastery, ready) {
    const reasons = ["required for goal"];
    if (ready) reasons.push("prerequisites met");
    if (topic.estimatedMinutes <= student.availableMinutesPerDay) reasons.push("fits available time");
    if (mastery < 40) reasons.push("weak area");
    return reasons.join(", ");
  }

  weakTopics(student, belowThreshold = 50) {
    return this.graph.getAllTopics()
      .filter(t => student.dna.getMastery(t.id) < belowThreshold)
      .sort((a, b) => student.dna.getMastery(a.id) - student.dna.getMastery(b.id));
  }
}

/** Revision planner: completed topics not reviewed recently, ranked by urgency. */
function getRevisionQueue(student, graph) {
  const now = Date.now();
  const due = [];
  for (const topic of graph.getAllTopics()) {
    const p = student.progress.progressByTopic[topic.id];
    if (!p || p.status !== "COMPLETED" || !p.lastStudied) continue;
    const daysSince = (now - new Date(p.lastStudied).getTime()) / 86400000;
    if (daysSince >= 3) {
      const urgency = daysSince * 2 + (100 - p.masteryScore) * 0.5;
      due.push({ topic, daysSince: Math.floor(daysSince), mastery: p.masteryScore, urgency });
    }
  }
  due.sort((a, b) => b.urgency - a.urgency);
  return due;
}
