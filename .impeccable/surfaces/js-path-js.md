---
version: 1
slug: "js-path-js"
primary_target: "js/path.js"
related_targets: ["css/app.css"]
---

# Course path and lesson player

Scope: the course path (#/path/<track>) and the lesson player (#/learn/<track>/<node>). Mode: Operate. Every track is a course; the path must reach all existing content (written lessons, question banks, generators, cases).

Audience and job: job seekers doing short daily sessions on a phone or longer ones on a laptop; the job is "do the next session, see progress, come back tomorrow". Constraints: no visual imitation of any specific learning app; reduced motion respected; every drag has a tap path.

## Direction contract

THESIS: The course is a training program with a speedrun log on top. Units are weeks, lessons are sessions on a printed program sheet; finished sessions are stamped, and each session keeps a split (best time, accuracy) that turns gold when beaten. It refuses the winding path of round nodes and the full-width colored feedback slab.

OWN-WORLD: Near-black sheet, hairline-ruled grid, blood-red ink for stamps and the current session, gold only for PRs and gold splits, bone text, mono numerals for times. Hex-clipped primary buttons, rotated rubber-stamp verdicts, no 3D shadows, no circles-as-nodes.

STORY: The learner sees where they are in the program, what today's session holds and what to beat, does a 3 to 7 minute session of watch-and-tap cards, and leaves with a stamped cell and a logged split.

FIRST VIEWPORT: Program header (track title, segmented week bar, streak, daily goal, gold count). Below, left: the week grid, each row a week label cell plus session cells (kind tag, short title, stamp, accuracy, best time). Right: sticky Today's session card with exercise breakdown, best to beat, and Begin. On phones the card sits above the grid and cells wrap.

FORM: Training program block fused with speedrun splits (user picked the mix of dealt structures 1 and 2 after the decision page failed to render). seed: c0eafb2aacdef70b4e258be020994dd0 reference unavailable; dealt indices 5, 6, 4.

Signature interaction: finishing a session stamps its cell (DONE, then accuracy) and, on a beaten split, flips the time to gold. Motion grammar: stamps thud in (scale and rotate once), times count, everything else is still.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
