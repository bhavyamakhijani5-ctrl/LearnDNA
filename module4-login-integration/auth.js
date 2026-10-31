/* MODULE 4 — Login & Integration: register/login, PBKDF2-SHA256 password hashing, session, lockout. */
/* auth.js — register / sign-in with a hashed password (PBKDF2-SHA256 + random salt).
   Inspect > Application > Local Storage shows only the salt + hash, never the real password. */
const fromHex = (h) => Uint8Array.from((h.match(/../g) || []).map(x => parseInt(x, 16)));
const toHex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

const Auth = {
  AK: "learndna:auth:", SK: "learndna:session", ITER: 150000,
  COMMON: ["password", "qwerty", "12345678", "iloveyou", "admin", "welcome", "letmein", "abc123"],

  rules(pw, name = "", email = "") {
    const low = pw.toLowerCase(), local = (email.split("@")[0] || "").toLowerCase();
    const words = name.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    return [
      ["At least 10 characters", pw.length >= 10],
      ["Uppercase letter (A-Z)", /[A-Z]/.test(pw)],
      ["Lowercase letter (a-z)", /[a-z]/.test(pw)],
      ["A number (0-9)", /\d/.test(pw)],
      ["A special character (!@#$%…)", /[^A-Za-z0-9]/.test(pw)],
      ["No name / email / common word inside", pw.length > 0 && !this.COMMON.some(c => low.includes(c)) &&
        !(local.length >= 3 && low.includes(local)) && !words.some(w => low.includes(w))],
    ];
  },

  async derive(pw, salt, iter) {
    if (!window.crypto || !crypto.subtle) throw new Error("Secure hashing needs a secure context. Run the app on http://localhost: python3 -m http.server 8000");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    return toHex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256));
  },

  has(email) { return !!localStorage.getItem(this.AK + email); },

  async register(name, email, pw) {
    email = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Enter a valid email address.");
    if (name.trim().length < 2) throw new Error("Enter your name (at least 2 letters).");
    if (this.rules(pw, name, email).some(r => !r[1])) throw new Error("Password doesn't meet all the strength rules.");
    if (this.has(email)) throw new Error("An account with this email already exists — please sign in.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await this.derive(pw, salt, this.ITER);
    localStorage.setItem(this.AK + email, JSON.stringify({ algo: "PBKDF2-SHA256", iter: this.ITER, salt: toHex(salt), hash }));
    let s = Store.loadStudent(email); // keeps progress if an older (password-less) profile exists
    if (!s) { s = new Student({ id: "S_" + Date.now(), name: name.trim(), email }); Store.saveStudent(s); }
    return s;
  },

  async login(email, pw) {
    email = email.trim().toLowerCase();
    const lk = "learndna:lock:" + email;
    const lock = JSON.parse(localStorage.getItem(lk) || '{"n":0,"until":0}');
    if (Date.now() < lock.until) throw new Error(`Too many failed attempts — try again in ${Math.ceil((lock.until - Date.now()) / 1000)}s.`);
    const rec = JSON.parse(localStorage.getItem(this.AK + email) || "null");
    const got = await this.derive(pw, fromHex(rec ? rec.salt : "00"), rec ? rec.iter : this.ITER);
    if (!rec || got !== rec.hash) {
      lock.n++;
      if (lock.n >= 5) lock.until = Date.now() + 60000 * Math.min(lock.n - 4, 10);
      localStorage.setItem(lk, JSON.stringify(lock));
      throw new Error("Incorrect email or password.");
    }
    localStorage.removeItem(lk);
    return Store.loadStudent(email);
  },

  start(email, remember) { this.end(); (remember ? localStorage : sessionStorage).setItem(this.SK, email); },
  currentEmail() { return sessionStorage.getItem(this.SK) || localStorage.getItem(this.SK); },
  end() { sessionStorage.removeItem(this.SK); localStorage.removeItem(this.SK); },
};
