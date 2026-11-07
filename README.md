# LingoCards

A German → English flashcard game for the 2,000 most useful everyday words.
You get 3 cards at a time, a quiz right after them, and a boss battle every 10 words.

**Play it:** https://xullko.github.io/lingo-app/
(also published as a private Claude artifact: https://claude.ai/artifact/D2nR2MG3mdaaFZKM2u6S3U)

## Features

- **All 2,000 words** in 10 levels of 20 batches, each batch with its own boss battle (sentence building)
- **Jump in at any level:** batches unlock in order, and the first batch of every level is always open
- **Flip cards** with IPA, a sound-it-out guide, example sentences and spoken audio
- **5 quiz types:** multiple choice both ways, fill in the blank, typing, der/die/das (plus listening when a German voice is installed)
- **XP, levels, combos, daily goal ring and day streak**
- **Spaced review (Leitner box):** cards come back after 1, 2, 4, 8 or 16 days depending on their box; due cards show on the home screen and as a badge on the Review tab
- **Searchable word list** of your learned words or all 2,000 words, in German or English
- **Accounts** (sign up, log in, log out, edit name) with separate progress per account
- **Premium:** batches 1–3 are free; Monthly or Lifetime plans unlock everything
- **Options:** daily goal, speaking speed, auto-play audio, typing on/off, light/dark/system theme, sound effects
- Works on phones; bottom tab bar for Learn, Review, Profile and Options

## ⚠️ Demo mode (accounts and payments)

Accounts and payments are **demo only** right now:

- Accounts are saved in the browser's localStorage. **Passwords are not checked or stored.**
- Checkout shows a "Simulate payment" button. **No money is ever charged** and no card details are asked for.

Don't present it as a real paid service until real accounts and payments are connected (see "Going live" below).

## Open it locally

Double-click `index.html`. No install or server needed.

## Files

| File | What it holds | Edit it to… |
|---|---|---|
| `index.html` | The page shell; loads the files below | change the page title or fonts |
| `css/styles.css` | All colors, fonts and layout | restyle the app (color tokens at the top, with dark-mode versions) |
| `js/config.js` | Prices, plans, number of free batches, links | change prices or what's free |
| `js/words/level-01.js` … `level-10.js` | The deck: one level (20 batches × 10 words, plus bosses) per file | add, fix or remove words |
| `js/services.js` | Accounts and payments (demo version) | swap in real Supabase + Stripe |
| `js/app.js` | Screens and game logic: cards, quizzes, scoring, bosses, review, saving | change rules, screens or XP values |
| `tools/validate.js` | Checks the word files for mistakes | run it after editing words |
| `build.js` | Bundles everything into one file | — |
| `dist/lingocards.html` | Single-file build made by `build.js` | don't edit; it gets overwritten |

## Levels

| Level | Theme | Words |
|---|---|---|
| 1 | First Steps (Erste Schritte) | 1–200 |
| 2 | Everyday Life (Alltag) | 201–400 |
| 3 | People & Places (Menschen und Orte) | 401–600 |
| 4 | Free Time & Tech (Freizeit und Technik) | 601–800 |
| 5 | Building Sentences (Sätze bauen) | 801–1,000 |
| 6 | World & Society (Welt und Gesellschaft) | 1,001–1,200 |
| 7 | Out & About (Unterwegs) | 1,201–1,400 |
| 8 | Work & Media (Beruf und Medien) | 1,401–1,600 |
| 9 | Thinking & Doing (Denken und Handeln) | 1,601–1,800 |
| 10 | Fluent (Fließend) | 1,801–2,000 |

## Editing words

Each word is one row in a `js/words/level-XX.js` file:

```js
["der", "Mann", "noun", "man", "mahn", "man / husband", "Der Mann trinkt Kaffee.", "The man drinks coffee.", "Mann"],
```

In order: **article** (`der`/`die`/`das`, or `""` if not a noun) · **word** · **part of speech** ·
**IPA** · **sound-it-out guide** · **English meaning** · **example sentence** · **its English translation** ·
**the exact form of the word as it appears in the sentence** (used for fill-in-the-blank and highlighting).
An optional 10th item lists other accepted spellings, e.g. `["tschüs"]`.

Parts of speech: `noun`, `pl` (plural noun, article `die`), `name` (e.g. Deutschland), `verb`, `adj`, `adv`,
`pron`, `prep`, `conj`, `interj`, `phrase`, `num`.

After editing, run the checker:

```
node tools/validate.js
```

It makes sure that every batch has 10 words, the sentence form appears as a whole word, nouns have articles,
each boss has at least 4 short sentences (3–7 words) to build, and that no German word, English meaning
or example sentence is repeated anywhere in the deck.

To add a batch, copy a whole `{ t: ..., de: ..., boss: {...}, w: [...] }` block inside a level's `batches` list.
To add a level, copy a level file, change `n:` to the next number, and add a `<script>` line for it in `index.html`.

## Handy numbers

- Prices, plans and free batches: `js/config.js`
- `+10` / `+5` XP per answer (first try / after a hint): search `const gain` in `js/app.js`
- `15` XP per boss hit, `50` XP boss bonus: `bossCheck` in `js/app.js`
- `100` XP per level: `const level` in `js/app.js`
- Review spacing in days per box, and cards per review session: `REVIEW_DAYS` and `REVIEW_SIZE` in `js/app.js`

## Going live (real accounts and payments)

`js/services.js` has two objects, `auth` and `billing`. The rest of the app only calls their functions,
so going live means replacing what's inside them:

1. **Accounts:** create a free [Supabase](https://supabase.com) project. Replace `auth.signUp`, `auth.logIn`,
   `auth.logOut` and `auth.current` with Supabase Auth calls. Store each user's plan and progress in a Supabase table.
2. **Payments:** create a [Stripe](https://stripe.com) account with two products (Monthly subscription, Lifetime one-time).
   Make `billing.startCheckout` return `{ redirect: "<Stripe Checkout URL>" }`.
3. **Confirm payments on a server:** a small Supabase Edge Function receives Stripe's webhook and marks the user as Premium.
   Never trust the browser alone to say someone paid.
4. Set `mode: "live"` in `js/config.js` and remove the demo notes.

## Publishing changes

**Website (GitHub Pages):** commit and push to `main`. The site updates within a minute or two.

**Claude artifact (single file):**

```
node build.js
```

Then give `dist/lingocards.html` to Claude and ask it to update the artifact at
https://claude.ai/artifact/D2nR2MG3mdaaFZKM2u6S3U (pass that link so it keeps the same URL).

## Saving progress

Progress saves in the browser, separately for guests and for each account on that device.
Inside the Claude artifact it's also saved to your Claude account.
