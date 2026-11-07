(function () {
"use strict";

const CFG = window.LINGO_CONFIG;
const SVC = window.LingoServices;
// The deck lives in js/words/level-XX.js; each file adds one level of 20 batches.
const LEVELS = (window.LINGO_LEVELS || []).slice().sort((a, b) => a.n - b.n);
const DATA = [];
LEVELS.forEach((lv, li) => {
  lv.start = DATA.length; lv.count = lv.batches.length;
  lv.batches.forEach(b => DATA.push(Object.assign({ lv: li }, b)));
});
const levelStart = i => LEVELS.some(l => l.start === i);

const W = [];
DATA.forEach((b, bi) => b.w.forEach((r, k) => W.push({
  id: bi * 10 + k, n: bi * 10 + k + 1, b: bi, a: r[0], w: r[1], p: r[2], ipa: r[3], ph: r[4],
  en: r[5], x: r[6], xe: r[7], f: r[8], alt: r[9] || []
})));

const GOAL_WORDS = 2000;
const POS = { noun: "noun", pl: "plural noun", name: "name", verb: "verb", adj: "adjective", adv: "adverb", pron: "pronoun", interj: "interjection", phrase: "phrase", num: "number", conj: "conjunction", prep: "preposition" };
const CAPITALIZED = ["noun", "pl", "name"];
const REVIEW_DAYS = [0, 1, 2, 4, 8, 16]; // days until a card in box 1–5 is due again
const REVIEW_SIZE = 8;
const GENDER = { der: "masculine", die: "feminine", das: "neuter" };
const PRAISE = [["Super!", "Great!"], ["Sehr gut!", "Very good!"], ["Genau!", "Exactly!"], ["Prima!", "Nice one!"], ["Toll!", "Brilliant!"], ["Wunderbar!", "Wonderful!"], ["Richtig!", "Correct!"]];
const TYPE_LABEL = { mcDE: "Multiple choice", mcEN: "Multiple choice", listen: "Listening", fill: "Fill in the blank", type: "Quick translation", article: "der, die or das?" };
const GOALS = [[20, "Casual"], [50, "Regular"], [100, "Serious"], [150, "Intense"]];

const sv = (d, extra) => `<svg viewBox="0 0 24 24" aria-hidden="true"${extra || ""}>${d}</svg>`;
const ST = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  spk: sv(`<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12" ${ST}/>`),
  cards: sv(`<rect x="3" y="6.5" width="13" height="14.5" rx="2" ${ST}/><path d="M8 3h11a2 2 0 0 1 2 2v13" ${ST}/>`),
  box: sv(`<path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" ${ST}/><path d="M6 9V4h12v5M9.5 13h5" ${ST}/>`),
  user: sv(`<circle cx="12" cy="8" r="4" ${ST}/><path d="M4 21a8 8 0 0 1 16 0" ${ST}/>`),
  sliders: sv(`<path d="M4 7h9M18 7h2M4 17h3M12 17h8" ${ST}/><circle cx="15.5" cy="7" r="2.3" ${ST}/><circle cx="9.5" cy="17" r="2.3" ${ST}/>`),
  lock: sv(`<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/>`),
  crown: sv(`<path d="M3 7.5l4.5 4L12 4.5l4.5 7 4.5-4-2 11.5H5z" fill="currentColor"/>`),
  back: sv(`<path d="M15 5l-7 7 7 7" ${ST} stroke-width="2.4"/>`),
  logout: sv(`<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" ${ST}/>`),
  check: sv(`<path d="M5 12.5l4.5 4.5L19 7.5" ${ST} stroke-width="2.6"/>`),
  dash: sv(`<path d="M7 12h10" ${ST}/>`)
};

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const full = w => (w.a ? w.a + " " : "") + w.w;
const fmt = n => n.toLocaleString("en-US");
const level = xp => Math.floor(xp / 100) + 1;
const fmtDate = ts => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
function money(v) { try { return new Intl.NumberFormat("en-US", { style: "currency", currency: CFG.currency }).format(v); } catch (e) { return "$" + v; } }
const priceText = p => money(p.price) + (p.period ? " / " + p.period : " once");
function norm(s) {
  return String(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[.,!?¿¡;:"“”„'’]/g, "").replace(/\s+/g, " ").trim();
}
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
const toTop = () => { try { window.scrollTo(0, 0); } catch (e) {} };
const isLetter = ch => !!ch && /\p{L}/u.test(ch);
// Where the word's form appears as a whole word in its example sentence.
function formIndex(x, f) {
  let i = x.indexOf(f);
  while (i >= 0) {
    if (!isLetter(x[i - 1]) && !isLetter(x[i + f.length])) return i;
    i = x.indexOf(f, i + 1);
  }
  return x.indexOf(f);
}
const readJSON = k => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const removeKey = k => { try { localStorage.removeItem(k); } catch (e) {} };
const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
function hueOf(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }
const initials = n => String(n).trim().split(/\s+/).slice(0, 2).map(x => x[0] || "").join("").toUpperCase() || "?";

/* ---------- preferences (per device) ---------- */
const PREF_KEY = "lingocards:prefs:v1";
const PR = Object.assign({ auto: true, rate: "normal", typing: true, goal: 50, theme: "system", sfx: true }, readJSON(PREF_KEY) || {});
const savePrefs = () => writeJSON(PREF_KEY, PR);
function applyTheme() {
  const r = document.documentElement;
  if (PR.theme === "light" || PR.theme === "dark") r.setAttribute("data-theme", PR.theme);
  else if (applyTheme.touched) r.removeAttribute("data-theme");
}

/* ---------- speech + sound ---------- */
const canSpeak = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
let deVoice = null;
function pickVoice() {
  try {
    const de = (window.speechSynthesis.getVoices() || []).filter(v => /^de([-_]|$)/i.test(v.lang));
    deVoice = de.find(v => /google|natural|online/i.test(v.name)) || de[0] || null;
  } catch (e) { deVoice = null; }
}
if (canSpeak) { pickVoice(); try { window.speechSynthesis.addEventListener("voiceschanged", pickVoice); } catch (e) {} }
function speak(text) {
  if (!canSpeak || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE"; if (deVoice) u.voice = deVoice; u.rate = PR.rate === "slow" ? 0.68 : 0.92;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
const speakBtn = (text, cls) => canSpeak ? `<button type="button" class="speak ${cls || ""}" data-act="speak" data-say="${esc(text)}" aria-label="Play pronunciation">${ICON.spk}</button>` : "";

let actx = null;
function tone(freqs, dur, type, gain) {
  if (!PR.sfx) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime + 0.01;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), s = t0 + i * dur;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(gain, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(s); o.stop(s + dur + 0.03);
    });
  } catch (e) {}
}
const sfx = {
  good: () => tone([660, 990], 0.08, "triangle", 0.07),
  bad: () => tone([233, 175], 0.13, "sawtooth", 0.035),
  hit: () => tone([180, 110], 0.09, "square", 0.05),
  win: () => tone([523, 659, 784, 1047], 0.1, "triangle", 0.07),
  level: () => tone([784, 988, 1175], 0.09, "triangle", 0.06)
};

/* ---------- account + progress ---------- */
let user = SVC.auth.current();
const premium = () => SVC.billing.isPremium(user);
const uid = () => (user ? user.id : null);
const progKey = id => "lingocards:progress:v2:" + (id || "guest");

function fresh() { return { v: 2, xp: 0, streak: 0, best: 0, words: {}, batches: {}, days: {}, bestDays: 0, updatedAt: 0 }; }
function normalize(p) {
  const f = fresh();
  if (!p || typeof p !== "object") return f;
  return Object.assign(f, p, { words: Object.assign({}, p.words || {}), batches: Object.assign({}, p.batches || {}), days: Object.assign({}, p.days || {}) });
}
function loadProgress(id) {
  let p = readJSON(progKey(id));
  if (!p && !id) {
    const old = readJSON("lingocards:de-en:v1"); // version 1 save
    if (old) { p = old; if (typeof old.auto === "boolean") { PR.auto = old.auto; savePrefs(); } }
  }
  return normalize(p);
}
let P = loadProgress(uid());
const saveLocal = () => writeJSON(progKey(uid()), P);
function save() { P.updatedAt = Date.now(); saveLocal(); scheduleRemote(); }

function switchUser(next, mergeGuest) {
  const guestP = P;
  user = next;
  if (next) {
    let acc = readJSON(progKey(next.id));
    if (!acc && mergeGuest && guestP.updatedAt) { acc = guestP; removeKey(progKey(null)); }
    P = normalize(acc);
  } else {
    P = loadProgress(null);
  }
  saveLocal();
  syncRemote();
}

/* Inside the Claude artifact viewer, progress is also kept in the artifact's private store. */
const remote = { db: null, cid: null, ref: null, state: "local", pushing: false, again: false, timer: null, retried: false };
function scheduleRemote() { if (!remote.ref) return; clearTimeout(remote.timer); remote.timer = setTimeout(pushRemote, 1200); }
async function pushRemote() {
  if (!remote.ref) return;
  if (remote.pushing) { remote.again = true; return; }
  remote.pushing = true;
  try { await remote.ref.set(JSON.parse(JSON.stringify(P))); remote.state = "synced"; remote.retried = false; }
  catch (e) {
    if (e && e.code === "unavailable" && !remote.retried) { remote.retried = true; setTimeout(scheduleRemote, 1500 + Math.random() * 2000); }
    else { remote.state = "local"; remote.ref = null; }
  }
  remote.pushing = false; renderSync();
  if (remote.again) { remote.again = false; pushRemote(); }
}
async function initRemote() {
  const c = window.claude;
  if (!c || typeof c.use !== "function") return;
  try {
    const [db, u] = await Promise.all([c.use("db"), c.use("user")]);
    if (!db || !u) return;
    const id = await u.id();
    if (!id) return;
    remote.db = db; remote.cid = id;
    await syncRemote();
  } catch (e) { remote.state = "local"; renderSync(); }
}
async function syncRemote() {
  if (!remote.db) return;
  const forUid = uid();
  try {
    const ref = remote.db.doc("data/users/" + remote.cid + "/" + (forUid ? "progress_" + forUid : "progress"));
    remote.ref = null; remote.state = "syncing"; renderSync();
    const slow = setTimeout(() => { if (remote.state === "syncing") { remote.state = "slow"; renderSync(); } }, 10000);
    const snap = await ref.get();
    clearTimeout(slow);
    if (uid() !== forUid) return;
    remote.ref = ref;
    const theirs = snap.exists ? snap.data() : null;
    if (theirs && (theirs.updatedAt || 0) > (P.updatedAt || 0)) {
      P = normalize(JSON.parse(JSON.stringify(theirs)));
      saveLocal();
      if (!S) render();
    } else if (P.updatedAt && (!theirs || P.updatedAt > (theirs.updatedAt || 0))) pushRemote();
    remote.state = "synced"; renderSync();
  } catch (e) { remote.state = "local"; remote.ref = null; renderSync(); }
}
function syncText() {
  return ({
    local: "Progress is saved in this browser.",
    syncing: "Loading your saved progress…",
    slow: "Your saved progress can't be reached yet. It's kept in this browser for now.",
    synced: "Progress is saved to your Claude account."
  })[remote.state] || "";
}
function renderSync() { document.querySelectorAll("[data-sync]").forEach(el => { el.textContent = syncText(); }); }

/* ---------- derived ---------- */
const wordRec = id => P.words["w" + id];
function learnedIds() { return W.filter(w => { const r = wordRec(w.id); return r && r.b >= 1; }).map(w => w.id); }
const batchDone = i => !!(P.batches["b" + i] && P.batches["b" + i].done);
// Batches unlock in order, and the first batch of every level is always open so you can jump in.
const unlocked = i => i === 0 || batchDone(i - 1) || levelStart(i);
const batchLocked = i => i >= CFG.freeBatches && !premium();
function nextBatch() {
  const from = typeof P.lastDone === "number" ? P.lastDone + 1 : 0;
  for (let i = from; i < DATA.length; i++) if (!batchDone(i)) return i;
  for (let i = 0; i < DATA.length; i++) if (!batchDone(i)) return i;
  return -1;
}
function dueAt(id) {
  const r = wordRec(id);
  if (!r || !r.b) return Infinity;
  return r.due || ((r.t || 0) + REVIEW_DAYS[Math.min(5, r.b)] * 864e5);
}
function dueIds() { const now = Date.now(); return learnedIds().filter(id => dueAt(id) <= now).sort((a, b) => dueAt(a) - dueAt(b)); }
const todayXP = () => P.days[dayKey()] || 0;
function dayStreak() {
  let n = 0; const d = new Date();
  if (!P.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  while ((P.days[dayKey(d)] || 0) > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- toast + scoring ---------- */
let toastT = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.hidden = false;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2800);
}
function addXP(n) {
  const lvBefore = level(P.xp), dayBefore = todayXP(), k = dayKey();
  P.xp += n;
  P.days[k] = (P.days[k] || 0) + n;
  const keys = Object.keys(P.days).sort();
  while (keys.length > 120) delete P.days[keys.shift()];
  P.bestDays = Math.max(P.bestDays || 0, dayStreak());
  if (dayBefore < PR.goal && todayXP() >= PR.goal) { toast("Tagesziel erreicht! Daily goal done: " + PR.goal + " XP."); sfx.win(); }
  else if (level(P.xp) > lvBefore) { toast("Level " + level(P.xp) + " erreicht! You reached level " + level(P.xp) + "."); sfx.level(); }
}
function bumpCombo() {
  P.streak++;
  if (P.streak > P.best) P.best = P.streak;
  if (S) S.runBest = Math.max(S.runBest || 0, P.streak);
  if ([5, 10, 15, 20, 30, 50, 75, 100].includes(P.streak)) toast("⚡ " + P.streak + " in a row! " + P.streak + "er-Serie!");
}
function recordWord(id, ok) {
  const r = Object.assign({ b: 0, s: 0, c: 0, t: 0 }, wordRec(id) || {});
  r.s++; r.t = Date.now();
  if (ok) { r.c++; r.b = Math.min(5, Math.max(1, r.b) + 1); } else r.b = 1;
  r.due = r.t + REVIEW_DAYS[r.b] * 864e5;
  P.words["w" + id] = r;
}

/* ---------- state + routing ---------- */
let S = null;
const ui = {
  confirmReset: false, quitArmed: false, authMode: "login", authError: "", authDraft: {}, authNote: "",
  after: null, plan: "monthly", modal: null, confirmCancel: false, editName: false, nameError: "", busy: false,
  openLevel: null, vocabQ: "", vocabAll: false, vocabLimit: 60
};
let quitT = null, lastView = null;
const ROUTES = ["learn", "review", "profile", "options", "premium", "play"];
const route = () => { const h = (location.hash || "").slice(1); return ROUTES.includes(h) ? h : "learn"; };
function go(to) {
  const h = to === "learn" ? "" : to;
  if ((location.hash || "").slice(1) === h) { render(); toTop(); } else location.hash = h;
}
window.addEventListener("hashchange", () => {
  if (route() !== "play" && S) { S = null; ui.quitArmed = false; }
  ui.confirmReset = false; ui.confirmCancel = false;
  render(); toTop();
});

/* ---------- question building ---------- */
function typesFor(w) {
  const t = ["mcDE", "mcEN", "fill"];
  if (PR.typing) t.push("type");
  if (w.p === "noun") t.push("article");
  if (deVoice) t.push("listen");
  return t;
}
function assignTypes(ids) {
  const used = [];
  return ids.map(id => {
    const all = typesFor(W[id]);
    let pool = all.filter(t => !used.includes(t));
    if (!pool.length) pool = all;
    const t = shuffle(pool)[0]; used.push(t); return t;
  });
}
function otherType(q) { const all = typesFor(W[q.id]).filter(t => t !== q.type); return shuffle(all)[0] || "mcDE"; }
function caseLike(v, ref, x) {
  if (!v || CAPITALIZED.includes(x.p)) return v;
  const up = ref[0] !== ref[0].toLowerCase();
  return (up ? v[0].toUpperCase() : v[0].toLowerCase()) + v.slice(1);
}
function pickDistractors(w, fn, n, samePos) {
  const out = [], seen = new Set([norm(fn(w))]);
  const pools = [
    W.filter(x => x.b === w.b && x.id !== w.id && (!samePos || x.p === w.p)),
    W.filter(x => x.id !== w.id && (!samePos || x.p === w.p)),
    W.filter(x => x.id !== w.id)
  ];
  for (const pool of pools) for (const x of shuffle(pool)) {
    const v = fn(x), k = norm(v);
    if (!seen.has(k)) { seen.add(k); out.push(v); if (out.length === n) return out; }
  }
  return out;
}
function buildQ(id, type, retry) {
  const w = W[id];
  const q = { id, type, retry: !!retry, tries: 0, disabled: [], done: false, last: "", played: false };
  if (type === "mcDE") { q.answer = w.en; q.options = shuffle([w.en].concat(pickDistractors(w, x => x.en, 3, false))); }
  else if (type === "mcEN" || type === "listen") { q.answer = full(w); q.options = shuffle([full(w)].concat(pickDistractors(w, full, 3, true))); }
  else if (type === "fill") { q.answer = w.f; q.options = shuffle([w.f].concat(pickDistractors(w, x => caseLike(x.f, w.f, x), 3, true))); }
  else if (type === "article") { q.answer = w.a; q.options = ["der", "die", "das"]; }
  return q;
}
function buildQueue(ids) { const types = assignTypes(ids); return ids.map((id, i) => buildQ(id, types[i], false)); }
function checkTyped(w, input) {
  let s = norm(input), art = null;
  const m = s.match(/^(der|die|das) (.+)$/);
  if (m && (w.p === "noun" || w.p === "pl")) { art = m[1]; s = m[2]; }
  const targets = [w.w].concat(w.alt).concat(/^sich /.test(w.w) ? [w.w.slice(5)] : []).map(norm);
  let res = targets.includes(s) ? "ok" : (targets[0].length >= 5 && targets.some(t => lev(t, s) <= 1)) ? "typo" : "no";
  if (res !== "no" && art && art !== w.a) res = "article";
  return res;
}
function hintText(q) {
  const w = W[q.id];
  const letters = w.w.replace(/\s/g, "").length;
  switch (q.type) {
    case "mcDE": return "Picture it in a sentence: „" + w.x + "“";
    case "mcEN": return "It sounds like “" + w.ph + "”.";
    case "listen": return "The word you heard means “" + w.en + "”.";
    case "fill": return "The missing word starts with “" + w.f[0] + "” and has " + w.f.length + " letters.";
    case "type": return "It starts with “" + w.w[0] + "”, has " + letters + " letters" + (/\s/.test(w.w) ? " in two words" : "") + ", and sounds like “" + w.ph + "”.";
    case "article": {
      const s = w.w.toLowerCase();
      if (/(ung|heit|keit|schaft|ion|ie|thek)$/.test(s)) return "Nouns ending in -ung, -heit, -keit, -ion, -ie or -thek are almost always die.";
      if (/(chen|lein)$/.test(s)) return "Nouns ending in -chen or -lein are always das.";
      return "Think back to the card's tab: blue is der, red is die, green is das.";
    }
  }
  return "";
}
function answerText(q) {
  const w = W[q.id];
  if (q.type === "mcDE") return w.en;
  if (q.type === "article") return w.a + " " + w.w;
  if (q.type === "fill") return w.x;
  return full(w);
}

/* ---------- play flow ---------- */
function startBatch(bi) {
  if (batchLocked(bi)) { go("premium"); return; }
  const ids = DATA[bi].w.map((_, k) => bi * 10 + k);
  S = { mode: "batch", bi, sets: [ids.slice(0, 3), ids.slice(3, 6), ids.slice(6)], set: 0, phase: "deal", deal: 0, flipped: false,
        queue: [], qi: 0, fb: null, done: 0, total: ids.length, first: 0, xp0: P.xp, runBest: 0, boss: null, result: null };
  ui.quitArmed = false; go("play"); autoSpeakCard();
}
function startReview() {
  if (!premium()) { go("premium"); return; }
  const due = dueIds();
  const weakest = learnedIds().filter(id => !due.includes(id))
    .sort((a, b) => (wordRec(a).b - wordRec(b).b) || ((wordRec(a).t || 0) - (wordRec(b).t || 0)));
  // Enough due cards: review exactly those. Otherwise top up with the weakest cards.
  const ids = (due.length >= 3 ? due : due.concat(weakest)).slice(0, REVIEW_SIZE);
  if (ids.length < 3) return;
  S = { mode: "review", ids, phase: "quiz", queue: buildQueue(shuffle(ids)), qi: 0, fb: null, done: 0, total: ids.length, first: 0, xp0: P.xp, runBest: 0, result: null };
  ui.quitArmed = false; go("play");
}
function autoSpeakCard() { if (PR.auto && S && S.phase === "deal") speak(full(W[S.sets[S.set][S.deal]])); }
function flip() {
  if (!S || S.phase !== "deal") return;
  S.flipped = !S.flipped;
  const el = document.querySelector(".flip");
  if (el) {
    el.classList.toggle("is-flipped", S.flipped);
    el.querySelector(".front").inert = S.flipped;
    el.querySelector(".back").inert = !S.flipped;
  }
  const b = document.querySelector('.btn[data-act="flip"]');
  if (b) b.textContent = S.flipped ? "Show front" : "Flip card";
}
function beginQuiz() { S.phase = "quiz"; S.queue = buildQueue(S.sets[S.set]); S.qi = 0; S.fb = null; render(); toTop(); }
function submit(value) {
  const q = S.queue[S.qi];
  if (!q || q.done) return;
  const w = W[q.id];
  const res = q.type === "type" ? checkTyped(w, String(value || "")) : (q.options[value] === q.answer ? "ok" : "no");
  if (res === "ok" || res === "typo") {
    q.done = true;
    const firstTry = q.tries === 0, gain = firstTry ? 10 : 5;
    addXP(gain);
    if (firstTry) bumpCombo();
    if (!q.retry) { S.done++; if (firstTry) S.first++; recordWord(q.id, firstTry); }
    if (q.type === "type") q.last = String(value);
    S.fb = { kind: "good", gain, firstTry, praise: PRAISE[Math.floor(Math.random() * PRAISE.length)], typo: res === "typo" };
    sfx.good();
    if (PR.auto) setTimeout(() => speak(full(w)), 180);
  } else {
    P.streak = 0; q.tries++;
    if (typeof value === "number") q.disabled.push(value);
    if (q.type === "type") q.last = String(value);
    if (q.tries >= 2) {
      q.done = true;
      if (!q.retry) { S.done++; recordWord(q.id, false); S.queue.push(buildQ(q.id, otherType(q), true)); }
      S.fb = { kind: "reveal" };
    } else S.fb = { kind: "hint", article: res === "article" };
    sfx.bad();
  }
  save(); render();
}
function nextQ() {
  S.fb = null; S.qi++;
  if (S.qi < S.queue.length) { render(); toTop(); return; }
  if (S.mode === "review") return finish();
  if (S.set < S.sets.length - 1) { S.set++; S.phase = "deal"; S.deal = 0; S.flipped = false; render(); toTop(); autoSpeakCard(); return; }
  startBoss();
}

/* ---------- boss ---------- */
const tokens = s => s.replace(/[.,!?¿¡„“"]/g, "").split(/\s+/).filter(Boolean);
function startBoss() {
  let c = S.sets.flat().map(id => ({ id, t: tokens(W[id].x), en: W[id].xe, x: W[id].x })).filter(r => r.t.length >= 3 && r.t.length <= 7);
  c = shuffle(c).sort((a, b) => b.t.length - a.t.length).slice(0, 4);
  S.boss = { rounds: shuffle(c), r: 0, hp: c.length, max: c.length, hearts: 3, state: "intro", picked: [], pool: [], hint: 0 };
  setupRound(); S.boss.state = "intro";
  S.phase = "boss"; render(); toTop();
}
function setupRound() {
  const B = S.boss, rd = B.rounds[B.r];
  let pool = [], tries = 0;
  do { pool = shuffle(rd.t.map((t, i) => ({ i, t }))); tries++; } while (tries < 25 && pool.map(p => p.t).join(" ") === rd.t.join(" "));
  B.pool = pool; B.picked = []; B.state = "play"; B.hint = 0;
}
function resetBoss() { const B = S.boss; B.rounds = shuffle(B.rounds); B.r = 0; B.hp = B.max; B.hearts = 3; setupRound(); }
function bossCheck() {
  const B = S.boss, rd = B.rounds[B.r];
  if (B.picked.length !== B.pool.length) return;
  if (B.picked.map(pi => B.pool[pi].t).join(" ") === rd.t.join(" ")) {
    B.hp--; addXP(15); bumpCombo();
    if (B.hp === 0) { B.state = "won"; addXP(50); sfx.win(); } else { B.state = "hit"; sfx.hit(); }
    speak(rd.x);
  } else {
    P.streak = 0; B.hearts--; B.hint++;
    B.state = B.hearts <= 0 ? "lost" : "miss";
    sfx.bad();
  }
  save(); render();
}
function finish() {
  const acc = S.total ? S.first / S.total : 0;
  const stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1;
  if (S.mode === "batch") {
    const k = "b" + S.bi, prev = P.batches[k];
    P.batches[k] = { done: true, stars: Math.max(stars, (prev && prev.stars) || 0) };
    P.lastDone = S.bi;
  }
  S.result = { stars, acc, gained: P.xp - S.xp0 };
  S.phase = "results"; save(); render(); toTop();
}
function goHome() { S = null; ui.quitArmed = false; go("learn"); }
function quit() {
  if (!S || S.phase === "results" || ui.quitArmed) return goHome();
  ui.quitArmed = true;
  const b = document.querySelector(".x");
  if (b) { b.textContent = "Leave?"; b.classList.add("armed"); b.setAttribute("aria-label", "Tap again to leave"); }
  clearTimeout(quitT);
  quitT = setTimeout(() => {
    ui.quitArmed = false;
    const x = document.querySelector(".x");
    if (x) { x.textContent = "✕"; x.classList.remove("armed"); x.setAttribute("aria-label", "Leave"); }
  }, 3000);
}

/* ---------- shared pieces ---------- */
function starsHTML(n) { return [0, 1, 2].map(i => i < n ? "★" : '<span class="off">★</span>').join(""); }
function avatarHTML(u, size) {
  const st = `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px`;
  if (!u) return `<span class="avatar guest" style="${st}">${ICON.user}</span>`;
  return `<span class="avatar" style="${st};background:hsl(${hueOf(u.id)} 50% 42%)">${esc(initials(u.name))}</span>`;
}
function topbarHTML() {
  return `<header class="topbar"><div class="topbar-in">
    <button class="brand" data-act="go" data-to="learn" aria-label="LingoCards home">Lingo<span>Cards</span></button>
    <span class="plate plate-sm" aria-label="German to English"><b>DE</b><span>→ EN</span></span>
    <div class="tb-right">
      ${premium() ? `<span class="pro-chip">${ICON.crown}Premium</span>` : `<button class="pro-chip pro-chip-up" data-act="go" data-to="premium">${ICON.crown}Go Premium</button>`}
      <button class="avatar-btn" data-act="go" data-to="profile" aria-label="${user ? "Your profile" : "Log in"}">${avatarHTML(user, 36)}</button>
    </div></div></header>`;
}
function tabbarHTML(active) {
  const tabs = [["learn", "Learn", ICON.cards], ["review", "Review", ICON.box], ["profile", user ? "Profile" : "Log in", ICON.user], ["options", "Options", ICON.sliders]];
  const due = dueIds().length;
  return `<nav class="tabbar" aria-label="Main"><div class="tabbar-in">${tabs.map(([id, label, ic]) => {
    const badge = id === "review" && due ? `<span class="tab-badge" aria-label="${due} due">${due > 99 ? "99+" : due}</span>` : "";
    return `<button class="tab-btn ${active === id ? "on" : ""}" data-act="go" data-to="${id}" ${active === id ? 'aria-current="page"' : ""}>${ic}${badge}<span>${label}</span></button>`;
  }).join("")}</div></nav>`;
}
function ringHTML(val, max) {
  const r = 42, c = 2 * Math.PI * r, pct = Math.min(1, val / max);
  return `<div class="ring" role="img" aria-label="${val} of ${max} XP today">
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/>
    ${pct > 0 ? `<circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--sign)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}"/>` : ""}</svg>
    <div class="ring-c"><b>${val}</b><span>of ${max} XP</span></div></div>`;
}
function greeting() { const h = new Date().getHours(); return h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend"; }
function germanDate() { try { return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" }).format(new Date()); } catch (e) { return ""; } }

/* ---------- views: learn ---------- */
function learnHTML() {
  const learned = learnedIds(), nb = nextBatch(), lv = level(P.xp), into = P.xp % 100, tx = todayXP(), ds = dayStreak();
  const first = user ? user.name.split(/\s+/)[0] : "";
  const line = tx >= PR.goal ? "Daily goal done. Tagesziel erreicht!"
    : ds ? `You're on a ${ds}-day streak. ${PR.goal - tx} XP to go today.`
    : `Earn ${PR.goal} XP today to start a streak.`;
  return `<section class="hello"><p class="date">${esc(germanDate())}</p>
      <h1>${greeting()}${first ? `, <span>${esc(first)}</span>` : ""}!</h1><p>${esc(line)}</p></section>
    <section class="today" aria-label="Today">
      ${ringHTML(tx, PR.goal)}
      <dl class="minis">
        <div class="mini"><dt>Day streak</dt><dd>🔥 ${ds}</dd></div>
        <div class="mini"><dt>Words</dt><dd>${learned.length}<small> / ${fmt(GOAL_WORDS)}</small></dd></div>
        <div class="mini mini-wide"><dt>Level ${lv} · ${fmt(P.xp)} XP</dt><dd class="lvl"><span class="bar"><i style="width:${into}%"></i></span><small>${into}/100</small></dd></div>
      </dl>
    </section>
    ${dueCardHTML()}
    ${nextBlockHTML(nb)}
    ${premium() ? "" : `<button class="pro-banner" data-act="go" data-to="premium"><span class="medal">${ICON.crown}</span>
      <span class="pb-text"><b>LingoCards Premium</b><span>Unlock all ${DATA.length} batches, every boss and review mode.</span></span><span class="go">See plans</span></button>`}
    ${routeHTML()}
    <footer class="foot"><p data-sync>${esc(syncText())}</p></footer>`;
}
function dueCardHTML() {
  const n = dueIds().length;
  if (!n) return "";
  const pro = premium();
  return `<button class="due-card" data-act="${pro ? "review" : "go"}" data-to="review">
      <span class="due-ic">${ICON.box}</span>
      <span class="due-text"><b>${n} card${n === 1 ? "" : "s"} due for review</b><span>${pro ? "Review them now to move them up your Leitner box." : "See which words need practice."}</span></span>
      <span class="go">${pro ? "Review" : "View"}</span></button>`;
}
function nextBlockHTML(nb) {
  if (nb < 0) return `<section class="karte has-tab"><span class="tab tab-next">Deck done</span>
      <div class="k-head"><span>All ${DATA.length} batches</span><span>Cards 1–${W.length}</span></div>
      <h2 class="next-title">Every card in this deck is learned</h2>
      <p class="next-meta">Keep reviewing to move cards up to box 5, or replay any batch from the route below.</p></section>`;
  const b = DATA[nb];
  if (batchLocked(nb)) return `<section class="karte has-tab next-pro"><span class="tab tab-pro">Premium</span>
      <div class="k-head"><span>Level ${b.lv + 1} · Batch ${nb + 1} of ${DATA.length}</span><span>Cards ${nb * 10 + 1}–${nb * 10 + 10}</span></div>
      <div><h2 class="next-title">${esc(b.t)}</h2><p class="next-de">${esc(b.de)}</p></div>
      <p class="next-meta">You've finished the free batches. Premium unlocks this batch and ${DATA.length - nb - 1} more, with ${(DATA.length - nb) * 10} new words and their bosses.</p>
      <button class="btn btn-sign btn-wide" data-act="go" data-to="premium">${ICON.crown} Unlock with Premium</button></section>`;
  const started = b.w.some((_, k) => wordRec(nb * 10 + k));
  return `<section class="karte has-tab"><span class="tab tab-next">Next up</span>
      <div class="k-head"><span>Level ${b.lv + 1} · Batch ${nb + 1} of ${DATA.length}</span><span>Cards ${nb * 10 + 1}–${nb * 10 + 10}</span></div>
      <div class="next-row"><div><h2 class="next-title">${esc(b.t)}</h2><p class="next-de">${esc(b.de)}</p></div>
        <span class="boss-mini" style="--h:${hueOf(b.boss.n)}" title="Boss: ${esc(b.boss.n)}">${b.boss.e}</span></div>
      <p class="next-meta">Starts with <b>${b.w.slice(0, 3).map(r => esc(r[0] ? r[0] + " " + r[1] : r[1])).join(" · ")}</b>. Three rounds of cards and quizzes, then the boss <b>${esc(b.boss.n)}</b>.</p>
      <button class="btn btn-primary btn-wide" data-act="start" data-b="${nb}">${started ? "Restart batch " + (nb + 1) : "Deal the first 3 cards"}</button></section>`;
}
function stationHTML(i) {
  const b = DATA[i], st = P.batches["b" + i], open = unlocked(i), locked = batchLocked(i);
  const cls = st && st.done ? "done" : locked ? "pro" : open ? "open" : "locked";
  const end = st && st.done ? `<span aria-label="${st.stars} of 3 stars">${starsHTML(st.stars)}</span>`
    : locked ? `<span class="badge badge-pro">${ICON.lock}Premium</span>` : open ? (levelStart(i) && i > 0 && !batchDone(i - 1) ? "Jump in" : "Start") : "Locked";
  const div = i === CFG.freeBatches && !premium() ? `<li class="route-div is-pro"><span>${ICON.crown} Premium from here on</span></li>` : "";
  return div + `<li class="stn ${cls} ${i >= CFG.freeBatches ? "is-pro" : ""}"><button class="stn-btn" data-act="${locked ? "go" : "start"}" data-to="premium" data-b="${i}" ${open || locked ? "" : "disabled"}>
      <span class="dot" aria-hidden="true"></span>
      <span class="stn-main"><span class="stn-t">${i + 1}. ${esc(b.t)}</span><span class="stn-de">${esc(b.de)} · words ${i * 10 + 1}–${i * 10 + 10}</span></span>
      <span class="stn-end">${end}</span></button></li>`;
}
function routeHTML() {
  const doneCount = DATA.filter((_, i) => batchDone(i)).length;
  const nb = nextBatch();
  const openLv = ui.openLevel == null ? (nb >= 0 ? DATA[nb].lv : 0) : ui.openLevel;
  const levels = LEVELS.map((lv, li) => {
    const idx = Array.from({ length: lv.count }, (_, k) => lv.start + k);
    const done = idx.filter(batchDone).length;
    const stars = idx.reduce((s, i) => s + ((P.batches["b" + i] && P.batches["b" + i].stars) || 0), 0);
    const proOnly = !premium() && lv.start >= CFG.freeBatches;
    const isOpen = li === openLv;
    const status = done === lv.count ? `<span class="lvl-done">${ICON.check}</span>` : proOnly ? `<span class="badge badge-pro">${ICON.lock}Premium</span>` : `<span class="lvl-count">${done}/${lv.count}</span>`;
    return `<div class="lv-card ${isOpen ? "open" : ""} ${done === lv.count ? "complete" : ""}">
      <button class="lvl-head" data-act="level" data-l="${li}" aria-expanded="${isOpen}">
        <span class="lvl-num" aria-hidden="true">${lv.n}</span>
        <span class="lvl-main"><span class="lvl-t">Level ${lv.n} · ${esc(lv.t)}</span>
          <span class="lvl-de">${esc(lv.de)} · words ${lv.start * 10 + 1}–${(lv.start + lv.count) * 10}${stars ? ` · ★ ${stars}` : ""}</span>
          <span class="bar"><i style="width:${(done / lv.count) * 100}%"></i></span></span>
        <span class="lvl-end">${status}</span>
        <span class="chev" aria-hidden="true"></span>
      </button>
      ${isOpen ? `<ol class="route">${idx.map(stationHTML).join("")}</ol>` : ""}
    </div>`;
  }).join("");
  return `<section class="panel" aria-label="Levels">
      <div class="panel-head"><h3>Your route</h3><span class="muted small">${doneCount} of ${DATA.length} batches · ${fmt(W.length)} words</span></div>
      <p class="muted small">Batches unlock in order, and you can jump in at the start of any level.</p>
      <div class="levels">${levels}</div>
      ${W.length < GOAL_WORDS ? `<p class="muted small center">Words ${fmt(W.length + 1)}–${fmt(GOAL_WORDS)} aren't in this deck yet.</p>` : ""}
    </section>`;
}

/* ---------- views: review ---------- */
function reviewHTML() {
  const learned = learnedIds();
  const boxes = [0, 0, 0, 0, 0];
  learned.forEach(id => { boxes[Math.min(5, wordRec(id).b) - 1]++; });
  const maxBox = Math.max(1, ...boxes);
  const due = dueIds().length;
  const size = Math.min(REVIEW_SIZE, learned.length);
  const action = !premium() ? `<button class="btn btn-sign" data-act="go" data-to="premium">${ICON.crown} Unlock review with Premium</button>`
    : learned.length >= 3 ? `<button class="btn btn-primary" data-act="review">${due >= 3 ? `Review ${Math.min(due, REVIEW_SIZE)} due cards` : `Practice my ${size} weakest cards`}</button>`
    : `<p class="small"><b>Learn at least 3 words to start reviewing.</b></p>`;
  return `<h1 class="view-title">Review<span class="de">Wiederholen</span></h1>
    <section class="panel" aria-label="Leitner box">
      <div class="panel-head"><h3>Karteikasten</h3><span class="muted small">${due ? `<b class="due-pill">${due} due today</b>` : learned.length ? "Nothing due right now" : "your Leitner box"}</span></div>
      <div class="boxes">${boxes.map((c, i) => `<div class="bx"><span class="bx-n">${c}</span><span class="bx-bar"><i style="height:${(c / maxBox) * 100}%"></i></span><span class="bx-l">Box ${i + 1}</span><span class="bx-d">${REVIEW_DAYS[i + 1]} day${i ? "s" : ""}</span></div>`).join("")}</div>
      <p class="muted small">A first-try answer moves a card up one box, and higher boxes come back less often. A miss sends it back to box 1, due again tomorrow.</p>
      ${action}
    </section>
    <section class="panel" aria-label="Word list">
      <div class="panel-head"><h3>Wortschatz</h3><span class="muted small">${learned.length} of ${fmt(W.length)} learned</span></div>
      <div class="seg" role="group" aria-label="Which words">
        <button aria-pressed="${!ui.vocabAll}" data-act="vocab-mode" data-all="0">Learned</button>
        <button aria-pressed="${ui.vocabAll}" data-act="vocab-mode" data-all="1">All ${fmt(W.length)}</button>
      </div>
      <label class="sr" for="vocab-q">Search words</label>
      <input id="vocab-q" class="search" type="search" placeholder="Search in German or English" value="${esc(ui.vocabQ)}" autocomplete="off" spellcheck="false">
      <div id="vocab-list">${vocabListHTML()}</div>
    </section>`;
}
function vocabItems() {
  const base = ui.vocabAll ? W.map(w => w.id) : learnedIds();
  const q = norm(ui.vocabQ || "");
  const list = q ? base.filter(id => norm(full(W[id])).includes(q) || norm(W[id].w).includes(q) || norm(W[id].en).includes(q)) : base;
  if (!ui.vocabAll) list.sort((a, b) => (wordRec(a).b - wordRec(b).b) || a - b);
  return list;
}
function vocabListHTML() {
  const list = vocabItems();
  if (!list.length) {
    return `<p class="empty">${ui.vocabQ ? "No words match “" + esc(ui.vocabQ) + "”." : "Words you learn show up here, shakiest first. Start with batch 1 on the Learn tab."}</p>`;
  }
  const shown = list.slice(0, ui.vocabLimit);
  return `<ul class="vocab">${shown.map(id => {
      const w = W[id], r = wordRec(id), b = r && r.b ? r.b : 0;
      const marker = b ? `<span class="boxdots" role="img" aria-label="Box ${b} of 5">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= b ? "on" : ""}"></i>`).join("")}</span>`
        : `<span class="v-num">#${w.n}</span>`;
      return `<li><span class="v-de">${w.a ? `<span class="art art-${w.a}">${w.a}</span> ` : ""}${esc(w.w)}</span><span class="v-en">${esc(w.en)}</span>${marker}${speakBtn(full(w), "sm")}</li>`;
    }).join("")}</ul>${list.length > shown.length ? `<button class="btn btn-ghost btn-wide" data-act="vocab-more">Show more (${fmt(list.length - shown.length)} left)</button>` : ""}`;
}

/* ---------- views: account ---------- */
function authHTML() {
  const signup = ui.authMode === "signup", d = ui.authDraft || {};
  return `<h1 class="view-title">${signup ? "Create your account" : "Welcome back"}<span class="de">${signup ? "Konto erstellen" : "Willkommen zurück"}</span></h1>
    ${ui.authNote ? `<p class="note-line">${esc(ui.authNote)}</p>` : `<p class="lede-left">Keep your XP, streak and words in one place, and unlock Premium.</p>`}
    <section class="panel auth">
      <div class="demo-note"><b>Demo mode</b>Accounts are stored only in this browser. Passwords aren't checked or saved yet.</div>
      <div class="seg" role="tablist" aria-label="Log in or sign up">
        <button role="tab" aria-selected="${!signup}" data-act="auth-mode" data-m="login">Log in</button>
        <button role="tab" aria-selected="${signup}" data-act="auth-mode" data-m="signup">Create account</button>
      </div>
      <form id="authform" class="form" novalidate>
        ${signup ? `<div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" value="${esc(d.name || "")}" required></div>` : ""}
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" value="${esc(d.email || "")}" required></div>
        <div class="field"><label for="f-pass">Password</label><input id="f-pass" name="password" type="password" autocomplete="${signup ? "new-password" : "current-password"}" minlength="8" required>
          ${signup ? `<small class="muted">At least 8 characters.</small>` : ""}</div>
        ${ui.authError ? `<p class="form-error" role="alert">${esc(ui.authError)}</p>` : ""}
        <button class="btn btn-primary btn-wide" type="submit" ${ui.busy ? "disabled" : ""}>${ui.busy ? "One moment…" : signup ? "Create account" : "Log in"}</button>
      </form>
      <div class="or"><span>or</span></div>
      <button class="btn btn-ghost btn-wide" disabled>Continue with Google</button>
      <p class="muted small center">Google sign-in becomes available once real accounts are connected.</p>
    </section>`;
}
function profileHTML() {
  const u = user, pro = premium(), plan = u.plan;
  const learned = learnedIds().length, done = DATA.filter((_, i) => batchDone(i)).length;
  const stars = Object.values(P.batches).reduce((s, b) => s + (b.stars || 0), 0);
  const monthly = CFG.plans.find(p => p.id === "monthly");
  let planBody;
  if (!pro) planBody = `<p>You're on the <b>Free</b> plan, with batches 1–${CFG.freeBatches}.</p><button class="btn btn-sign" data-act="go" data-to="premium">${ICON.crown} See Premium plans</button>`;
  else if (plan.id === "lifetime") planBody = `<p><b>Premium Lifetime</b> since ${fmtDate(plan.since)}. Every batch is yours for good. Danke!</p>`;
  else if (plan.cancelled) planBody = `<p><b>Premium Monthly</b>, cancelled. You keep Premium until ${fmtDate(plan.renewsAt)}.</p><button class="btn btn-ghost" data-act="resume">Keep my subscription</button>`;
  else planBody = `<p><b>Premium Monthly</b> · ${money(monthly ? monthly.price : 0)} a month. Renews on ${fmtDate(plan.renewsAt)}.</p>
    ${ui.confirmCancel ? `<div class="confirm"><p>Cancel your subscription? You'll keep Premium until ${fmtDate(plan.renewsAt)}.</p><div class="row"><button class="btn btn-danger" data-act="cancel-yes">Cancel subscription</button><button class="btn btn-ghost" data-act="cancel-no">Keep it</button></div></div>`
      : `<button class="btn btn-ghost" data-act="cancel-ask">Cancel subscription</button>`}`;
  const stat = (l, v) => `<div><dt>${l}</dt><dd>${v}</dd></div>`;
  return `<section class="profile-card">
      ${avatarHTML(u, 72)}
      <div class="pc-main">
        ${ui.editName ? `<form id="nameform" class="name-form"><label for="f-rename" class="sr">Your name</label><input id="f-rename" name="name" value="${esc(u.name)}" autocomplete="name" data-autofocus><button class="btn btn-primary" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="name-cancel">Cancel</button></form>
          ${ui.nameError ? `<p class="form-error" role="alert">${esc(ui.nameError)}</p>` : ""}`
          : `<h2>${esc(u.name)} <button class="link-btn" data-act="name-edit">Edit</button></h2>`}
        <p>${esc(u.email)}</p>
        <div class="chips">${pro ? `<span class="badge badge-pro">${ICON.crown}Premium</span>` : `<span class="badge">Free plan</span>`}<span class="badge">Member since ${fmtDate(u.createdAt)}</span></div>
      </div></section>
    <dl class="stat-grid">${stat("Total XP", fmt(P.xp))}${stat("Level", level(P.xp))}${stat("Words", learned)}${stat("Day streak", "🔥 " + dayStreak())}${stat("Best streak", (P.bestDays || 0) + " d")}${stat("Best combo", "⚡ " + (P.best || 0))}${stat("Batches", done + "/" + DATA.length)}${stat("Stars", "★ " + stars)}${stat("Boxes 4–5", learnedIds().filter(id => wordRec(id).b >= 4).length)}</dl>
    <section class="panel"><div class="panel-head"><h3>Your plan</h3></div>${planBody}</section>
    <button class="btn btn-ghost btn-wide" data-act="logout">${ICON.logout} Log out</button>`;
}

/* ---------- views: options ---------- */
function optionsHTML() {
  const seg = (k, opts) => `<div class="seg" role="group">${opts.map(([v, l, s]) => `<button aria-pressed="${String(PR[k]) === String(v)}" data-act="pref" data-k="${k}" data-v="${v}">${l}${s ? `<small>${s}</small>` : ""}</button>`).join("")}</div>`;
  const sw = (id, on, title, sub, disabled) => `<label class="row-opt" for="${id}"><span><b>${title}</b><small>${sub}</small></span><input type="checkbox" role="switch" class="switch" id="${id}" ${on ? "checked" : ""} ${disabled ? "disabled" : ""}></label>`;
  const voiceNote = !canSpeak ? "This browser has no speech voices, so audio is off."
    : deVoice ? "Voice: " + deVoice.name : "No German voice found. Your browser's default voice is used.";
  return `<h1 class="view-title">Options<span class="de">Einstellungen</span></h1>
    <section class="panel opts-panel"><div class="panel-head"><h3>Learning</h3></div>
      <div class="opt-block"><span class="opt-label">Daily goal</span>${seg("goal", GOALS.map(([v, l]) => [v, l, v + " XP"]))}</div>
      <div class="divider"></div>
      ${sw("opt-auto", PR.auto, "Read words aloud", "Plays each new card and correct answer. " + voiceNote, !canSpeak)}
      <div class="opt-block"><span class="opt-label">Speaking speed</span>${seg("rate", [["slow", "Slow"], ["normal", "Normal"]])}</div>
      <div class="divider"></div>
      ${sw("opt-typing", PR.typing, "Typing questions", "Turn off to answer with taps only, handy on a phone.")}
    </section>
    <section class="panel opts-panel"><div class="panel-head"><h3>Look and sound</h3></div>
      <div class="opt-block"><span class="opt-label">Theme</span>${seg("theme", [["system", "System"], ["light", "Light"], ["dark", "Dark"]])}</div>
      <div class="divider"></div>
      ${sw("opt-sfx", PR.sfx, "Sound effects", "Short tones for right and wrong answers and boss hits.")}
    </section>
    <section class="panel opts-panel"><div class="panel-head"><h3>Your data</h3></div>
      <p class="small muted" data-sync>${esc(syncText())}</p>
      ${ui.confirmReset ? `<div class="confirm"><p>Erase all XP, streaks, stars and Leitner boxes${user ? " for " + esc(user.name) : ""}? This can't be undone.</p><div class="row"><button class="btn btn-danger" data-act="reset-yes">Erase progress</button><button class="btn btn-ghost" data-act="reset-no">Keep my progress</button></div></div>`
        : `<button class="btn btn-ghost" data-act="reset">Reset progress</button>`}
    </section>
    <section class="panel opts-panel"><div class="panel-head"><h3>About</h3><span class="muted small">Version ${esc(CFG.version)}</span></div>
      <p class="small">LingoCards teaches the 2,000 most useful German words, ten at a time. This deck has cards 1–${W.length}.</p>
      <p class="small muted">Accounts and payments are in demo mode: nothing leaves this browser and no money is charged.</p>
      <p class="small"><a href="${esc(CFG.repoUrl)}" target="_blank" rel="noopener">Source code on GitHub</a></p>
    </section>`;
}

/* ---------- views: premium ---------- */
function premiumHTML() {
  const pro = premium();
  const sel = CFG.plans.find(p => p.id === ui.plan) || CFG.plans[0];
  const row = (label, free, paid) => `<tr><th scope="row">${label}</th><td>${free === true ? `<span class="yes">${ICON.check}</span>` : free === false ? `<span class="no">${ICON.dash}</span>` : free}</td><td>${paid === true ? `<span class="yes">${ICON.check}</span>` : paid}</td></tr>`;
  return `<button class="back-btn" data-act="back">${ICON.back} Back</button>
    <section class="pro-hero">
      <span class="crown">${ICON.crown}</span>
      <h1>LingoCards Premium</h1>
      <p>Every batch, every boss and unlimited review, on the way to all 2,000 words.</p>
    </section>
    ${pro ? `<section class="panel"><div class="panel-head"><h3>You're Premium</h3></div><p>Everything is unlocked. Manage your plan from your profile.</p><button class="btn btn-primary" data-act="go" data-to="learn">Keep learning</button></section>`
    : `<div class="plans" role="radiogroup" aria-label="Choose a plan">${CFG.plans.map(p => `<button class="plan" role="radio" aria-checked="${p.id === sel.id}" data-act="plan" data-id="${p.id}">
          ${p.badge ? `<span class="p-badge">${esc(p.badge)}</span>` : ""}<span class="radio" aria-hidden="true"></span>
          <span class="p-name">${esc(p.name)}</span><span class="p-price">${money(p.price)}<small>${p.period ? " / " + p.period : " once"}</small></span><span class="p-note">${esc(p.note)}</span></button>`).join("")}</div>
      <button class="btn btn-sign btn-wide btn-big" data-act="checkout">Continue · ${esc(priceText(sel))}</button>
      <p class="muted small center">${user ? "Demo mode: no payment is taken." : "You'll create a free account first. Demo mode: no payment is taken."}</p>`}
    <section class="panel"><div class="panel-head"><h3>Free vs Premium</h3></div>
      <div class="table-wrap"><table class="compare">
        <thead><tr><th scope="col"></th><th scope="col">Free</th><th scope="col">Premium</th></tr></thead>
        <tbody>
          ${row(`Batches 1–${CFG.freeBatches} (${CFG.freeBatches * 10} words)`, true, true)}
          ${row(`Batches ${CFG.freeBatches + 1}–${DATA.length} (${(DATA.length - CFG.freeBatches) * 10} words)`, false, true)}
          ${row("Boss battles", CFG.freeBatches + "", "All " + DATA.length)}
          ${row("Review sessions", false, true)}
          ${row("New batches as they're added", false, true)}
          ${row("Daily goals, streaks and XP", true, true)}
        </tbody></table></div>
    </section>`;
}
function modalHTML() {
  const m = ui.modal, p = CFG.plans.find(x => x.id === m.plan);
  let inner;
  if (m.state === "confirm") inner = `<h2 id="mh">Checkout</h2>
      <div class="sum"><span><b>LingoCards Premium</b><span class="muted small">${esc(p.name)} · ${esc(p.note)}</span></span><b class="sum-price">${esc(priceText(p))}</b></div>
      <div class="demo-note"><b>Demo</b>No payment is taken. Once Stripe is connected, this button opens Stripe's secure checkout page, where card details are entered.</div>
      <button class="btn btn-sign btn-wide" data-act="pay" data-autofocus>Simulate payment</button>
      <button class="btn btn-ghost btn-wide" data-act="modal-close">Cancel</button>`;
  else if (m.state === "processing") inner = `<h2 id="mh" class="center">Processing</h2><div class="spinner" role="progressbar" aria-label="Processing"></div><p class="center muted">Confirming your demo payment…</p>`;
  else inner = `<div class="stamp-wrap"><div class="stamp stamp-pro">Premium</div></div><h2 id="mh" class="center">Willkommen bei Premium!</h2>
      <p class="center muted">All ${DATA.length} batches, every boss and review mode are unlocked.</p>
      <button class="btn btn-primary btn-wide" data-act="modal-done" data-autofocus>Start learning</button>`;
  return `<div class="modal-back" data-modal-back><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mh">${inner}</div></div>`;
}

