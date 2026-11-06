(function () {
"use strict";

const DATA = window.LINGO_DATA;

const W = [];
DATA.forEach((b, bi) => b.w.forEach((r, k) => W.push({
  id: bi * 10 + k, n: bi * 10 + k + 1, b: bi, a: r[0], w: r[1], p: r[2], ipa: r[3], ph: r[4],
  en: r[5], x: r[6], xe: r[7], f: r[8], alt: r[9] || []
})));

const GOAL = 2000;
const POS = { noun: "noun", verb: "verb", adj: "adjective", adv: "adverb", pron: "pronoun", interj: "interjection", phrase: "phrase", num: "number" };
const GENDER = { der: "masculine", die: "feminine", das: "neuter" };
const PRAISE = [["Super!", "Great!"], ["Sehr gut!", "Very good!"], ["Genau!", "Exactly!"], ["Prima!", "Nice one!"], ["Toll!", "Brilliant!"], ["Wunderbar!", "Wonderful!"], ["Richtig!", "Correct!"]];
const TYPE_LABEL = { mcDE: "Multiple choice", mcEN: "Multiple choice", listen: "Listening", fill: "Fill in the blank", type: "Quick translation", article: "der, die or das?" };
const ICON_SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_SET = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M18 7h2M4 17h3M12 17h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="15.5" cy="7" r="2.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9.5" cy="17" r="2.3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const full = w => (w.a ? w.a + " " : "") + w.w;
const fmt = n => n.toLocaleString("en-US");
const level = xp => Math.floor(xp / 100) + 1;
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

/* ---------- speech ---------- */
const canSpeak = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
let deVoice = null;
function pickVoice() {
  try {
    const vs = window.speechSynthesis.getVoices() || [];
    const de = vs.filter(v => /^de([-_]|$)/i.test(v.lang));
    deVoice = de.find(v => /google|natural|online/i.test(v.name)) || de[0] || null;
  } catch (e) { deVoice = null; }
}
if (canSpeak) { pickVoice(); try { window.speechSynthesis.addEventListener("voiceschanged", pickVoice); } catch (e) {} }
function speak(text) {
  if (!canSpeak || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE"; if (deVoice) u.voice = deVoice; u.rate = 0.88;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
const speakBtn = text => canSpeak ? `<button type="button" class="speak" data-act="speak" data-say="${esc(text)}" aria-label="Play pronunciation">${ICON_SPK}</button>` : "";

/* ---------- progress: this browser first, then your account when the viewer offers it ---------- */
const KEY = "lingocards:de-en:v1";
function fresh() { return { v: 1, xp: 0, streak: 0, best: 0, words: {}, batches: {}, auto: true, updatedAt: 0 }; }
function normalize(p) {
  const f = fresh();
  if (!p || typeof p !== "object") return f;
  return Object.assign(f, p, { words: Object.assign({}, p.words || {}), batches: Object.assign({}, p.batches || {}) });
}
function loadLocal() { try { const s = localStorage.getItem(KEY); return s ? normalize(JSON.parse(s)) : null; } catch (e) { return null; } }
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
let P = loadLocal() || fresh();

const remote = { ref: null, state: "local", pushing: false, again: false, timer: null, retried: false };
function save() { P.updatedAt = Date.now(); saveLocal(); scheduleRemote(); }
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
    const [db, user] = await Promise.all([c.use("db"), c.use("user")]);
    if (!db || !user) return;
    const id = await user.id();
    if (!id) return;
    const ref = db.doc("data/users/" + id + "/progress");
    remote.state = "syncing"; renderSync();
    const slow = setTimeout(() => { if (remote.state === "syncing") { remote.state = "slow"; renderSync(); } }, 10000);
    const snap = await ref.get();
    clearTimeout(slow);
    remote.ref = ref;
    const theirs = snap.exists ? snap.data() : null;
    if (theirs && (theirs.updatedAt || 0) > (P.updatedAt || 0)) {
      P = normalize(JSON.parse(JSON.stringify(theirs)));
      saveLocal();
      if (view === "home") render();
    } else if (P.updatedAt && (!theirs || (P.updatedAt || 0) > (theirs.updatedAt || 0))) {
      pushRemote();
    }
    remote.state = "synced"; renderSync();
  } catch (e) { remote.state = "local"; remote.ref = null; renderSync(); }
}
function syncText() {
  return ({
    local: "Progress is saved in this browser.",
    syncing: "Loading your saved progress…",
    slow: "Your account can't be reached yet. Progress is saved in this browser for now.",
    synced: "Progress is saved to your account."
  })[remote.state] || "";
}
function renderSync() { const el = document.getElementById("sync"); if (el) el.textContent = syncText(); }

/* ---------- derived ---------- */
const wordRec = id => P.words["w" + id];
function learnedIds() { return W.filter(w => { const r = wordRec(w.id); return r && r.b >= 1; }).map(w => w.id); }
const batchDone = i => !!(P.batches["b" + i] && P.batches["b" + i].done);
const unlocked = i => i === 0 || batchDone(i - 1);
function nextBatch() { for (let i = 0; i < DATA.length; i++) if (!batchDone(i)) return i; return -1; }

/* ---------- toast ---------- */
let toastT = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.hidden = false;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600);
}
function addXP(n) {
  const before = level(P.xp);
  P.xp += n;
  if (level(P.xp) > before) toast("Level " + level(P.xp) + " erreicht! You reached level " + level(P.xp) + ".");
}
function bumpStreak() {
  P.streak++;
  if (P.streak > P.best) P.best = P.streak;
  if (S) S.runBest = Math.max(S.runBest || 0, P.streak);
  if ([5, 10, 15, 20, 30, 50, 75, 100].includes(P.streak)) toast("🔥 " + P.streak + " in a row! " + P.streak + "er-Serie!");
}
function recordWord(id, ok) {
  const r = Object.assign({ b: 0, s: 0, c: 0, t: 0 }, wordRec(id) || {});
  r.s++; r.t = Date.now();
  if (ok) { r.c++; r.b = Math.min(5, Math.max(1, r.b) + 1); } else r.b = 1;
  P.words["w" + id] = r;
}

