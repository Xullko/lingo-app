# LingoCards

A German → English flashcard game for the 2,000 most useful everyday words.
You get 3 cards at a time, a quiz right after them, and a boss battle every 10 words.
It tracks XP, levels, streaks, stars and a Leitner box for review.

Live version: https://claude.ai/artifact/D2nR2MG3mdaaFZKM2u6S3U

## Open it

Double-click `index.html`. It runs in any browser with no install and no server.

## Files

| File | What it holds | Edit it to… |
|---|---|---|
| `index.html` | The page shell; loads the files below | change the page title or fonts |
| `css/styles.css` | All colors, fonts and layout | restyle the app (colors are tokens at the top, with dark-mode versions) |
| `js/words.js` | The word deck: 10 batches × 10 words, plus each batch's boss | add, fix or remove words, add new batches |
| `js/app.js` | Game logic: cards, quizzes, scoring, boss battles, saving | change the rules (XP values, hints, quiz types) |
| `build.js` | Bundles everything into one file | — |
| `dist/lingocards.html` | The single-file build (made by `build.js`) | don't edit; it gets overwritten |

## Adding words

In `js/words.js`, each word is one row:

```js
["der", "Mann", "noun", "man", "mahn", "man / husband", "Der Mann trinkt Kaffee.", "The man drinks coffee.", "Mann"],
```

In order: **article** (`der`/`die`/`das`, or `""` if not a noun) · **word** · **part of speech**
(`noun`, `verb`, `adj`, `adv`, `pron`, `interj`, `phrase`, `num`) · **IPA** · **sound-it-out guide** ·
**English meaning** · **example sentence** · **its English translation** ·
**the exact form of the word as it appears in the sentence** (used for fill-in-the-blank).
An optional 10th item lists other accepted spellings, e.g. `["tschüs"]`.

Rules to keep the game working:
- Each batch should have exactly **10 words**.
- The 9th item must appear exactly as written in the example sentence.
- Each batch needs at least **4 example sentences of 3–7 words** for its boss battle.

To add a batch, copy a whole `{ t: ..., de: ..., boss: {...}, w: [...] }` block and paste it at the end of the list.

## Handy numbers in `js/app.js`

- `+10` / `+5` XP for an answer on the first try / after a hint: search for `const gain`
- `15` XP per boss hit and `50` XP boss bonus: in `bossCheck`
- `100` XP per level: `const level`
- Hearts per boss fight: `hearts: 3`

## Publishing your changes

The live version is one HTML file. After editing:

```
node build.js
```

Then give `dist/lingocards.html` to Claude and ask it to update the artifact at the link above.

## Saving progress

Progress saves in your browser automatically. When opened as the Claude artifact,
it also saves to your Claude account. Opening `index.html` from disk uses separate browser storage
from the live version, so the two don't share progress.
