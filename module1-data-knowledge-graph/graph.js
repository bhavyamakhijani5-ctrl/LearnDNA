/* MODULE 1 — Data & Knowledge Graph: KnowledgeGraph class — prerequisites, ready-to-learn, roadmap build. */
/* ===================================================================
   graph.js — mirrors learndna.graph.KnowledgeGraph and
   learndna.graph.PrerequisiteChecker from the Java project.
   Topics are nodes; prerequisite relationships are directed edges
   (prerequisite -> topic), stored as adjacency maps.
   =================================================================== */

class KnowledgeGraph {
  constructor() {
    this.topics = new Map();          // topicId -> Topic
    this.prerequisitesOf = new Map(); // topicId -> Set(prerequisiteIds)
    this.dependentsOf = new Map();    // topicId -> Set(dependentIds)
  }

  addTopic(topic) {
    if (this.topics.has(topic.id)) throw new Error(`Duplicate topic: ${topic.id}`);
    this.topics.set(topic.id, topic);
    this.prerequisitesOf.set(topic.id, new Set());
    this.dependentsOf.set(topic.id, new Set());
  }

  getTopic(topicId) {
    const t = this.topics.get(topicId);
    if (!t) throw new Error(`Topic not found: ${topicId}`);
    return t;
  }

  getAllTopics() {
    return [...this.topics.values()];
  }

  addPrerequisite(prerequisiteId, topicId) {
    if (!this.topics.has(topicId) || !this.topics.has(prerequisiteId)) {
      throw new Error("Unknown topic in prerequisite edge");
    }
    this.prerequisitesOf.get(topicId).add(prerequisiteId);
    this.dependentsOf.get(prerequisiteId).add(topicId);
  }

  getPrerequisiteIds(topicId) {
    return this.prerequisitesOf.get(topicId) ?? new Set();
  }

  getDependentIds(topicId) {
    return this.dependentsOf.get(topicId) ?? new Set();
  }

  /** PrerequisiteChecker: prerequisites of `topicId` not yet mastered by this student. */
  getMissingPrerequisites(topicId, masteryLookup, passThreshold = PASS_THRESHOLD) {
    const missing = [];
    for (const preId of this.getPrerequisiteIds(topicId)) {
      if (masteryLookup(preId) < passThreshold) missing.push(this.getTopic(preId));
    }
    return missing;
  }

  isReadyToLearn(topicId, masteryLookup, passThreshold = PASS_THRESHOLD) {
    return this.getMissingPrerequisites(topicId, masteryLookup, passThreshold).length === 0;
  }

  explain(topicId, masteryLookup) {
    const missing = this.getMissingPrerequisites(topicId, masteryLookup);
    if (missing.length === 0) return "Ready to start — all prerequisites are mastered.";
    return "Blocked — complete these prerequisites first: " + missing.map(t => t.title).join(", ");
  }

  /** BFS over dependents (topics this one unlocks). */
  bfsFrom(startId) {
    const visited = new Set([startId]);
    const queue = [startId];
    const order = [];
    while (queue.length) {
      const current = queue.shift();
      order.push(this.getTopic(current));
      for (const next of this.getDependentIds(current)) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    return order;
  }

  /** DFS over the full prerequisite chain (ancestors) of a topic. */
  dfsPrerequisiteChain(topicId) {
    const visited = new Set();
    const result = [];
    const helper = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      for (const preId of this.getPrerequisiteIds(id)) helper(preId);
      result.push(this.getTopic(id));
    };
    helper(topicId);
    return result.filter(t => t.id !== topicId);
  }

  /** Kahn's algorithm — a valid prerequisite-respecting order of ALL topics. */
  topologicalOrder() {
    const inDegree = new Map();
    for (const id of this.topics.keys()) inDegree.set(id, this.getPrerequisiteIds(id).size);

    const ready = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
    const order = [];
    while (ready.length) {
      const current = ready.shift();
      order.push(this.getTopic(current));
      for (const dep of this.getDependentIds(current)) {
        const updated = inDegree.get(dep) - 1;
        inDegree.set(dep, updated);
        if (updated === 0) ready.push(dep);
      }
    }
    if (order.length !== this.topics.size) throw new Error("Cycle detected in prerequisite graph");
    return order;
  }

  /** Goal-backward planning: goal topics + everything they transitively need, in valid order. */
  buildRoadmapForGoal(goalTopicIds) {
    const needed = new Set();
    const collectAncestors = (topicId) => {
      for (const preId of this.getPrerequisiteIds(topicId)) {
        if (!needed.has(preId)) {
          needed.add(preId);
          collectAncestors(preId);
        }
      }
    };
    for (const goalTopicId of goalTopicIds) {
      collectAncestors(goalTopicId);
      needed.add(goalTopicId);
    }
    return this.topologicalOrder().filter(t => needed.has(t.id));
  }

  /** Longest-path-from-root layer for each topic — used purely for graph layout. */
  computeLayers() {
    const layer = new Map();
    for (const t of this.topologicalOrder()) {
      const preLayers = [...this.getPrerequisiteIds(t.id)].map(id => layer.get(id) ?? 0);
      layer.set(t.id, preLayers.length ? Math.max(...preLayers) + 1 : 0);
    }
    return layer;
  }
}