/* ---------- state ---------- */
let view = "home";
let S = null;
const ui = { settings: false, confirmReset: false, quitArmed: false };
let quitT = null;

/* ---------- question building ---------- */
function typesFor(w) {
  const t = ["mcDE", "mcEN", "fill", "type"];
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
  if (!v || x.p === "noun") return v;
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
  if (m && w.p === "noun") { art = m[1]; s = m[2]; }
  const targets = [w.w].concat(w.alt).map(norm);
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
      if (/(ung|heit|keit|schaft|ion|ie)$/.test(s)) return "Nouns ending in -ung, -heit, -keit, -ion or -ie are almost always die.";
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

/* ---------- flow ---------- */
function startBatch(bi) {
  const ids = DATA[bi].w.map((_, k) => bi * 10 + k);
  S = { mode: "batch", bi, sets: [ids.slice(0, 3), ids.slice(3, 6), ids.slice(6)], set: 0, phase: "deal", deal: 0, flipped: false,
        queue: [], qi: 0, fb: null, done: 0, total: ids.length, first: 0, xp0: P.xp, runBest: 0, boss: null, result: null };
  view = "session"; ui.quitArmed = false; render(); toTop(); autoSpeakCard();
}
function startReview() {
  const ids = learnedIds().sort((a, b) => (wordRec(a).b - wordRec(b).b) || ((wordRec(a).t || 0) - (wordRec(b).t || 0))).slice(0, 6);
  if (ids.length < 3) return;
  S = { mode: "review", ids, phase: "quiz", queue: buildQueue(shuffle(ids)), qi: 0, fb: null, done: 0, total: ids.length, first: 0, xp0: P.xp, runBest: 0, result: null };
  view = "session"; ui.quitArmed = false; render(); toTop();
}
function autoSpeakCard() {
  if (!P.auto || !S || S.phase !== "deal") return;
  speak(full(W[S.sets[S.set][S.deal]]));
}
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
    const firstTry = q.tries === 0;
    const gain = firstTry ? 10 : 5;
    addXP(gain);
    if (firstTry) bumpStreak();
    if (!q.retry) { S.done++; if (firstTry) S.first++; recordWord(q.id, firstTry); }
    if (q.type === "type") q.last = String(value);
    S.fb = { kind: "good", gain, firstTry, praise: PRAISE[Math.floor(Math.random() * PRAISE.length)], typo: res === "typo" };
    if (P.auto) speak(full(w));
  } else {
    P.streak = 0;
    q.tries++;
    if (typeof value === "number") q.disabled.push(value);
    if (q.type === "type") q.last = String(value);
    if (q.tries >= 2) {
      q.done = true;
      if (!q.retry) { S.done++; recordWord(q.id, false); S.queue.push(buildQ(q.id, otherType(q), true)); }
      S.fb = { kind: "reveal" };
    } else {
      S.fb = { kind: "hint", article: res === "article" };
    }
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
  setupRound();
  S.boss.state = "intro";
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
  const built = B.picked.map(pi => B.pool[pi].t).join(" ");
  if (built === rd.t.join(" ")) {
    B.hp--; addXP(15); bumpStreak();
    if (B.hp === 0) { B.state = "won"; addXP(50); } else B.state = "hit";
    speak(rd.x);
  } else {
    P.streak = 0; B.hearts--; B.hint++;
    B.state = B.hearts <= 0 ? "lost" : "miss";
  }
  save(); render();
}
function finish() {
  const acc = S.total ? S.first / S.total : 0;
  const stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1;
  if (S.mode === "batch") {
    const k = "b" + S.bi, prev = P.batches[k];
    P.batches[k] = { done: true, stars: Math.max(stars, (prev && prev.stars) || 0) };
  }
  S.result = { stars, acc, gained: P.xp - S.xp0 };
  S.phase = "results"; save(); render(); toTop();
}
function goHome() { view = "home"; S = null; ui.quitArmed = false; render(); toTop(); }
function quit() {
  if (!S || S.phase === "results" || ui.quitArmed) return goHome();
  ui.quitArmed = true;
  const b = document.querySelector(".x");
  if (b) { b.textContent = "Leave?"; b.classList.add("armed"); b.setAttribute("aria-label", "Tap again to leave this batch"); }
  clearTimeout(quitT);
  quitT = setTimeout(() => {
    ui.quitArmed = false;
    const x = document.querySelector(".x");
    if (x) { x.textContent = "✕"; x.classList.remove("armed"); x.setAttribute("aria-label", "Leave batch"); }
  }, 3000);
}

