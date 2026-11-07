// Checks every word file in js/words/ for mistakes that would break the game.
// Run:  node tools/validate.js
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "js", "words");
global.window = {};
for (const f of fs.readdirSync(dir).filter(f => /^level-\d+\.js$/.test(f)).sort()) require(path.join(dir, f));
const levels = (window.LINGO_LEVELS || []).slice().sort((a, b) => a.n - b.n);

const POS = ["noun", "pl", "name", "verb", "adj", "adv", "pron", "interj", "phrase", "num", "conj", "prep"];
const ARTICLES = ["der", "die", "das"];
const isLetter = ch => !!ch && /\p{L}/u.test(ch);
const tokens = s => s.replace(/[.,!?¿¡„“"]/g, "").split(/\s+/).filter(Boolean);
function wholeWordIndex(x, f) {
  let i = x.indexOf(f);
  while (i >= 0) {
    if (!isLetter(x[i - 1]) && !isLetter(x[i + f.length])) return i;
    i = x.indexOf(f, i + 1);
  }
  return -1;
}

const problems = [];
const seenEN = new Map(), seenDE = new Map(), seenEx = new Map();
let batchNo = 0, words = 0;

levels.forEach((lv, li) => {
  if (lv.n !== li + 1) problems.push(`Level numbering: expected ${li + 1}, found ${lv.n}`);
  if (!lv.t || !lv.de) problems.push(`Level ${lv.n}: missing title`);
  lv.batches.forEach(b => {
    batchNo++;
    const where = `Level ${lv.n}, batch ${batchNo} (${b.t})`;
    if (!b.t || !b.de) problems.push(`${where}: missing title`);
    if (!b.boss || !b.boss.n || !b.boss.g || !b.boss.e || !b.boss.s) problems.push(`${where}: boss needs n, g, e and s`);
    if (b.w.length !== 10) problems.push(`${where}: has ${b.w.length} words (needs 10)`);
    const bossOk = b.w.filter(r => { const n = tokens(r[6] || "").length; return n >= 3 && n <= 7; }).length;
    if (bossOk < 4) problems.push(`${where}: only ${bossOk} example sentences have 3–7 words (boss needs 4)`);
    b.w.forEach(r => {
      words++;
      const [art, word, pos, ipa, ph, en, x, xe, form] = r;
      const id = `${where}: "${word}"`;
      if (r.length < 9) { problems.push(`${id}: row has ${r.length} items (needs 9)`); return; }
      if (!POS.includes(pos)) problems.push(`${id}: unknown part of speech "${pos}"`);
      if ((pos === "noun" || pos === "pl") && !ARTICLES.includes(art)) problems.push(`${id}: nouns need der/die/das`);
      if (pos === "pl" && art !== "die") problems.push(`${id}: plural nouns take "die"`);
      if (pos !== "noun" && pos !== "pl" && art) problems.push(`${id}: only nouns get an article`);
      if (!ipa || !ph || !en || !x || !xe || !form) problems.push(`${id}: empty field`);
      if (wholeWordIndex(x, form) < 0) problems.push(`${id}: form "${form}" isn't a whole word in "${x}"`);
      const de = (art ? art + " " : "") + word;
      if (seenDE.has(de)) problems.push(`${id}: German word repeats ${seenDE.get(de)}`); else seenDE.set(de, where);
      if (seenEN.has(en)) problems.push(`${id}: English meaning "${en}" repeats ${seenEN.get(en)}`); else seenEN.set(en, `${where} ("${word}")`);
      if (seenEx.has(x)) problems.push(`${id}: example sentence repeats ${seenEx.get(x)}`); else seenEx.set(x, where);
    });
  });
});

console.log(`${levels.length} levels, ${batchNo} batches, ${words} words`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach(p => console.log(" - " + p));
  process.exitCode = 1;
} else {
  console.log("All good.");
}
