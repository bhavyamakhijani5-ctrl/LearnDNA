/* ===================================================================
   MODULE 5 -- Flip Clock & Study Countdown (replaces the old ring timer).
   Three tabs like DevHarbour's timer page:
     Live Clock  - real-time flip clock (12h/24h, optional seconds)
     Countdown   - Pomodoro / study sessions; every completed FOCUS minute earns +1 XP (breaks do not)
     Stopwatch   - start / pause / lap / reset
   The countdown and the stopwatch keep running while you browse other pages
   (their state lives in globals, not in the page). Preferences are stored in localStorage.
   =================================================================== */

const FLIP_KEY = "learndna:flip";
const FLIP = Object.assign({ mode: "clock", pal: "classic", h24: true, secs: false, sound: true },
  (() => { try { return JSON.parse(localStorage.getItem(FLIP_KEY) || "{}"); } catch { return {}; } })());
const flipSave = () => localStorage.setItem(FLIP_KEY, JSON.stringify(FLIP));

const FLIP_PALETTES = {
  classic:  { name: "Classic",  bg: "#ffffff", fg: "#101014", line: "#c7c7cf", label: "#3a3a44" },
  midnight: { name: "Midnight", bg: "#1a1a22", fg: "#f4f4f5", line: "#050507", label: "#a1a1aa" },
  accent:   { name: "Accent",   bg: "var(--accent)", fg: "#ffffff", line: "rgba(0,0,0,.28)", label: "rgba(255,255,255,.85)" },
  mint:     { name: "Mint",     bg: "#d9f5e7", fg: "#064e3b", line: "#9fd9bb", label: "#0f6b53" },
  sunset:   { name: "Sunset",   bg: "#ffe3d2", fg: "#9a3412", line: "#f2b697", label: "#b4531f" },
  lavender: { name: "Lavender", bg: "#e9e2ff", fg: "#2b1b6b", line: "#c4b5f5", label: "#4c3a96" },
};

// ---------------------------------------------------------------- engines (survive page changes)
const FOCUS = { total: 25 * 60, left: 25 * 60, running: false, iv: null, endAt: 0, kind: "focus" };
const STOPW = { running: false, base: 0, startAt: 0, laps: [] };

const pad2 = (n) => String(n).padStart(2, "0");
function flipBeep() {
  if (!FLIP.sound) return;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.28, 0.56].forEach(t => { const o = ac.createOscillator(), g = ac.createGain(); o.connect(g); g.connect(ac.destination); o.frequency.value = 880; g.gain.value = 0.15; o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.18); });
  } catch { /* no audio */ }
}

function focusTick() {
  FOCUS.left = Math.max(0, Math.ceil((FOCUS.endAt - Date.now()) / 1000));
  if (FOCUS.left <= 0) focusDone();
}
function focusStart() {
  if (FOCUS.running) return;
  FOCUS.running = true; FOCUS.endAt = Date.now() + FOCUS.left * 1000;
  FOCUS.iv = setInterval(focusTick, 250);
}
function focusPause() { if (!FOCUS.running) return; focusTick(); clearInterval(FOCUS.iv); FOCUS.running = false; }
function focusReset() { clearInterval(FOCUS.iv); FOCUS.running = false; FOCUS.left = FOCUS.total; }
function focusSet(minutes, kind) { clearInterval(FOCUS.iv); FOCUS.running = false; FOCUS.kind = kind || "focus"; FOCUS.total = FOCUS.left = Math.max(1, Math.round(minutes * 60)); }
function focusDone() {
  clearInterval(FOCUS.iv); FOCUS.running = false;
  const min = Math.max(1, Math.round(FOCUS.total / 60));
  if (FOCUS.kind === "focus") {
    const e = Engage.get(), a = e.activity[Engage.today()] || (e.activity[Engage.today()] = { q: 0, c: 0, xp: 0 });
    a.min = (a.min || 0) + min; a.xp += min; e.xp += min; e.focusMin = (e.focusMin || 0) + min; persist();
    toast(`🎉 ${min} min focus complete! +${min} XP`);
  } else toast("☕ Break is over - ready for the next session?");
  flipBeep();
  FOCUS.left = FOCUS.total;
  if (document.getElementById("fs-stage")) renderFocus();                    // refresh the stats
}

