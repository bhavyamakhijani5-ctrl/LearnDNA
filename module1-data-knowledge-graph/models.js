/* MODULE 1 — Data & Knowledge Graph: Student, KnowledgeDNA (mastery map), Progress models. */
/* ===================================================================
   models.js — mirrors learndna.model.* from the original Java project.
   Each class here maps 1:1 onto a Java class so the OOP explanation
   ("Explain the OOP classes and relationships behind the screens")
   from the documentation still holds for this web build.
   =================================================================== */

// learndna.model.Topic
class Topic {
  constructor(seed) {
    this.id = seed.id;
    this.title = seed.title;
    this.domain = seed.domain;
    this.difficulty = seed.difficulty;
    this.estimatedMinutes = seed.minutes;
    this.resources = seed.resources.map(r => new LearningResource(r));
    // mutable learner-specific state (kept in KnowledgeDNA / ProgressTracker below,
    // referenced here for convenience the way the Java GUI panels read it)
  }
}

// learndna.model.LearningResource (abstract in Java; concrete subtype folded into `type`)
class LearningResource {
  constructor({ id, type, title, ref }) {
    this.id = id;
    this.type = type; // VIDEO | PDF | QUIZ | PROJECT
    this.title = title;
    this.ref = ref;
  }
}

// learndna.model.Goal
class Goal {
  constructor(seed) {
    this.id = seed.id;
    this.title = seed.title;
    this.description = seed.description;
    this.requiredTopicIds = [...seed.requiredTopicIds];
  }
}

// learndna.model.KnowledgeDNA — compact mastery profile for one student
class KnowledgeDNA {
  constructor(studentId, masteryMap = {}) {
    this.studentId = studentId;
    this.masteryMap = masteryMap; // topicId -> 0..100
  }

  setMastery(topicId, score) {
    this.masteryMap[topicId] = Math.max(0, Math.min(100, Math.round(score)));
  }

  getMastery(topicId) {
    return this.masteryMap[topicId] ?? 0;
  }

  getOverallDnaScore() {
    const values = Object.values(this.masteryMap);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

// learndna.profile.ProgressTracker — per-topic status + history for one student
class ProgressTracker {
  constructor(studentId, progressByTopic = {}) {
    this.studentId = studentId;
    this.progressByTopic = progressByTopic;
    // progressByTopic[topicId] = { status, masteryScore, lastStudied, sessions }
  }

  getOrCreate(topicId) {
    if (!this.progressByTopic[topicId]) {
      this.progressByTopic[topicId] = {
        status: "NOT_STARTED",
        masteryScore: 0,
        lastStudied: null,
        sessions: 0,
      };
    }
    return this.progressByTopic[topicId];
  }

  recordSession(topicId, newMastery) {
    const p = this.getOrCreate(topicId);
    p.masteryScore = newMastery;
    p.sessions += 1;
    p.lastStudied = new Date().toISOString();
    p.status = newMastery >= PASS_THRESHOLD ? "COMPLETED" : newMastery > 0 ? "IN_PROGRESS" : "NOT_STARTED";
  }

  countCompleted() {
    return Object.values(this.progressByTopic).filter(p => p.status === "COMPLETED").length;
  }
}

// learndna.model.Student (extends abstract User in Java)
class Student {
  constructor({ id, name, email, branch = "CSE", year = 3, availableMinutesPerDay = 90, preferredDifficulty = "MEDIUM" }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.branch = branch;
    this.year = year;
    this.availableMinutesPerDay = availableMinutesPerDay;
    this.preferredDifficulty = preferredDifficulty;
    this.activeGoalId = null;
    this.dna = new KnowledgeDNA(id);
    this.progress = new ProgressTracker(id);
    this.engage = null; // Module 5: XP, streaks, goals (created lazily by Engage.get)
  }

  static fromJSON(obj) {
    const s = new Student(obj);
    s.activeGoalId = obj.activeGoalId ?? null;
    s.engage = obj.engage ?? null;
    s.dna = new KnowledgeDNA(obj.id, obj.dna?.masteryMap ?? {});
    s.progress = new ProgressTracker(obj.id, obj.progress?.progressByTopic ?? {});
    return s;
  }
}

// learndna.model.Recommendation
class Recommendation {
  constructor(topic, score, reason) {
    this.topic = topic;
    this.score = score;
    this.reason = reason;
  }
}