/* ---------- views ---------- */
function starsHTML(n) { return [0, 1, 2].map(i => i < n ? "★" : '<span class="off">★</span>').join(""); }

function homeHTML() {
  const lv = level(P.xp), into = P.xp % 100;
  const learned = learnedIds();
  const nb = nextBatch();
  const boxes = [0, 0, 0, 0, 0];
  learned.forEach(id => { boxes[Math.min(5, wordRec(id).b) - 1]++; });
  const maxBox = Math.max(1, ...boxes);
  const doneCount = DATA.filter((_, i) => batchDone(i)).length;
  const voiceNote = !canSpeak ? "This browser has no speech voices, so audio is off."
    : deVoice ? "Using the German voice “" + deVoice.name + "”." : "No German voice was found in this browser, so words are read by its default voice.";

  const nextBlock = nb >= 0 ? (() => {
    const b = DATA[nb];
    const started = b.w.some((_, k) => wordRec(nb * 10 + k));
    return `<section class="karte has-tab" aria-label="Next batch">
      <span class="tab tab-next">Next up</span>
      <div class="k-head"><span>Batch ${nb + 1} of ${DATA.length}</span><span>Cards ${nb * 10 + 1}–${nb * 10 + 10}</span></div>
      <div><h2 class="next-title">${esc(b.t)}</h2><p class="next-de">${esc(b.de)}</p></div>
      <p class="next-meta">Starts with <b>${b.w.slice(0, 3).map(r => esc(r[0] ? r[0] + " " + r[1] : r[1])).join(" · ")}</b>. Three rounds of cards and quizzes, then a boss: <b>${esc(b.boss.n)}</b> ${esc(b.boss.e)}</p>
      <button class="btn btn-primary btn-wide" data-act="start" data-b="${nb}">${started ? "Play batch " + (nb + 1) + " again from the start" : "Deal the first 3 cards"}</button>
    </section>`;
  })() : `<section class="karte has-tab"><span class="tab tab-next">Deck done</span>
      <div class="k-head"><span>All ${DATA.length} batches</span><span>Cards 1–${W.length}</span></div>
      <h2 class="next-title">Every card in this deck is learned</h2>
      <p class="next-meta">Keep reviewing to move cards up to box 5, or replay any batch from the route below.</p></section>`;

  return `<div class="wrap">
    <header class="masthead">
      <div><h1 class="logo">Lingo<span>Cards</span></h1><p class="tagline">The 2,000 everyday words, ten at a time</p></div>
      <div class="mast-right">
        <div class="plate" aria-label="German to English"><b>Deutsch</b><span>→ English</span></div>
        <button class="icon-btn" data-act="settings" aria-expanded="${ui.settings}" aria-label="Settings">${ICON_SET}</button>
      </div>
    </header>
    ${ui.settings ? `<section class="panel settings" aria-label="Settings">
      <div class="panel-head"><h3>Settings</h3></div>
      <label for="opt-auto"><input type="checkbox" id="opt-auto" ${P.auto ? "checked" : ""} ${canSpeak ? "" : "disabled"}> Read words aloud automatically</label>
      <p class="muted small">${esc(voiceNote)}</p>
      ${ui.confirmReset ? `<div class="confirm"><p>Erase all XP, streaks, stars and Leitner boxes? This can't be undone.</p><div class="row"><button class="btn btn-danger" data-act="reset-yes">Erase progress</button><button class="btn btn-ghost" data-act="reset-no">Keep my progress</button></div></div>`
        : `<button class="btn btn-ghost" data-act="reset">Reset progress</button>`}
    </section>` : ""}
    <section class="stats" aria-label="Your progress">
      <div class="stat stat-xp"><span class="lbl">XP</span><b>${fmt(P.xp)}</b><span class="sub">Level ${lv} · ${into}/100</span><span class="meter"><i style="width:${into}%"></i></span></div>
      <div class="stat"><span class="lbl">Streak</span><b>${P.streak}</b><span class="sub">Best ${P.best}</span></div>
      <div class="stat"><span class="lbl">Words</span><b>${learned.length}</b><span class="sub">of ${fmt(GOAL)}</span></div>
    </section>
    ${nextBlock}
    <section class="panel" aria-label="Leitner box">
      <div class="panel-head"><h3>Karteikasten</h3><span class="muted small">your Leitner box</span></div>
      <div class="boxes">${boxes.map((c, i) => `<div class="bx"><span class="bx-n">${c}</span><span class="bx-bar"><i style="height:${(c / maxBox) * 100}%"></i></span><span class="bx-l">Box ${i + 1}</span></div>`).join("")}</div>
      <p class="muted small">A first-try answer moves a card up one box. A miss sends it back to box 1. Review starts with the lowest boxes.</p>
      ${learned.length >= 3 ? `<button class="btn btn-ghost" data-act="review">Review your ${Math.min(6, learned.length)} weakest cards</button>`
        : `<p class="small"><b>Finish your first quiz round to unlock review.</b></p>`}
    </section>
    <section class="panel" aria-label="Batches">
      <div class="panel-head"><h3>Your route</h3><span class="muted small">${doneCount} of ${DATA.length} batches done</span></div>
      <ol class="route">
        ${DATA.map((b, i) => {
          const st = P.batches["b" + i], open = unlocked(i);
          const cls = st && st.done ? "done" : open ? "open" : "locked";
          return `<li class="stn ${cls}"><button class="stn-btn" data-act="start" data-b="${i}" ${open ? "" : "disabled"}>
            <span class="dot" aria-hidden="true"></span>
            <span class="stn-main"><span class="stn-t">${i + 1}. ${esc(b.t)}</span><span class="stn-de">${esc(b.de)} · cards ${i * 10 + 1}–${i * 10 + 10}</span></span>
            <span class="stn-end">${st && st.done ? `<span aria-label="${st.stars} of 3 stars">${starsHTML(st.stars)}</span>` : open ? "Start" : "Locked"}</span>
          </button></li>`;
        }).join("")}
        <li class="stn future"><div class="future-row"><span class="dot" aria-hidden="true"></span><span class="stn-main"><span class="stn-t">Cards 101–2,000</span><span class="stn-de">Not in this deck yet</span></span></div></li>
      </ol>
    </section>
    <footer class="foot"><p id="sync">${esc(syncText())}</p><p>Pronunciation uses your browser's built-in speech voices.</p></footer>
  </div>`;
}

