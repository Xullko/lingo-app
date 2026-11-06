# LingoCards

A German → English flashcard game for the 2,000 most useful everyday words.
You get 3 cards at a time, a quiz right after them, and a boss battle every 10 words.

**Play it:** https://xullko.github.io/lingo-app/

## Features

- **200 words** in 20 themed batches, each with a boss battle (sentence building)
- **Flip cards** with IPA, a sound-it-out guide, example sentences and spoken audio
- **5 quiz types:** multiple choice both ways, fill in the blank, typing, der/die/das (plus listening when a German voice is installed)
- **XP, levels, combos, daily goal ring and day streak**
- **Leitner box** review and a full list of the words you've learned
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
| `js/words.js` | The word deck: batches of 10 words, plus each batch's boss | add, fix or remove words, add new batches |
| `js/services.js` | Accounts and payments (demo version) | swap in real Supabase + Stripe |
| `js/app.js` | Screens and game logic: cards, quizzes, scoring, bosses, saving | change rules, screens or XP values |
| `build.js` | Bundles everything into one file | — |
| `dist/lingocards.html` | Single-file build made by `build.js` | don't edit; it gets overwritten |

## Adding words

In `js/words.js`, each word is one row:

```js
["der", "Mann", "noun", "man", "mahn", "man / husband", "Der Mann trinkt Kaffee.", "The man drinks coffee.", "Mann"],
```

In order: **article** (`der`/`die`/`das`, or `""` if not a noun) · **word** · **part of speech**
(`noun`, `verb`, `adj`, `adv`, `pron`, `interj`, `phrase`, `num`, `conj`) · **IPA** · **sound-it-out guide** ·
**English meaning** · **example sentence** · **its English translation** ·
**the exact form of the word as it appears in the sentence** (used for fill-in-the-blank).
An optional 10th item lists other accepted spellings, e.g. `["tschüs"]`.

Rules to keep the game working:
- Each batch has exactly **10 words**.
- The 9th item must appear exactly as written in the example sentence.
- Each batch needs at least **4 example sentences of 3–7 words** for its boss battle.
- English meanings must be unique across the deck.

To add a batch, copy a whole `{ t: ..., de: ..., boss: {...}, w: [...] }` block and paste it at the end.

## Handy numbers

- Prices, plans and free batches: `js/config.js`
- `+10` / `+5` XP per answer (first try / after a hint): search `const gain` in `js/app.js`
- `15` XP per boss hit, `50` XP boss bonus: `bossCheck` in `js/app.js`
- `100` XP per level: `const level` in `js/app.js`

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

Then give `dist/lingocards.html` to Claude and ask it to update the artifact.

## Saving progress

Progress saves in the browser, separately for guests and for each account on that device.
Inside the Claude artifact it's also saved to your Claude account.
