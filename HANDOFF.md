# GRADIENT handoff

Last updated: 2026-11-19

## Project description

GRADIENT ("Got Rejected Again. Decided I'm (an) Ex-larper Now. Training.") is a self-contained, adaptive interview-prep course and game. It covers ten tracks:

- Foundations
- Coding Interviews (LeetCode/HackerRank)
- Machine Learning
- Deep Learning & GenAI
- Agentic AI
- Data Science
- Business Analytics
- Software Engineering
- ML System Design
- Investing & Trading

Everything runs in the browser. There's no build step, no backend and no npm dependencies. State lives in localStorage.

- **Live:** https://frankponce.me/gradient-course/ (GitHub Pages from `main` / root, custom domain through the user site `FrankPonce/FrankPonce.github.io`, HTTPS enforced)
- **Repo:** https://github.com/FrankPonce/gradient-course (public)
- **Product truth:** `PRODUCT.md`
- **Design direction for the programs:** `.impeccable/surfaces/js-path-js.md`

## Features (where we're at)

### Content

- 141 written lessons, each teaching one skill.
- About 850 questions plus 132 parametric generators.
- 73 multi-part cases.
- 34 timed mock tests.
- 37 interactive diagrams, including 18 step-through algorithm visualizers.
- 65 coding problems:
  - Python via Pyodide, plus JavaScript in a Web Worker
  - SQL via sql.js
  - 2 HackerRank-style I/O problems

### Training programs (the main surface, `#/path/<track>`)

- **Every track is a program.** Modules are weeks. The sessions are:
  - Learn
  - Drill
  - Problem
  - PR attempt
  - an auto-generated Test at the end of each week
- **Size:** 370 sessions in total. Coding Interviews (`js/path-lc.js`) is hand-authored, with 15 weeks, 106 sessions, 578 cards and 12 Hard PR attempts. The other nine programs are generated from existing content by `js/courses-auto.js`.
- **Exercise types:** nine card kinds:
  - learn (text, optional auto-playing animation or diagram)
  - mcq
  - fill (code chips)
  - ord (order lines)
  - rank (drag)
  - match
  - bins (sort into groups)
  - bug (tap the buggy line)
  - num (numeric answer)
- **Input fallbacks:** every drag also works by tapping, and rank also works with arrow keys.
- **Splits:** each session stores time and accuracy. A faster replay with the same or better accuracy earns a gold split. The header shows sessions done, today's XP out of 50, streak, gold splits and sum of best.
- **Lives:** 5 hex pips per session; a refill costs 20 coins. Missed cards are re-queued at the end.
- **Session log:** shows a stamp (Done / New PR / Gold split), time, accuracy, XP and coins, then Next or Back.
- **Dashboard:** a Continue card, plus per-program progress bars.

### Game layer

- XP and levels with joke titles.
- Coins, streaks, daily quests and achievements.
- A shop with cursed pets.
- A coin "stock exchange".

### Other surfaces

The following are still there and serve as guidebooks and a reference shelf:

- track pages and lessons
- quizzes and drills
- a placement diagnostic
- mock tests
- the Lab
- Coding
- the LeetCode hub (`#/lc`), with a pattern map, a 152-problem tracker, cheat sheets and a mock interview

### Look

- Gothic dark theme (default) and a parchment light theme.
- Blood-red accent `#A8191F`.
- Type: Bricolage Grotesque and Inter for UI, Grenze Gotisch and Pirata One for display, JetBrains Mono for code.
- Hex-clipped buttons and thorn/star sigils.

## Architecture notes

### Load order and namespace

Plain script tags load in the order set in `index.html`, and everything hangs off the global `GR`:

1. `core`
2. `curriculum`
3. `track-*`
4. `bank-*`
5. `sets-*`
6. `diagrams-*`
7. `extras`
8. `coding*`
9. `game`
10. `lc-hub`
11. `anim`
12. `path`
13. `path-lc`
14. `courses-auto`
15. `views`

`courses-auto` must load after `path-lc`: it skips any track that already has a course, then re-sorts `GR.courses` into track order.

### State

State is stored in localStorage under the key `gradient.v1` and holds:

- skills (mastery θ)
- seen
- sessions
- code
- lessons
- game
- `path`
- `pathLast`

Program progress lives in `GR.state.path[courseId].done[nodeId]`, which has the fields `{ts, acc, secs, best, bestAcc, gold, runs}`.

### Node IDs are stable slugs

The ID format is `${course}-${slug(unit title)}-${slug(lesson title)}`. Tests use `...-test`.

- **Never go back to positional IDs.** Inserting a lesson would shift everyone's saved progress.
- **Renaming a lesson or week title orphans its progress.** Give the lesson an explicit `id` to keep the old one.

### Course DSL

The course is defined with `GR.course(id, {title, short, color, blurb, units:[{title, sub, guide, lessons:[{title, skill, kind, cards, n}]}], testPool})`.

- `cards` is either an array or a function `rng => cards[]`.
- `GR.pathKit` provides these helpers:
  - `fromItem` (bank item → card; numeric generators become `num` about 55% of the time)
  - `drill(skills, n)`
  - `caseCards(set)`
  - `bankFor`
  - `chunks`
  - `learnCards`
  - `lessonSession`

### Mastery

Per-skill θ uses an Elo/IRT-style update, with p = 0.25 + 0.75·sigmoid(θ − b).

### Level-ups during sessions

Level-ups are deferred while a session is running (`pendingLvl` / `flushLevel` in `game.js`). `afterRoute` removes any stray `.lvlup` overlay.

