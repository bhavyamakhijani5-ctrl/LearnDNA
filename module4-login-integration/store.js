/* MODULE 4 — Login & Integration: localStorage persistence for student profiles. */
/* ===================================================================
   store.js — localStorage persistence (stands in for the Java
   project's JDBC Data Access Layer, kept client-side for this
   browser build so the app runs with zero setup).
   =================================================================== */

const Store = {
  KEY_PREFIX: "learndna:",

  saveStudent(student) {
    localStorage.setItem(this.KEY_PREFIX + "student:" + student.email, JSON.stringify(student));
    localStorage.setItem(this.KEY_PREFIX + "lastEmail", student.email);
  },

  loadStudent(email) {
    const raw = localStorage.getItem(this.KEY_PREFIX + "student:" + email);
    return raw ? Student.fromJSON(JSON.parse(raw)) : null;
  },

  getLastEmail() {
    return localStorage.getItem(this.KEY_PREFIX + "lastEmail");
  },

  listStudents() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(this.KEY_PREFIX + "student:")) {
        out.push(JSON.parse(localStorage.getItem(k)));
      }
    }
    return out;
  },

  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.KEY_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};