function sbarHTML() {
  let pct;
  if (S.mode === "batch") {
    const bp = S.phase === "results" ? 1 : S.phase === "boss" && S.boss ? (S.boss.max - S.boss.hp) / S.boss.max : 0;
    pct = (S.done / S.total) * 0.8 + bp * 0.2;
  } else pct = S.phase === "results" ? 1 : S.done / S.total;
  return `<div class="sbar">
    <button class="x ${ui.quitArmed ? "armed" : ""}" data-act="quit" aria-label="Leave batch">${ui.quitArmed ? "Leave?" : "✕"}</button>
    <div class="prog ${S.mode === "batch" ? "with-boss" : ""}" role="progressbar" aria-label="Batch progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct * 100)}"><i style="width:${pct * 100}%"></i></div>
    <span class="chip chip-xp" aria-label="${P.xp} XP">${fmt(P.xp)} XP</span>
    <span class="chip" aria-label="Streak ${P.streak}">🔥 ${P.streak}</span>
  </div>`;
}

function cardHTML(w, flipped) {
  const g = w.a;
  const tab = g ? `<span class="tab tab-${g}">${g}</span>` : `<span class="tab">${POS[w.p]}</span>`;
  const head = `<div class="k-head"><span>🎴 Card ${w.n} / ${fmt(GOAL)}</span><span>Category: ${esc(DATA[w.b].t)}</span></div>`;
  const i = w.x.indexOf(w.f);
  const ex = i < 0 ? esc(w.x) : esc(w.x.slice(0, i)) + "<mark>" + esc(w.f) + "</mark>" + esc(w.x.slice(i + w.f.length));
  return `<div class="flip ${flipped ? "is-flipped" : ""}" role="button" tabindex="0" data-act="flip" aria-label="Flashcard. Press to flip.">
    <div class="flip-inner">
      <div class="face front karte" ${flipped ? "inert" : ""}>${tab}${head}
        <div class="k-body">
          <span class="k-label">Target word</span>
          <div class="k-word">${g ? `<span class="art art-${g}">${g}</span> ` : ""}${esc(w.w)}</div>
          <div class="k-pos">${POS[w.p]}${g ? " · " + GENDER[g] : ""}</div>
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
    </div>
  </div>`;
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
    case "listen": return `<h2 class="qprompt">Listen, then pick the word you hear.</h2><button class="btn btn-sign listen-btn" data-act="speak" data-say="${esc(full(w))}">${ICON_SPK} Play the word</button>`;
    case "fill": {
      const i = w.x.indexOf(w.f);
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
  const head = `<div class="boss-top"><div class="boss-face ${B.state === "hit" || B.state === "won" ? "hit" : ""}" aria-hidden="true">${bd.e}</div>
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
  return `<div class="results">
    <div class="stamp-wrap"><div class="stamp">${batch ? "Bestanden" : "Geübt"}</div></div>
    <h2>${batch ? "Batch " + (S.bi + 1) + " complete" : "Review complete"}</h2>
    <p class="lede">${batch ? esc(DATA[S.bi].boss.n) + " is defeated, and " + ids.length + " cards are now in your Leitner box." : "Your Leitner box is updated."}</p>
    <div class="stars" role="img" aria-label="${r.stars} of 3 stars">${starsHTML(r.stars)}</div>
    <dl class="rstats"><div><dt>XP earned</dt><dd>+${r.gained}</dd></div><div><dt>First try</dt><dd>${S.first}/${S.total}</dd></div><div><dt>Best streak</dt><dd>${S.runBest || 0}</dd></div></dl>
    <ul class="wlist">${ids.map(id => `<li><span class="${W[id].a ? "art-" + W[id].a : ""}">${esc(full(W[id]))}</span><span>${esc(W[id].en)}</span></li>`).join("")}</ul>
    <div class="row">${nb >= 0 ? `<button class="btn btn-primary" data-act="start" data-b="${nb}" data-autofocus>Next: batch ${nb + 1}</button>` : ""}
      <button class="btn btn-ghost" data-act="home" ${nb >= 0 ? "" : "data-autofocus"}>Back to the route</button></div>
  </div>`;
}

function sessionHTML() {
  const inner = S.phase === "deal" ? dealHTML() : S.phase === "quiz" ? quizHTML() : S.phase === "boss" ? bossHTML() : resultsHTML();
  return `<div class="wrap">${sbarHTML()}<main class="stage">${inner}</main></div>`;
}

function render() {
  const app = document.getElementById("app");
  try { app.innerHTML = view === "session" && S ? sessionHTML() : homeHTML(); }
  catch (err) { console.error(err); view = "home"; S = null; app.innerHTML = homeHTML(); }
  const af = app.querySelector("[data-autofocus]:not([disabled])");
  if (af) { try { af.focus({ preventScroll: true }); } catch (e) {} }
  if (view === "session" && S && S.phase === "quiz") {
    const q = S.queue[S.qi];
    if (q && q.type === "listen" && !q.played) { q.played = true; setTimeout(() => speak(full(W[q.id])), 200); }
  }
  if (S && S.fb && (S.fb.kind === "good" || S.fb.kind === "reveal")) {
    const fbEl = app.querySelector(".fb");
    if (fbEl && fbEl.scrollIntoView) { try { fbEl.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {} }
  }
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
function act(a, d) {
  switch (a) {
    case "settings": ui.settings = !ui.settings; ui.confirmReset = false; render(); break;
    case "reset": ui.confirmReset = true; render(); break;
    case "reset-no": ui.confirmReset = false; render(); break;
    case "reset-yes": { const auto = P.auto; P = fresh(); P.auto = auto; ui.confirmReset = false; save(); render(); toast("Progress erased."); break; }
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
  }
}
const app = document.getElementById("app");
app.addEventListener("click", e => {
  const t = e.target.closest("[data-act]");
  if (!t || t.disabled || !app.contains(t)) return;
  act(t.dataset.act, t.dataset);
});
app.addEventListener("mousedown", e => { if (e.target.closest(".uml")) e.preventDefault(); });
app.addEventListener("submit", e => {
  e.preventDefault();
  if (e.target.id !== "typeform") return;
  const v = e.target.querySelector("#ans").value;
  if (v.trim()) submit(v);
});
app.addEventListener("change", e => { if (e.target.id === "opt-auto") { P.auto = e.target.checked; save(); } });
document.addEventListener("keydown", e => {
  if (view !== "session" || !S || e.metaKey || e.ctrlKey || e.altKey) return;
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
function start(data) {
  try {
    if (data && data.view === "session" && data.S && data.S.phase) { S = data.S; view = "session"; }
  } catch (e) { S = null; view = "home"; }
  render();
  initRemote();
}
try { const h = window.claude && window.claude.hot; if (h && typeof h.snapshot === "function") h.snapshot(() => ({ view, S })); } catch (e) {}
const hot = window.claude && window.claude.hot;
if (hot && typeof hot.ready === "function") hot.ready(start); else start((hot && hot.data) || {});
})();
