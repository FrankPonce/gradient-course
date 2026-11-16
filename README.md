# GRADIENT — AI, Data & Engineering Course

*Got Rejected Again. Decided I’m (an) Ex-larper Now. Training.*

A self-contained, adaptive course for interview prep and upskilling across five tracks:
Machine Learning, Deep Learning & Generative AI, Data Science & Statistics, Business & Data Analytics, and Software Engineering.

No build step, no backend, no dependencies. Progress is stored in your browser (localStorage) and can be exported/imported from the Progress page.

## Run it

```bash
python -m http.server 5173
```

Then open http://localhost:5173. The Python code runner downloads Pyodide from a CDN on first use; everything else works offline.

## What is in it

| | |
|---|---|
| Structure | 5 tracks → 20 modules → topics → 60 lessons (one skill each) |
| Question bank | ~400 hand-written questions with explanations + 85 parametric generators that produce new numbers on every draw |
| Cases | 48 multi-part cases (261 linked questions) built around a shared table, code listing, chart or diagram; 18 of them regenerate their data on every draw |
| Practice | per-skill practice, 20-question module quizzes, targeted practice on your weakest skills, a 30-question placement diagnostic |
| Mock tests | 3 one-hour tests per track + 3 cross-track mixes, timed, scored 200–800, full review with explanations |
| Analytics | mastery per skill/module/track, score history, strengths, weaknesses, improving/slipping skills, skill map |
| Interactive lab | 17 hands-on diagrams (gradient descent, ROC, k-means, attention, CLT, Bayes, A/B power, SQL joins, sorting, BFS/DFS, …) |
| Coding | 18 problems runnable in the browser in Python or JavaScript, tied to the same skill mastery |

## How mastery works (`js/core.js`)

Each skill has an ability estimate θ. A question of difficulty b is expected to be answered correctly with probability
`0.25 + 0.75·sigmoid(θ − b)` (0.25 is the guessing floor). After every answer θ moves toward the evidence with a step that
shrinks as attempts accumulate, so hard questions answered right raise mastery more than easy ones. Questions can be
cross-linked to secondary skills, which receive half-weight credit. Recommendations rank skills by low mastery, recent
decline and staleness, then by the next unstarted lesson in sequence.

## Adding content

Everything is plain data.

- **Question** (`js/bank-*.js`): `Q("skill.id", difficulty 1–3, "stem", ["correct", "wrong", "wrong", "wrong"], "explanation", ["optional.cross.skill"])` — the first option is the correct one; options are shuffled at runtime.
- **Generator**: `G("skill.id", difficulty, (r) => ({ stem, opts: [correct, ...], expl }))` where `r` is a seeded RNG (`r.int`, `r.pick`, `r.shuffle`).
- **Case** (`js/sets-*.js`): `S("skill.id", "Title", { stim: html, parts: [[skill, difficulty, stem, [correct, ...wrong], explanation, [cross skills]], ...] })`. Pass a function `(r) => ({ stim, parts })` instead to regenerate the data each time. Build the stimulus with `GR.tbl(headers, rows, caption)`, `GR.code(text)`, `GR.viz.line`, `GR.viz.bars` and `GR.viz.graph`. Parts stay together and in order in every session, and each part can credit a different skill.
- **Lesson** (`js/curriculum.js`): add an `L(...)` entry under a topic; it registers a new skill automatically.
- **Diagram** (`js/diagrams-*.js`): `GR.diagrams.id = { title, blurb, skills, tasks, mount(host) }`, then reference it from a lesson with `diagram: "id"`.
- **Coding problem** (`js/coding.js`): `P(id, title, difficulty, skill, { desc, js, py, tests, hint, approach, sol })`.