/* ---------- views: play ---------- */
function sbarHTML() {
  let pct;
  if (S.mode === "batch") {
    const bp = S.phase === "results" ? 1 : S.phase === "boss" && S.boss ? (S.boss.max - S.boss.hp) / S.boss.max : 0;
    pct = (S.done / S.total) * 0.8 + bp * 0.2;
  } else pct = S.phase === "results" ? 1 : S.done / S.total;
  return `<div class="sbar">
    <button class="x ${ui.quitArmed ? "armed" : ""}" data-act="quit" aria-label="Leave">${ui.quitArmed ? "Leave?" : "✕"}</button>
    <div class="prog ${S.mode === "batch" ? "with-boss" : ""}" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct * 100)}"><i style="width:${pct * 100}%"></i></div>
    <span class="chip chip-xp" aria-label="${P.xp} XP">${fmt(P.xp)} XP</span>
    <span class="chip" aria-label="Combo ${P.streak}">⚡ ${P.streak}</span>
  </div>`;
}
function cardHTML(w, flipped) {
  const g = w.a;
  const tab = w.p === "pl" ? `<span class="tab tab-pl">die · plural</span>` : g ? `<span class="tab tab-${g}">${g}</span>` : `<span class="tab">${POS[w.p]}</span>`;
  const head = `<div class="k-head"><span>🎴 Card ${fmt(w.n)} / ${fmt(GOAL_WORDS)}</span><span>Category: ${esc(DATA[w.b].t)}</span></div>`;
  const i = formIndex(w.x, w.f);
  const ex = i < 0 ? esc(w.x) : esc(w.x.slice(0, i)) + "<mark>" + esc(w.f) + "</mark>" + esc(w.x.slice(i + w.f.length));
  return `<div class="flip ${flipped ? "is-flipped" : ""}" role="button" tabindex="0" data-act="flip" aria-label="Flashcard. Press to flip.">
    <div class="flip-inner">
      <div class="face front karte" ${flipped ? "inert" : ""}>${tab}${head}
        <div class="k-body">
          <span class="k-label">Target word</span>
          <div class="k-word">${g ? `<span class="art art-${g}">${g}</span> ` : ""}${esc(w.w)}</div>
          <div class="k-pos">${POS[w.p]}${w.p === "noun" && g ? " · " + GENDER[g] : ""}</div>
          <span class="k-label">Pronunciation</span>
          <div class="k-ipa"><span class="ipa">[${esc(w.ipa)}]</span><span class="ph">“${esc(w.ph)}”</span>${speakBtn(full(w))}</div>
        </div>
        <div class="k-foot">Tap the card to see the meaning</div>
      </div>
      <div class="face back karte" ${flipped ? "" : "inert"}>${tab}${head}
        <div class="k-body">
          <span class="k-label">Translation</span>
          <div class="k-tr">${esc(w.en)}</div>
          <span class="k-label">Example sentence</span>
          <div class="k-ex"><span>${ex}</span>${speakBtn(w.x)}</div>
          <span class="k-label">Sentence translation</span>
          <div class="k-exen">${esc(w.xe)}</div>
        </div>
        <div class="k-foot">Tap to flip back</div>
      </div>
    </div></div>`;
}
function dealHTML() {
  const ids = S.sets[S.set], w = W[ids[S.deal]], last = S.deal === ids.length - 1;
  return `<div class="phase-head"><span class="eyebrow">New cards · Round ${S.set + 1} of ${S.sets.length}</span><span>Card ${S.deal + 1} of ${ids.length}</span></div>
    ${cardHTML(w, S.flipped)}
    <div class="pips" aria-hidden="true">${ids.map((_, i) => `<span class="${i <= S.deal ? "on" : ""}"></span>`).join("")}</div>
    <div class="deal-actions">
      <button class="btn btn-ghost" data-act="flip">${S.flipped ? "Show front" : "Flip card"}</button>
      <button class="btn btn-primary" data-act="${last ? "quiz" : "nextcard"}" data-autofocus>${last ? "Start the quiz" : "Next card"}</button>
    </div>`;
}
function promptHTML(q, w) {
  switch (q.type) {
    case "mcDE": return `<h2 class="qprompt">What does <span class="de">${esc(full(w))}</span> mean? ${speakBtn(full(w))}</h2>`;
    case "mcEN": return `<h2 class="qprompt">Which German word means “${esc(w.en)}”?</h2>`;
    case "listen": return `<h2 class="qprompt">Listen, then pick the word you hear.</h2><button class="btn btn-sign listen-btn" data-act="speak" data-say="${esc(full(w))}">${ICON.spk} Play the word</button>`;
    case "fill": {
      const i = formIndex(w.x, w.f);
      return `<h2 class="qprompt qprompt-de">${esc(w.x.slice(0, i))}<span class="blank ${q.done ? "filled" : ""}">${q.done ? esc(w.f) : '<span class="sr">blank</span>&nbsp;'}</span>${esc(w.x.slice(i + w.f.length))}</h2><p class="qsub">${esc(w.xe)}</p>`;
    }
    case "type": return `<h2 class="qprompt">Type the German for “${esc(w.en)}”</h2>${w.p === "noun" ? '<p class="qsub">The article is optional, but if you add one it has to be right.</p>' : ""}`;
    case "article": return `<h2 class="qprompt qprompt-de"><span class="blank ${q.done ? "filled" : ""}">${q.done ? esc(w.a) : '<span class="sr">blank</span>&nbsp;'}</span> ${esc(w.w)}</h2><p class="qsub">${esc(w.en)}</p>`;
  }
  return "";
}
function quizHTML() {
  const q = S.queue[S.qi], w = W[q.id];
  let body;
  if (q.options) {
    body = `<div class="opts ${q.type === "article" ? "opts-3" : ""}">${q.options.map((o, i) => {
      const wrong = q.disabled.includes(i), right = q.done && o === q.answer;
      return `<button class="opt ${wrong ? "is-wrong" : ""} ${right ? "is-right" : ""}" data-act="pick" data-i="${i}" ${wrong || q.done ? "disabled" : ""}><span class="key">${i + 1}</span><span class="opt-t">${esc(o)}</span></button>`;
    }).join("")}</div>`;
  } else {
    body = `<form id="typeform" class="typeform" autocomplete="off">
      <label for="ans" class="sr">Your answer in German</label>
      <input id="ans" name="ans" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type in German" value="${esc(q.last)}" ${q.done ? "disabled" : "data-autofocus"}>
      <div class="type-row">${["ä", "ö", "ü", "ß"].map(c => `<button type="button" class="uml" data-act="uml" data-c="${c}" ${q.done ? "disabled" : ""} aria-label="Insert ${c}">${c}</button>`).join("")}
        <button class="btn btn-primary" type="submit" ${q.done ? "disabled" : ""}>Check</button></div>
    </form>`;
  }
  const f = S.fb;
  let fb = "";
  if (f && f.kind === "good") {
    fb = `<div class="fb fb-good" role="status"><div class="fb-title">${f.praise[0]} <span class="fb-sub">${f.praise[1]}${f.firstTry ? "" : " (after a hint)"}</span><span class="gain">+${f.gain} XP</span></div>
      ${f.typo ? `<p>Close enough. Watch the spelling: <b>${esc(w.w)}</b></p>` : ""}
      <p class="fb-card"><b>${esc(full(w))}</b> means ${esc(w.en)}.</p>
      <button class="btn btn-primary" data-act="next" data-autofocus>Continue</button></div>`;
  } else if (f && f.kind === "hint") {
    fb = `<div class="fb fb-hint" role="status"><div class="fb-title">Nicht ganz <span class="fb-sub">Not quite. Try again for +5 XP.</span></div>
      <p>${f.article ? "Right word, wrong article. " : ""}Hint: ${esc(hintText(q))}</p></div>`;
  } else if (f && f.kind === "reveal") {
    fb = `<div class="fb fb-bad" role="status"><div class="fb-title">Schade! <span class="fb-sub">Too bad. Here's the answer.</span></div>
      <p class="fb-answer">${esc(answerText(q))}</p>
      <p class="fb-card"><b>${esc(full(w))}</b> means ${esc(w.en)}. „${esc(w.x)}“ ${esc(w.xe)}</p>
      ${q.retry ? "" : "<p>This card comes back at the end of the round.</p>"}
      <button class="btn btn-primary" data-act="next" data-autofocus>Continue</button></div>`;
  }
  const head = S.mode === "review" ? "Review" : "Quiz · Round " + (S.set + 1) + " of " + S.sets.length;
  return `<div class="phase-head"><span class="eyebrow">${head}</span><span>${q.retry ? "Second chance" : "Question " + (S.qi + 1) + " of " + S.queue.length}</span></div>
    <div class="qcard"><div class="qtype">${TYPE_LABEL[q.type]}</div>${promptHTML(q, w)}${body}</div>${fb}`;
}
function bossHTML() {
  const B = S.boss, bd = DATA[S.bi].boss;
  const hearts = [0, 1, 2].map(i => `<span class="heart ${i < B.hearts ? "" : "lost"}" aria-hidden="true">♥</span>`).join("");
  const head = `<div class="boss-top"><div class="boss-face ${B.state === "hit" || B.state === "won" ? "hit" : ""}" style="--h:${hueOf(bd.n)}" aria-hidden="true">${bd.e}</div>
      <div class="boss-id"><span class="boss-eyebrow">Boss battle · Batch ${S.bi + 1}</span><h2 class="boss-name">${esc(bd.n)}</h2><p class="boss-gloss">${esc(bd.g)}</p></div></div>
    <div class="boss-meters"><div class="hp" role="img" aria-label="Boss health ${B.hp} of ${B.max}"><i style="width:${(B.hp / B.max) * 100}%"></i></div>
      <div class="meter-row"><span>HP ${B.hp}/${B.max}</span><span class="hearts" role="img" aria-label="${B.hearts} of 3 hearts left">${hearts}</span></div></div>`;
  if (B.state === "intro") {
    return `<div class="arena">${head}<p class="scenario">${esc(bd.s)}</p>
      <ul class="rules"><li>Build ${B.max} German sentences from this batch's cards.</li><li>Each correct sentence hits for 1 HP and earns 15 XP.</li><li>A wrong word order costs a heart. Lose all 3 and the boss wins.</li><li>Win to earn a 50 XP bonus and finish the batch.</li></ul>
      <button class="btn btn-sign btn-wide" data-act="boss-start" data-autofocus>Start the battle</button></div>`;
  }
  const rd = B.rounds[B.r];
  if (B.state === "lost") {
    return `<div class="arena">${head}<div class="bmsg bmsg-miss" role="status"><b>Verloren</b> ${esc(bd.n)} wins this time. The sentence was:<span class="de-line">„${esc(rd.x)}“</span></div>
      <div class="row"><button class="btn btn-sign" data-act="rematch" data-autofocus>Rematch</button><button class="btn btn-ghost-dark" data-act="home">Back to the route</button></div></div>`;
  }
  const live = B.state === "play" || B.state === "miss";
  const slots = B.picked.length ? B.picked.map((pi, pos) => `<button class="tile" data-act="unpick" data-pos="${pos}" ${live ? "" : "disabled"} aria-label="Remove ${esc(B.pool[pi].t)}">${esc(B.pool[pi].t)}</button>`).join("")
    : `<span class="slot-ph">Tap the words below in the right order</span>`;
  const pool = B.pool.map((p, pi) => { const used = B.picked.includes(pi); return `<button class="tile ${used ? "used" : ""}" data-act="pickt" data-pi="${pi}" ${used || !live ? "disabled" : ""}>${esc(p.t)}</button>`; }).join("");
  let msg = "";
  if (B.state === "miss") msg = `<div class="bmsg bmsg-miss" role="status"><b>Daneben!</b> Missed, and you lost a heart. Hint: it starts with „${esc(rd.t.slice(0, Math.min(B.hint, rd.t.length - 1)).join(" "))} …“</div>`;
  if (B.state === "hit") msg = `<div class="bmsg" role="status"><b>Treffer!</b> A hit for 1 HP and 15 XP.<span class="de-line">„${esc(rd.x)}“</span></div>`;
  if (B.state === "won") msg = `<div class="bmsg" role="status"><b>Besiegt!</b> ${esc(bd.n)} is defeated. You earn 15 XP plus the 50 XP boss bonus.<span class="de-line">„${esc(rd.x)}“</span></div>`;
  const actions = B.state === "hit" ? `<button class="btn btn-sign btn-wide" data-act="boss-next" data-autofocus>Next round</button>`
    : B.state === "won" ? `<button class="btn btn-sign btn-wide" data-act="boss-won" data-autofocus>Claim your reward</button>`
    : `<div class="row"><button class="btn btn-ghost-dark" data-act="clear" ${B.picked.length ? "" : "disabled"}>Clear</button><button class="btn btn-sign" data-act="attack" ${B.picked.length === B.pool.length ? "" : "disabled"}>Attack</button></div>`;
  return `<div class="arena">${head}
    <div class="round"><span class="boss-eyebrow">Round ${B.r + 1} of ${B.max}</span><p class="build-prompt">Say it in German: <b>“${esc(rd.en)}”</b></p></div>
    <div class="slots" aria-label="Your sentence">${slots}</div>
    <div class="pool" aria-label="Word tiles">${pool}</div>
    ${msg}${actions}</div>`;
}
function resultsHTML() {
  const r = S.result, batch = S.mode === "batch";
  const ids = batch ? S.sets.flat() : S.ids;
  const nb = batch && S.bi + 1 < DATA.length ? S.bi + 1 : -1;
  const nextBtn = nb < 0 ? "" : batchLocked(nb)
    ? `<button class="btn btn-sign" data-act="go" data-to="premium" data-autofocus>${ICON.crown} Unlock batch ${nb + 1}</button>`
    : `<button class="btn btn-primary" data-act="start" data-b="${nb}" data-autofocus>Next: batch ${nb + 1}</button>`;
  return `<div class="results">
    <div class="stamp-wrap"><div class="stamp">${batch ? "Bestanden" : "Geübt"}</div></div>
    <h2>${batch ? "Batch " + (S.bi + 1) + " complete" : "Review complete"}</h2>
    <p class="lede">${batch ? esc(DATA[S.bi].boss.n) + " is defeated, and " + ids.length + " cards are now in your Leitner box." : "Your Leitner box is updated."}</p>
    ${batch && (() => { const lv = LEVELS[DATA[S.bi].lv]; return Array.from({ length: lv.count }, (_, k) => lv.start + k).every(batchDone); })()
      ? `<p class="level-up">${ICON.crown} Level ${DATA[S.bi].lv + 1} complete: ${esc(LEVELS[DATA[S.bi].lv].t)}!</p>` : ""}
    <div class="stars" role="img" aria-label="${r.stars} of 3 stars">${starsHTML(r.stars)}</div>
    <dl class="rstats"><div><dt>XP earned</dt><dd>+${r.gained}</dd></div><div><dt>First try</dt><dd>${S.first}/${S.total}</dd></div><div><dt>Best combo</dt><dd>${S.runBest || 0}</dd></div></dl>
    <ul class="wlist">${ids.map(id => `<li><span class="${W[id].a ? "art-" + W[id].a : ""}">${esc(full(W[id]))}</span><span>${esc(W[id].en)}</span></li>`).join("")}</ul>
    <div class="row">${nextBtn}<button class="btn btn-ghost" data-act="home" ${nb >= 0 ? "" : "data-autofocus"}>Back to the route</button></div>
  </div>`;
}
function stageHTML() { return S.phase === "deal" ? dealHTML() : S.phase === "quiz" ? quizHTML() : S.phase === "boss" ? bossHTML() : resultsHTML(); }