### Debug handle

`GR.pathDebug()` returns the live session (`items`, `pos`, `st`), or nothing when no session is running. The browser tests depend on it.

## Testing

The test tooling is not in the repo; it lives in `%TEMP%\gradtools` and is worth copying into a `tools/` folder.

### `check.js` (Node)

- Loads every script in a `vm`.
- Validates:
  - every question
  - every generator, across 300 seeds
  - every case
  - every coding solution
  - the 18 visualizers
  - every program node's cards, with checks specific to each card kind
- Also asserts that every skill has a session and every case is in a program.

**Seven known false positives** come up because "undefined" or "NaN" appear as legitimate text in questions about JS and pandas.

### `prg.js` (puppeteer-core, system Chrome)

- Plays week 1 and week 6 of Coding Interviews, exercising every card kind.
- Checks that a gold replay works.
- Does a real mouse-drag reorder.
- Takes mobile screenshots.

Serve the site with `python -m http.server 5190 --bind 127.0.0.1`.

**Don't use headless `--virtual-time-budget` for timing tests.** It fast-forwards timers and caused false SQL timeouts.

## Shortcomings and known issues

- **Impeccable finish not done.** The finish reviewer (`impeccable:impeccable-finish-reviewer`) hasn't been run against the direction contract, and `DESIGN.md` hasn't been written (`impeccable-documenter`).
- **Auto-built programs are uneven.** In some weeks a Learn session is mostly reading cards with only a few checks. Drills skip topics whose bank has fewer than 4 items.
- **Few animations.** Concept animations exist only for Big-O and hashing (`js/anim.js`: growth, constants, nested, halving, hashing). Other tracks fall back to their static or interactive diagrams.
- **No adaptivity in programs.** Sessions don't adapt to mastery yet. They draw randomly from the pool, while the older practice modes are the adaptive ones.
- **Single-device progress.** There's no account or sync; JSON export/import on the Progress page is the only way to move progress.
- **Test tooling is outside the repo** (see Testing).
- **Light theme coverage.** It was checked less thoroughly on the new program surfaces than dark.
- **Bundle size.** It's large and loads all JS up front (no lazy loading per track).

## Roadmap (suggested order)

1. **Finish pass.** Run the impeccable finish review on `#/path/lc` and the session player (desktop 1440 and phone 390, dark and light), fix what it finds, then write `DESIGN.md`.
2. **Move the test tooling into the repo.** Put `check.js` and `prg.js` under `tools/`, and optionally add a GitHub Action that runs `check.js`.
3. **Adaptive sessions.** Weight drill and test draws toward low-θ skills, and add a "Weak spots" session per program.
4. **More concept animations,** for:
   - two pointers
   - sliding window
   - BFS layers
   - the DP table filling in
   - the heap sift
   - gradient descent
   - the bias/variance curve
   - the attention heatmap
   - compounding
5. **Hand-tune the auto programs,** starting with ML and System Design. Replace generic Learn chunks with richer card mixes (match, bins, rank) authored per lesson.
6. **More Hard problems.** Add more PR attempts with runnable code (Python/JS) inside the session rather than only on the Coding page.
7. **Speedrun extras.** Add a per-week sum of best, a personal-best history chart, and ghost-pace comparisons.
8. **Spaced review.** Resurface missed cards across days.

## Notable details and observations

- **No Duolingo look.** The user wants Duolingo-like mechanics but explicitly **no visual clone** of Duolingo (legal worry). The chosen identity mixes a gym training log with speedrun splits: weeks/sessions, rubber-stamp "Done/PR/Gold", and time and accuracy splits. Avoid round 3D nodes, owl-like mascots, green slabs and heart icons.
- **Binding brand items:**
  - gothic black and blood red
  - the joke voice (level titles like "Google won't even look at your resume")
  - pets, coins and the shop
  - Blackletter and sigils are *not* binding.
- **Copy rules.** Use American English. No kicker/eyebrow labels above headings, no emoji icons inside the UI, no colored side-stripes or colored glows.
- **Lessons are our own words.** LeetCode problems are taught in our own words, never copied problem statements.
- **Coding judge.** SQL problems run in sql.js with a ready handshake, and the time limit counts only execution. The JS/Python judge compares results with `exact`, `set`, `set2` or `approx`.
- **Toasts.** They stack bottom-right on normal pages (so they don't cover the sticky Today panel) and top-right inside sessions (`body.focus`).
- **Deploys.** Deploys take about 1 minute after pushing to `main`; watch them with `gh run watch <id> --repo FrankPonce/gradient-course`. A `.nojekyll` file is present.

## Jumpstart prompt for a new conversation

> I'm continuing work on GRADIENT, my vanilla-JS interview-prep course and game in `C:\Users\frank\source\repos\AI Data Science Course` (live at https://frankponce.me/gradient-course/, repo FrankPonce/gradient-course). Read `HANDOFF.md`, `PRODUCT.md` and `.impeccable/surfaces/js-path-js.md` first. Every track is a training program (`js/path.js` engine, `js/path-lc.js` hand-authored Coding Interviews, `js/courses-auto.js` for the rest) with weeks, sessions, splits and gold, plus nine card types. Keep the gothic black/blood-red look and the joke voice, don't imitate Duolingo's UI, and keep node IDs stable. Next up: [pick from the HANDOFF roadmap, e.g. "run the impeccable finish review and write DESIGN.md"]. Verify with a Node content check and a puppeteer run before pushing.
