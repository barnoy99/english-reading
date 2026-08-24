# אביגיל לומדת אנגלית 🌟

An English **reading** app for a Hebrew-speaking 8-year-old, built to be the thing she opens instead of YouTube.

She already has [Word Missile](../../Jonathan/English%20Vocabulary%20Game/README.md) for Hebrew↔English vocabulary drill. This app does the thing that one doesn't: it teaches her to **read** — letters, sounds, and eventually words — and quietly keeps score so the practice lands where it's needed.

Plain HTML/CSS/JS, no build step, works offline. Open `index.html` from any static server.

## How it works for her

One tap on **מסע חדש** starts a mission: 3 short games, ~15 questions, about 8 minutes, with a visible finish line. Finishing pays **one coin**, and coins buy furniture for a room she decorates. A streak counter tracks days in a row.

There are no lives and no way to lose. A wrong answer shows the right one, says it aloud, and puts that item back in the review queue.

## The ladder

**Stage 1 — letters and sounds** is where she lives for the first months, so it has five different games:

| Game | What it drills |
|---|---|
| איזו אות עושה את הצליל הזה? | letter → **sound** |
| איזו אות שמעת? | letter → **name** |
| מצאי את האות הקטנה | uppercase ↔ lowercase |
| מה מתחיל בצליל הזה? | hearing a sound at the start of a word |
| ציירי את האות | forming the letter with a finger |

**Stage 2 — first words** opens once 10 letters are solid, and adds picture↔word games over ~150 words.

Stages 3–5 (sounding out CVC words, sight words and phrases, then mini-stories) are the next build — see *Not built yet* below.

## Three decisions worth knowing about

**Letters open in phonics order, not alphabetical.** s, a, t, p, i, n first, then m, d, g, o… That's deliberate: those six letters make real words (*sat, tap, pin, nap*), so she can read something within the first week. School will do A-B-C; if you'd rather the app match, open letters by hand in the parent panel.

**Name and sound are taught separately.** B is called "bee" but says /b/. Kids get stuck exactly there, so the two are scored and reviewed as independent skills.

**Distractors are tuned to a Hebrew speaker.** Letters that *look* alike (b/d/p/q) and letters that *sound* alike are marked in `data.js`. The look-alikes only appear once a letter is otherwise solid. The sound-alikes include the specific traps for Hebrew: ו has no /w/, so v and w blur; פ is both /p/ and /f/. Those are held back until she's ready, then drilled on purpose. Two letters that say the same thing (c and k) never appear in the same sound question at all.

## The parent panel

Long-press the faint `·` in the top corner for 0.8s.

- **אותיות פתוחות** — tick what she already knows; the engine takes it from there
- **שליטה** — per-letter mastery, weakest first, with how many times each has been asked
- **שלב** — force stage 1 or 2
- **אורך מסע** — 2 to 5 games per mission
- **מיקרופון** — the speaking bonus round, on by default

## Under the hood

| File | Role |
|---|---|
| `data.js` | All content: letters, words, room furniture. Edit this, not the code. |
| `engine.js` | DOM-free. Mastery, spaced repetition, unlocking, question generation. `window.__engine` |
| `audio.js` | English TTS + WebAudio sound effects. `Voice` |
| `app.js` | Screens, the six activity renderers, trace canvas. `window.__app` |

**Spaced repetition** is Leitner boxes 0–5, scheduled in missions rather than days — she might play twice in one evening or skip three days. A hit moves an item up a box and pushes it out 0/1/2/4/8/16 missions; a miss drops it two boxes and brings it back inside the same session.

**Tracing** has no per-letter path data. The guide glyph is drawn onto the canvas, the same glyph is rendered offscreen as a mask, and her strokes are scored on two numbers: *precision* (how much of what she drew sits on the letter, with 26px of slack) and *recall* (how much of the letter she actually covered). Both are needed — precision alone passes a single dot, recall alone passes a scribble that fills the box. It's deliberately forgiving: a wobbly hand ±45px still passes, a wrong shape doesn't.

**Pictures are emoji.** No image files, nothing to license, works offline.

**If the device has no English voice** installed, the three listening games drop out of the rotation automatically rather than asking silent questions, and a banner says so.

## Running it

```bash
python -m http.server 8033 --directory "C:\Users\User\Documents\Claude Code\Claude for the Kids\Abigail\English Learning for Abigail"
```

A preview config named `abigail-english` (port 8033) is registered in `.claude/launch.json`.

Progress lives in `localStorage` under `abigailEnglish_state`.

## Not built yet

- Stage 3: sounding out CVC words, word families, build-a-word from letter tiles
- Stage 4: sight words and short phrases
- Stage 5: four-panel comic stories
- PWA manifest + service worker, so it installs to her home screen
- Deploy to GitHub Pages