/* ---------- render ---------- */
function render() {
  const app = document.getElementById("app");
  const r = route();
  let html;
  try {
    if (r === "play" && S) html = `<div class="wrap">${sbarHTML()}<main class="stage">${stageHTML()}</main></div>`;
    else {
      const v = r === "play" ? "learn" : r;
      const body = v === "review" ? reviewHTML() : v === "profile" ? (user ? profileHTML() : authHTML()) : v === "options" ? optionsHTML() : v === "premium" ? premiumHTML() : learnHTML();
      html = topbarHTML() + `<main class="view ${lastView !== v ? "enter" : ""}" id="main">${body}</main>` + tabbarHTML(v === "premium" ? "" : v);
      lastView = v;
    }
  } catch (err) {
    console.error(err); S = null; lastView = "learn";
    html = topbarHTML() + `<main class="view">${learnHTML()}</main>` + tabbarHTML("learn");
  }
  if (r === "play" && S) lastView = "play";
  app.innerHTML = html + (ui.modal ? modalHTML() : "");
  const af = app.querySelector(ui.modal ? ".modal [data-autofocus]:not([disabled])" : "[data-autofocus]:not([disabled])");
  if (af) { try { af.focus({ preventScroll: true }); } catch (e) {} }
  if (r === "play" && S && S.phase === "quiz") {
    const q = S.queue[S.qi];
    if (q && q.type === "listen" && !q.played) { q.played = true; setTimeout(() => speak(full(W[q.id])), 200); }
  }
  if (S && S.fb && (S.fb.kind === "good" || S.fb.kind === "reveal")) {
    const fbEl = app.querySelector(".fb");
    if (fbEl && fbEl.scrollIntoView) { try { fbEl.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {} }
  }
}

/* ---------- account + payment actions ---------- */
async function onAuth(form) {
  if (ui.busy) return;
  const fd = new FormData(form);
  const name = String(fd.get("name") || ""), email = String(fd.get("email") || ""), password = String(fd.get("password") || "");
  ui.authDraft = { name, email }; ui.authError = ""; ui.busy = true; render();
  try {
    const u = ui.authMode === "signup" ? await SVC.auth.signUp({ name, email, password }) : await SVC.auth.logIn({ email, password });
    const wasGuest = !user;
    switchUser(u, wasGuest);
    ui.busy = false; ui.authDraft = {}; ui.authNote = "";
    toast(ui.authMode === "signup" ? "Willkommen, " + u.name + "! Your account is ready." : "Willkommen zurück, " + u.name + "!");
    const after = ui.after; ui.after = null;
    go(after || "learn");
  } catch (e) {
    ui.busy = false; ui.authError = e.message || "Something went wrong. Try again."; render();
    const f = document.getElementById(ui.authMode === "signup" && !name.trim() ? "f-name" : "f-email");
    if (f) f.focus();
  }
}
async function onRename(form) {
  try { user = await SVC.auth.updateName(new FormData(form).get("name")); ui.editName = false; ui.nameError = ""; toast("Name saved."); }
  catch (e) { ui.nameError = e.message; }
  render();
}
async function checkout() {
  if (!user) { ui.after = "premium"; ui.authMode = "signup"; ui.authNote = "Create a free account first, then pick your plan."; go("profile"); return; }
  try {
    const res = await SVC.billing.startCheckout(ui.plan);
    if (res && res.redirect) { location.href = res.redirect; return; }
    ui.modal = { plan: ui.plan, state: "confirm" }; render();
  } catch (e) { toast(e.message); }
}
async function pay() {
  ui.modal.state = "processing"; render();
  try { user = await SVC.billing.completeDemoPurchase(ui.modal.plan); ui.modal.state = "done"; sfx.win(); }
  catch (e) { ui.modal = null; toast(e.message); }
  render();
}

/* ---------- events ---------- */
function insertChar(c) {
  const inp = document.getElementById("ans");
  if (!inp || inp.disabled) return;
  const s = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
  const e = inp.selectionEnd == null ? inp.value.length : inp.selectionEnd;
  inp.value = inp.value.slice(0, s) + c + inp.value.slice(e);
  inp.focus(); try { inp.setSelectionRange(s + 1, s + 1); } catch (err) {}
}
async function act(a, d) {
  switch (a) {
    case "go": go(d.to); break;
    case "back": if (history.length > 1) history.back(); else go("learn"); break;
    case "start": startBatch(+d.b); break;
    case "review": startReview(); break;
    case "speak": speak(d.say); break;
    case "flip": flip(); break;
    case "nextcard": S.deal++; S.flipped = false; render(); autoSpeakCard(); break;
    case "quiz": beginQuiz(); break;
    case "pick": submit(+d.i); break;
    case "uml": insertChar(d.c); break;
    case "next": nextQ(); break;
    case "boss-start": S.boss.state = "play"; render(); break;
    case "pickt": { const B = S.boss; if ((B.state === "play" || B.state === "miss") && !B.picked.includes(+d.pi)) { B.picked.push(+d.pi); render(); } break; }
    case "unpick": { const B = S.boss; if (B.state === "play" || B.state === "miss") { B.picked.splice(+d.pos, 1); render(); } break; }
    case "clear": S.boss.picked = []; render(); break;
    case "attack": bossCheck(); break;
    case "boss-next": S.boss.r++; setupRound(); render(); break;
    case "boss-won": finish(); break;
    case "rematch": resetBoss(); render(); break;
    case "quit": quit(); break;
    case "home": goHome(); break;
    case "auth-mode": ui.authMode = d.m; ui.authError = ""; render(); break;
    case "logout": { const n = user ? user.name : ""; await SVC.auth.logOut(); switchUser(null, false); ui.confirmCancel = false; toast("Logged out. Tschüss" + (n ? ", " + n : "") + "!"); go("learn"); break; }
    case "name-edit": ui.editName = true; ui.nameError = ""; render(); break;
    case "name-cancel": ui.editName = false; ui.nameError = ""; render(); break;
    case "pref": PR[d.k] = d.k === "goal" ? +d.v : d.v; savePrefs(); if (d.k === "theme") { applyTheme.touched = true; applyTheme(); } render(); break;
    case "reset": ui.confirmReset = true; render(); break;
    case "reset-no": ui.confirmReset = false; render(); break;
    case "reset-yes": P = fresh(); ui.confirmReset = false; save(); render(); toast("Progress erased."); break;
    case "plan": ui.plan = d.id; render(); break;
    case "level": { const li = +d.l, cur = ui.openLevel == null ? (nextBatch() >= 0 ? DATA[nextBatch()].lv : 0) : ui.openLevel; ui.openLevel = cur === li ? -1 : li; render(); break; }
    case "vocab-mode": ui.vocabAll = d.all === "1"; ui.vocabLimit = 60; render(); break;
    case "vocab-more": { ui.vocabLimit += 100; const box = document.getElementById("vocab-list"); if (box) box.innerHTML = vocabListHTML(); break; }
    case "checkout": checkout(); break;
    case "pay": pay(); break;
    case "modal-close": ui.modal = null; render(); break;
    case "modal-done": ui.modal = null; go("learn"); break;
    case "cancel-ask": ui.confirmCancel = true; render(); break;
    case "cancel-no": ui.confirmCancel = false; render(); break;
    case "cancel-yes": user = await SVC.billing.cancel(); ui.confirmCancel = false; toast("Subscription cancelled. Premium stays on until the end of your period."); render(); break;
    case "resume": user = await SVC.billing.resume(); toast("Your subscription continues."); render(); break;
  }
}
const app = document.getElementById("app");
app.addEventListener("click", e => {
  if (ui.modal && e.target.hasAttribute && e.target.hasAttribute("data-modal-back")) { if (ui.modal.state === "confirm") { ui.modal = null; render(); } return; }
  const t = e.target.closest("[data-act]");
  if (!t || t.disabled || !app.contains(t)) return;
  act(t.dataset.act, t.dataset);
});
app.addEventListener("mousedown", e => { if (e.target.closest(".uml")) e.preventDefault(); });
app.addEventListener("submit", e => {
  e.preventDefault();
  const id = e.target.id;
  if (id === "typeform") { const v = e.target.querySelector("#ans").value; if (v.trim()) submit(v); }
  else if (id === "authform") onAuth(e.target);
  else if (id === "nameform") onRename(e.target);
});
app.addEventListener("input", e => {
  if (e.target.id !== "vocab-q") return;
  ui.vocabQ = e.target.value; ui.vocabLimit = 60;
  const box = document.getElementById("vocab-list");
  if (box) box.innerHTML = vocabListHTML();
});
app.addEventListener("change", e => {
  const id = e.target.id;
  if (id === "opt-auto") PR.auto = e.target.checked;
  else if (id === "opt-typing") PR.typing = e.target.checked;
  else if (id === "opt-sfx") { PR.sfx = e.target.checked; if (PR.sfx) sfx.good(); }
  else return;
  savePrefs();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && ui.modal && ui.modal.state === "confirm") { ui.modal = null; render(); return; }
  if (route() !== "play" || !S || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  if (S.phase === "deal") {
    const onCard = e.target.closest && e.target.closest(".flip");
    if ((e.key === " " || e.key === "Enter") && onCard) { e.preventDefault(); flip(); }
    else if (e.key === "f" || e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); flip(); }
    else if (e.key === "ArrowRight" && tag !== "button") { const ids = S.sets[S.set]; if (S.deal < ids.length - 1) act("nextcard", {}); else beginQuiz(); }
  } else if (S.phase === "quiz") {
    const q = S.queue[S.qi];
    if (S.fb && (S.fb.kind === "good" || S.fb.kind === "reveal")) { if (e.key === "Enter" && tag !== "button") { e.preventDefault(); nextQ(); } return; }
    if (q && q.options && /^[1-4]$/.test(e.key)) { const i = +e.key - 1; if (i < q.options.length && !q.disabled.includes(i)) submit(i); }
  }
});

/* ---------- boot ---------- */
applyTheme();
if (route() === "play") { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
render();
initRemote();
})();
