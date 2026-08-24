# אביגיל לומדת אנגלית 🌟

**▶ https://barnoy99.github.io/english-reading/**

An English **reading** app for a Hebrew-speaking 8-year-old, built to be the thing she opens instead of YouTube.

Works on any phone, tablet or computer, and **progress follows her between them**. Open the link once and it installs to the home screen (Chrome: ⋮ → *Add to Home screen*; iPhone Safari: Share → *Add to Home Screen*), after which it opens full-screen and works with no connection at all.

She already has [Word Missile](../../Jonathan/English%20Vocabulary%20Game/README.md) for Hebrew↔English vocabulary drill. This app does the thing that one doesn't: it teaches her to **read** — letters, sounds, and eventually words — and quietly keeps score so the practice lands where it's needed.

Plain HTML/CSS/JS, no build step, works offline. Open `index.html` from any static server.

## How it works for her

One tap on **מסע חדש** starts a mission: 3 short games, ~15 questions, about 8 minutes, with a visible finish line. Coins earned go on a character she dresses — clothes, shoes, hats, bags, hairstyles, makeup and jewellery. A streak counter tracks days in a row.

**Coins have to be earned.** Turning up is not enough:

| Mission | Pays |
|---|---|
| under 55% correct | nothing |
| 55–84% | 🪙 1 |
| 85% or better | 🪙 2 |
| microphone bonus | +🪙 1 |
| every 5th day in a row | +🪙 2 |

Garments run from 5 to 26 coins — a hair ribbon is a couple of good missions, a ball gown is a fortnight of them. Owning something never expires, so she can mix and match outfits freely; tapping a hat, bag, makeup or jewel she is already wearing takes it off again.

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
- **איפוס מטבעות** — wipes coins and wardrobe, keeps everything she has learned
- **איפוס הכל** — wipes everything

## Under the hood

| File | Role |
|---|---|
| `data.js` | All content: letters, words, the wardrobe. Edit this, not the code. |
| `engine.js` | DOM-free. Mastery, spaced repetition, unlocking, question generation. `window.__engine` |
| `audio.js` | English TTS + WebAudio sound effects. `Voice` |
| `app.js` | Screens, the six activity renderers, trace canvas, the figure. `window.__app` |
| `sync.js` | Cross-device progress sync. `window.__sync` |

**Spaced repetition** is Leitner boxes 0–5, scheduled in missions rather than days — she might play twice in one evening or skip three days. A hit moves an item up a box and pushes it out 0/1/2/4/8/16 missions; a miss drops it two boxes and brings it back inside the same session.

**Tracing** has no per-letter path data. The guide glyph is drawn onto the canvas, the same glyph is rendered offscreen as a mask, and her strokes are scored on two numbers: *precision* (how much of what she drew sits on the letter, with 26px of slack) and *recall* (how much of the letter she actually covered). Both are needed — precision alone passes a single dot, recall alone passes a scribble that fills the box. It's deliberately forgiving: a wobbly hand ±45px still passes, a wrong shape doesn't.

**Pictures are emoji.** No image files, nothing to license, works offline.

**The figure is inline SVG** on a 200x400 stage, drawn in fashion-illustration proportions (about six and a half heads tall). Garments are cut to fixed body landmarks documented at the top of the wardrobe section in `data.js` — keep to those and a new garment fits first time. Each item declares a `z` paint order; anything below 10 is painted behind the body (the backpack, the fairy wings), and a dress hides the top and bottom rather than unequipping them, so taking it off restores the outfit underneath.

**Letter names are spoken from the glyph** ("A"), not a respelling. A respelling of "ay" was read as /iː/ on a real device, turning A into E. Add `nameSay:'...'` to any letter in `data.js` if it still comes out wrong on your device.

**The app waits for speech to finish** before moving to the next question. Advancing on a fixed timer cut "buh… ball" off halfway and the next question then talked over what was left. There is a 4-second backstop in case a speech engine never reports the end.

**Cross-device sync** shares the Le-Francais-au-Quotidien Firebase project, at `progress/abigailEnglish` — a sibling of that app's `progress/user1`. Its rules already open that subtree, so no console change was needed and neither app can reach the other's data. To move to a dedicated project later, swap `firebase-config.js` and `SYNC_PATH` in `sync.js`.

localStorage stays the source of truth; Firebase is only a courier. On launch, and whenever she returns to the app, the remote copy is **merged** in — never assigned over the top — and written back. Writes are debounced, so a 15-answer mission costs one round trip. With no network, no config, or a blocked SDK, the app runs exactly as it did before and the parent panel says so.

The merge cannot lose work. Per-item progress goes to whichever device practised that item more; letters and furniture are unioned; stage, mission count and lifetime coins take the maximum; the streak follows the later day; settings follow the more recently touched device.

**Coins are derived, not stored.** A running balance cannot merge — spend on the phone and the tablet still believes the coins are there. The state keeps lifetime `earned` coins, which only ever grows, and the spendable balance is always `earned − (what the wardrobe cost)`. That makes every synced field safe to merge, and old saves migrate on load.

**Resetting coins needs `coinEpoch`.** Because merging keeps the *higher* lifetime total, writing a lower number would simply be undone the next time an old device syncs. A reset bumps `coinEpoch`, and a higher epoch replaces the balance outright instead of taking the maximum — so the reset propagates instead of bouncing back.

**A page served from localhost never syncs.** A dev build writing to the live record once handed her 500 coins, and the max-wins merge meant it could not be undone from a normal client. `sync.js` disables itself on localhost; the parent panel shows 🛠️ when that is why sync is off.

One known rough edge: `due` dates are counted in missions, and two devices can have different mission counts. After a merge that only means a few items come back for review sooner than they strictly need to — never that progress is lost.

**If the device has no English voice** installed, the three listening games drop out of the rotation automatically rather than asking silent questions, and a banner says so.

## Running it

```bash
python -m http.server 8033 --directory "C:\Users\User\Documents\Claude Code\Claude for the Kids\Abigail\English Learning for Abigail"
```

A preview config named `abigail-english` (port 8033) is registered in `.claude/launch.json`.

Note that the microphone bonus needs HTTPS, so it works on the live site but not over plain `http://` on a local network address.

Progress lives in `localStorage` under `abigailEnglish_state`.

## Deploying

`git push` to `origin/main` — GitHub Pages rebuilds in about a minute.

Same-origin files are served **network-first**, so a deploy reaches her on the next launch rather than the one after. The cache is only used when she is offline. Still bump `CACHE_VERSION` in `sw.js` when you change the file list, so old caches get cleared out.

## Not built yet

- Stage 3: sounding out CVC words, word families, build-a-word from letter tiles
- Stage 4: sight words and short phrases
- Stage 5: four-panel comic stories
- Cross-device progress sync (today each device keeps its own)