const stopElapsed = () => STOPW.base + (STOPW.running ? Date.now() - STOPW.startAt : 0);
function stopToggle() { if (STOPW.running) { STOPW.base += Date.now() - STOPW.startAt; STOPW.running = false; } else { STOPW.startAt = Date.now(); STOPW.running = true; } }
function stopLap() {
  if (!STOPW.running) return;
  const t = stopElapsed(), prev = STOPW.laps.length ? STOPW.laps[0].total : 0;
  STOPW.laps.unshift({ n: STOPW.laps.length + 1, split: t - prev, total: t }); if (STOPW.laps.length > 50) STOPW.laps.pop();
}
function stopReset() { STOPW.running = false; STOPW.base = 0; STOPW.laps = []; }
const fmtMs = (ms) => { const s = Math.floor(ms / 1000), cs = Math.floor((ms % 1000) / 10); return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}.${pad2(cs)}`; };

// ---------------------------------------------------------------- flip card DOM
const cardHtml = () => `<div class="fc"><span class="fc-label"></span>
  <div class="fc-half top"><b>00</b></div><div class="fc-half bottom"><b>00</b></div>
  <div class="fc-fold top"><b>00</b></div><div class="fc-fold bottom"><b>00</b></div><i class="fc-line"></i></div>`;

function flipSet(card, text, animate) {
  const cur = card.dataset.v, q = (s) => card.querySelector(s + " b");
  if (cur === text) return;
  card.dataset.v = text;
  if (!animate || cur === undefined) { ["top", "bottom"].forEach(k => { q(".fc-half." + k).textContent = text; q(".fc-fold." + k).textContent = text; }); return; }
  q(".fc-half.top").textContent = text;                 // new top, hidden behind the folding old top
  q(".fc-fold.top").textContent = cur;                  // old top folds down
  q(".fc-fold.bottom").textContent = text;              // new bottom folds in
  card.classList.remove("go"); void card.offsetWidth; card.classList.add("go");
  clearTimeout(card._t);
  card._t = setTimeout(() => { q(".fc-half.bottom").textContent = text; card.classList.remove("go"); }, 620);
}

/** what the cards show right now */
function flipModel() {
  if (FLIP.mode === "clock") {
    const d = new Date(), h = FLIP.h24 ? d.getHours() : (d.getHours() % 12 || 12);
    const cards = [{ t: pad2(h), label: "CLOCK" }, { t: pad2(d.getMinutes()), label: FLIP.h24 ? "" : (d.getHours() < 12 ? "AM" : "PM") }];
    if (FLIP.secs) cards.push({ t: pad2(d.getSeconds()), label: "SEC" });
    return { cards, bar: d.getSeconds() / 59, sub: d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) };
  }
  const long = FLIP.mode === "count" ? FOCUS.total >= 3600 : stopElapsed() >= 3600 * 1000;
  const sec = FLIP.mode === "count" ? FOCUS.left : Math.floor(stopElapsed() / 1000);
  const parts = long ? [Math.floor(sec / 3600), Math.floor(sec / 60) % 60, sec % 60] : [Math.floor(sec / 60), sec % 60];
  const label = FLIP.mode === "count" ? (FOCUS.kind === "focus" ? "FOCUS" : "BREAK") : "TIMER";
  const cards = parts.map((v, i) => ({ t: pad2(v), label: i === 0 ? label : "" }));
  if (FLIP.mode === "count") return { cards, bar: 1 - FOCUS.left / FOCUS.total, sub: FOCUS.kind === "focus" ? `Focus session · +${Math.max(1, Math.round(FOCUS.total / 60))} XP when it finishes` : "Break · no XP, just rest your eyes" };
  return { cards, bar: (stopElapsed() % 60000) / 60000, sub: STOPW.laps.length ? `${STOPW.laps.length} lap${STOPW.laps.length === 1 ? "" : "s"} recorded` : "Press Start, then Lap for split times" };
}

function flipPaint(first) {
  const stage = document.getElementById("fs-stage"); if (!stage) return;
  const m = flipModel(), box = document.getElementById("fs-cards");
  if (box.children.length !== m.cards.length) { box.innerHTML = m.cards.map(cardHtml).join(""); stage.dataset.n = m.cards.length; first = true; }
  m.cards.forEach((c, i) => { const el = box.children[i]; el.querySelector(".fc-label").textContent = c.label; flipSet(el, c.t, !first); });
  document.getElementById("fs-bar-fill").style.width = Math.round(Math.max(0, Math.min(1, m.bar)) * 100) + "%";
  document.getElementById("fs-sub").textContent = m.sub;
  const st = document.getElementById("fs-start");
  if (st) {
    const running = FLIP.mode === "count" ? FOCUS.running : STOPW.running;
    const started = FLIP.mode === "count" ? FOCUS.left < FOCUS.total : STOPW.base > 0;
    st.innerHTML = `<span class="ic">${running ? "❚❚" : "▶"}</span> ${running ? "Pause" : started ? "Resume" : "Start"}`;
  }
  const lap = document.getElementById("fs-lap"); if (lap) lap.disabled = !STOPW.running;
  stage.querySelectorAll("[data-preset],#fs-custom-go,#fs-custom").forEach(b => b.disabled = FOCUS.running);
}

function lapsHtml() {
  if (FLIP.mode !== "stop" || !STOPW.laps.length) return "";
  return `<div class="card fs-laps"><h3>Laps</h3><table class="board"><thead><tr><th>#</th><th>Lap time</th><th>Total</th></tr></thead><tbody>
    ${STOPW.laps.map(l => `<tr><td>${l.n}</td><td class="mono">${fmtMs(l.split)}</td><td class="mono">${fmtMs(l.total)}</td></tr>`).join("")}</tbody></table></div>`;
}

// ---------------------------------------------------------------- page
function renderFocus() {
  const e = Engage.get(), todayMin = e.activity[Engage.today()]?.min || 0, totalMin = e.focusMin || 0;
  const tab = (id, icon, label) => `<button type="button" class="${FLIP.mode === id ? "on" : ""}" data-mode="${id}"><span class="ic">${icon}</span>${label}</button>`;
  const stat = (label, val, unit, note) => `<div class="card focus-stat"><div class="stat-label" style="margin:0 0 4px;">${label}</div><div class="stat">${val}<span class="unit"> ${unit}</span></div><div class="stat-label">${note}</div></div>`;
  const presets = [[15, "focus"], [25, "focus"], [50, "focus"], [5, "break"]];
  const controls = FLIP.mode === "clock" ? "" : FLIP.mode === "count" ? `
      <div class="fs-presets">${presets.map(([m, k]) => `<button type="button" class="fs-chip ${FOCUS.total === m * 60 && FOCUS.kind === k ? "on" : ""}" data-preset="${m}" data-kind="${k}">${k === "break" ? "☕ " + m + " min break" : m + " min"}</button>`).join("")}
        <span class="fs-custom"><input id="fs-custom" type="number" min="1" max="180" placeholder="min" aria-label="Custom minutes"><button type="button" class="fs-chip" id="fs-custom-go">Set</button></span></div>
      <div class="fs-actions"><button type="button" class="fs-btn primary" id="fs-start"></button><button type="button" class="fs-btn" id="fs-reset"><span class="ic">↺</span> Reset</button></div>`
    : `<div class="fs-actions"><button type="button" class="fs-btn primary" id="fs-start"></button><button type="button" class="fs-btn" id="fs-lap"><span class="ic">⚑</span> Lap</button><button type="button" class="fs-btn" id="fs-reset"><span class="ic">↺</span> Reset</button></div>`;
  const P = FLIP_PALETTES[FLIP.pal] || FLIP_PALETTES.classic;

  shell("focus", `
    <div class="fs-head">
      <div><h1>Flip Clock &amp; Study Countdown</h1>
        <p class="lede" style="margin-top:6px;">Minimalist flip clock for deep work and Pomodoro sprints. Every completed focus minute earns +1 XP - and your timer keeps running while you browse other pages.</p></div>
      <div class="fs-tabs" role="tablist">${tab("clock", "◷", "Live Clock")}${tab("count", "⏲", "Countdown")}${tab("stop", "⏱", "Stopwatch")}</div>
    </div>

    <div class="fs-stage" id="fs-stage" data-mode="${FLIP.mode}" data-n="2" style="--fc-bg:${P.bg};--fc-fg:${P.fg};--fc-line:${P.line};--fc-label:${P.label};">
      <div class="fs-cards" id="fs-cards"></div>
      <div class="fs-sub" id="fs-sub"></div>
      ${controls}
      <div class="fs-foot">
        <div class="fs-bar" title="Progress"><i id="fs-bar-fill"></i></div>
        <div class="fs-tools">
          <button type="button" class="fs-tool fs-only-clock" id="fs-h24" title="12 / 24 hour">${FLIP.h24 ? "24h" : "12h"}</button>
          <button type="button" class="fs-tool fs-only-clock" id="fs-secs" title="Show seconds">⏱</button>
          <button type="button" class="fs-tool fs-only-count" id="fs-sound" title="Sound when finished">${FLIP.sound ? "🔔" : "🔕"}</button>
          <button type="button" class="fs-tool" id="fs-pal" title="Change flip colours (${esc(P.name)})">🎨</button>
          <button type="button" class="fs-tool" id="fs-full" title="Fullscreen">⛶</button>
        </div>
      </div>
    </div>

    <div id="fs-laps">${lapsHtml()}</div>

    <div class="grid cols-3" style="margin-top:16px;">
      ${stat("Today", todayMin, "min", "focused so far today")}
      ${stat("All time", totalMin, "min", "total focus time")}
      ${stat("XP earned", totalMin, "XP", "+1 XP per focused minute")}
    </div>
    <div class="card focus-tips" style="margin-top:12px;"><h3>Tips for a good session</h3><ul><li>Put your phone out of reach and pick one task before you press Start.</li><li>Use <b>25 min focus + 5 min break</b> (Pomodoro); after four rounds take a longer break.</li><li>Shortcuts: <b>Space</b> start / pause, <b>L</b> lap.</li></ul></div>`);

  flipPaint(true);
  clearInterval(FLIP.iv); FLIP.iv = setInterval(() => { if (!document.getElementById("fs-stage")) { clearInterval(FLIP.iv); return; } flipPaint(false); }, 200);

  const $ = (x) => document.getElementById(x);
  root.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => { FLIP.mode = b.dataset.mode; flipSave(); renderFocus(); });
  root.querySelectorAll("[data-preset]").forEach(b => b.onclick = () => { focusSet(+b.dataset.preset, b.dataset.kind); renderFocus(); });
  if ($("fs-custom-go")) $("fs-custom-go").onclick = () => { const v = +$("fs-custom").value; if (v >= 1 && v <= 180) { focusSet(v, "focus"); renderFocus(); } else toast("Enter 1 to 180 minutes"); };
  if ($("fs-custom")) $("fs-custom").onkeydown = (ev) => { if (ev.key === "Enter") $("fs-custom-go").click(); };
  if ($("fs-start")) $("fs-start").onclick = () => { if (FLIP.mode === "count") { FOCUS.running ? focusPause() : focusStart(); } else stopToggle(); flipPaint(false); };
  if ($("fs-reset")) $("fs-reset").onclick = () => { if (FLIP.mode === "count") focusReset(); else { stopReset(); $("fs-laps").innerHTML = ""; } flipPaint(false); };
  if ($("fs-lap")) $("fs-lap").onclick = () => { stopLap(); $("fs-laps").innerHTML = lapsHtml(); flipPaint(false); };
  $("fs-h24").onclick = () => { FLIP.h24 = !FLIP.h24; flipSave(); $("fs-h24").textContent = FLIP.h24 ? "24h" : "12h"; flipPaint(true); };
  $("fs-secs").onclick = () => { FLIP.secs = !FLIP.secs; flipSave(); flipPaint(true); };
  $("fs-sound").onclick = () => { FLIP.sound = !FLIP.sound; flipSave(); $("fs-sound").textContent = FLIP.sound ? "🔔" : "🔕"; if (FLIP.sound) flipBeep(); };
  $("fs-pal").onclick = () => {
    const keys = Object.keys(FLIP_PALETTES); FLIP.pal = keys[(keys.indexOf(FLIP.pal) + 1) % keys.length]; flipSave();
    const p = FLIP_PALETTES[FLIP.pal], st = $("fs-stage");
    st.style.setProperty("--fc-bg", p.bg); st.style.setProperty("--fc-fg", p.fg); st.style.setProperty("--fc-line", p.line); st.style.setProperty("--fc-label", p.label);
    $("fs-pal").title = `Change flip colours (${p.name})`; toast(`🎨 ${p.name}`);
  };
  $("fs-full").onclick = () => { const st = $("fs-stage"); if (document.fullscreenElement) document.exitFullscreen(); else if (st.requestFullscreen) st.requestFullscreen(); };
}

// keyboard shortcuts (registered once)
document.addEventListener("keydown", (ev) => {
  if (!document.getElementById("fs-stage") || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
  if (ev.code === "Space" && FLIP.mode !== "clock") { ev.preventDefault(); document.getElementById("fs-start")?.click(); }
  else if (ev.key.toLowerCase() === "l" && FLIP.mode === "stop") document.getElementById("fs-lap")?.click();
});
