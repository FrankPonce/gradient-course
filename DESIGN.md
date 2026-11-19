---
name: GRADIENT
description: Gothic training-program interview prep. Near-black sheet, bone text, blood-red ink, gold only for PRs.
colors:
  bg: "#0C0B0B"
  paper: "#151313"
  card: "#1E1B1B"
  rule: "#2D2828"
  ink: "#F2ECE8"
  ink2: "#B5ACA8"
  mute: "#7C7370"
  blood: "#A8191F"
  or: "#D02A34"
  bad: "#E25A72"
  green: "#8FBA6A"
  gold: "#E0A63C"
  code: "#080707"
  code-ink: "#E9E2DE"
  light-bg: "#F3EEE6"
  light-paper: "#FBF8F3"
  light-card: "#EAE3D8"
  light-rule: "#DAD1C3"
  light-ink: "#161313"
  light-ink2: "#4D4643"
  light-mute: "#8A817B"
  light-or: "#A8191F"
  light-bad: "#B12848"
  light-green: "#4B7A28"
  light-gold: "#7A5200"
typography:
  display:
    fontFamily: "Gothic Mix, Grenze Gotisch, Pirata One, Georgia, serif"
    fontWeight: 700
  wordmark:
    fontFamily: "Pirata One, Grenze Gotisch, serif"
    fontSize: 30px
    fontWeight: 400
  ui:
    fontFamily: "Bricolage Grotesque, Inter, Segoe UI, system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: 15px
    lineHeight: 1.6
  mono:
    fontFamily: "JetBrains Mono, Cascadia Code, Consolas, monospace"
    fontSize: 13px
rounded:
  card: 14px
  option: 10px
  token: 8px
  none-on-program: 0
spacing:
  program-head-gap: 26px
  body-gap: 28px
  cell-pad: 12px 14px
  main-pad: 38px 48px 90px
components:
  button-primary:
    backgroundColor: "{colors.blood}"
    textColor: "#FFFFFF"
    rounded: "hex clip-path, 10px points"
    padding: 10px 20px
  button-primary-hover:
    backgroundColor: "{colors.or}"
  session-cell-now:
    backgroundColor: "or 10% over paper"
    textColor: "{colors.ink}"
  session-stamp:
    textColor: "{colors.or}"
    rounded: 0
  session-stamp-gold:
    textColor: "{colors.gold}"
---

# Design System: GRADIENT

## 1. Overview

**Creative North Star: "The training sheet."** A course is a printed program: weeks are ruled rows, sessions are cells, finished cells get stamped, and every session keeps a split. The surface is a near-black sheet with hairline rules, bone text and blood-red ink. It is gothic on purpose (shared with the owner's Stray Club and frankponce.dev work) and refuses the winding path of round nodes and the full-width colored feedback slab.

The system is recorded from the shipped build (`css/app.css`, `js/path.js`, `js/anim.js`). Two layers coexist: the older gothic app shell (cards, tracks, quizzes, shop, HUD) and the newer program layer (`.prg`, `.sheet`, `.ses`, `.ln-*`, `.vstamp`, `.log-stamp`). The program layer is the reference for new surfaces.

**Key characteristics**
- Dark is default; light is a full variable swap on the same rules (`[data-theme="light"]`).
- Blood red is the only chromatic voice. Gold exists only for PRs and gold splits.
- Correct is bone (ink), a miss is blood red. Green and the track hues are not used for session feedback.
- Hex-clipped buttons, tags and chips; rectangular cells; no circles as nodes.
- Verdicts are rotated rubber stamps. Everything else is still.

## 2. Colors

Dark values are the defaults; light values are listed in the front matter with the `light-` prefix. The `--blood` and `--or` pair is the red family: `--blood` (#A8191F) is surface fill (primary button, active nav, level chips); `--or` (#D02A34 dark, #A8191F light) is ink (stamps, current-session ring, focus ring, wrong state, links in prose).

### Roles
- **Sheet** `--bg #0C0B0B`, **Paper** `--paper #151313` (cards, sheet), **Card** `--card #1E1B1B` (week-label cells, buttons, chips), **Rule** `--rule #2D2828` (every hairline).
- **Bone ink** `--ink #F2ECE8`, `--ink2 #B5ACA8` (secondary), `--mute #7C7370` (captions, locks, line numbers).
- **Blood red** `--blood`, `--or`. **Bad** `--bad #E25A72` is a lighter red for negative numbers and hard-difficulty tags.
- **Gold** `--gold #E0A63C` dark, `#7A5200` light. Used for: gold-count stat, PR kind label, gold stamp and gold split time, PR note icon.
- **Green** `--green #8FBA6A` survives for legacy surfaces (easy tag, quest done, positive deltas), not for session verdicts.
- Track hues `--t-*` and level hues `--lv0..4` colour track tiles and mastery bars only. On the program page the track hue enters as `--pc` (week bar fill, continue-card kicker).
- Code surface `--code #080707` with `--code-ink #E9E2DE`.

### Named rules
**The Gold Rule.** Gold marks a personal record or a gold split and nothing else.
**The Verdict Rule.** Right is bone, wrong is blood red. Never green and red.
**The Single Red Rule.** Red is stamps, the current session, focus, and primary action. It is not decoration.
**No Glow.** `--glow` is `transparent` in both themes. No coloured shadows or halos.

## 3. Typography

- **Display** Gothic Mix (Grenze Gotisch lowercase and digits, plain Grenze capitals, self-hosted in assets/fonts; user asked for readable capitals; Pirata One fallback): page titles (46px on program head, 34px lesson headings, 28px Today title), 700. Wordmark in Pirata One 30px.
- **UI** Bricolage Grotesque: labels, buttons (600, 14px), stamps (800), stats (700), cell titles (600 14.5px/1.3).
- **Body** Inter, 15px/1.6; session text 17.5px/1.65 capped at 65ch; prompts 21px/1.4 600.
- **Mono** JetBrains Mono 13px for code, token chips, line numbers and every time/number in the program layer (`.num`: mono, tabular-nums). Ligatures are disabled in code.

Ramp as used in the program layer: 46 / 34 / 28 / 26 (week number) / 22 (stat values) / 21 (prompt) / 17.5 / 14.5 / 13 / 12 / 11.5.

**Rule: numerals that are measured (times, accuracy, counts, ×N) are mono.**

## 4. Elevation

Flat. Depth comes from the Sheet, Paper, Card ladder and 1px `--rule` lines. Existing soft drop shadows (toast, hover lift on track/lab cards, equipped shop item, the dragged ghost token) are overlay or hover affordances on older surfaces; the program sheet itself has none. No hard offset shadows anywhere.

## 5. Components

### Buttons
- **Primary** `.btn.primary`: `--blood` fill, white text, hex clip-path (`--hex`, 10px points), hover to `--or`, 1px press. A white sheen sweep runs on hover. `.today-go` and `.ln-go` are full-width / 150px-min variants at 16px.
- **Default** `.btn`: `--card` fill, hex clip. **Small** uses `--hexs` (6px points). Disabled is 40% opacity.
- **Segmented** `.seg`: hex container, active segment `--blood`.

### Tags, chips, pills
`.tag`, `.chip`, `.pill`, `.lv`, `.tk` are all hex-clipped (`--hexs`) on `--card`. Difficulty tags tint paper with green / `--lv2` amber / bad.

### Program sheet (signature)
- **Week row** `.wk`: 200px label cell on `--card` (mono "W1" number 26px, title 19px/600, sub, `n/N` count) beside a `repeat(auto-fill,minmax(150px,1fr))` grid of session cells. Completed weeks turn the number `--or`. Phones: single column, two-up cells.
- **Session cell** `.ses`: transparent button, left and bottom 1px rule, min-height 104px; kind label (12px, `--ink2`; PR kind is gold), title clamped to 2 lines (4 when current), footer slot.
  - **locked**: lock glyph, `--mute`, no hover.
  - **now**: 10% `--or` over paper, 2px inset `--or` ring, "Up next" in `--or`.
  - **done**: 7% `--blood` over paper, stamp plus split row.
- **Stamp** `.ses-stamp`: 2px `--or` border, `--or` uppercase 12px/800 text, rotate(-5deg), square corners. Text is Done, PR, accuracy% (tests) or Gold.
- **Split** `.ses-split`: mono time then accuracy%, `--ink2`. On a gold session the time turns `--gold` and the stamp border and text become gold. A PR-kind cell that is done is gold-stamped regardless.
- **Today card** `.today`: sticky (top 20px), 320px column, Paper, 14px radius; title in display 28px, exercise breakdown rows with mono `×N`, optional gold bolt note for PR sessions, full-width primary button, guidebook link. Under 980px it moves above the sheet (`order:-1`, static).
- **Program head**: title, lead, week bar `.prg-bar` (one 8px bar per week filled in track colour `--pc`), stats `dl` (Sessions, Today XP/50, Streak, Gold splits in gold, Sum of best).

### Session player
- Top row: 36px square close button, segmented progress rule (6px segments, `--or` when cleared), personal-best clock in mono, lives as small hexagons (`--or` when on).
- **Options** `.ln-opt`: Paper, 1px rule, 10px radius; selected is `--or` border and inset ring with a filled `--or` key; right is bone border and 10% bone tint; wrong is `--or` border and 9% tint with a shake.
- **Tokens / slots / bins / rank / match / bug lines** share the same selected, right, wrong states. The bug-line exercise marks lines by tint and a coloured line number, not a side stripe.
- **Verdict footer** `.ln-foot` + `.vstamp`: bone stamp for correct (with a praise line), `--or` stamp for a miss; stamp is 2.5px border, rotate(-5deg), `stampIn` (scale 2.2 and rotate -18deg to rest, 0.45s overshoot ease). Bottom bar is sticky on phones (<700px) with a full-width Continue.
- **Session log** `.log`: large 3px stamp (`--or`, gold when a split was beaten, `--bad` for a failed test), a two-column ruled table of time, accuracy and deltas (positive deltas `--green`).

### Concept animations (`js/anim.js`)
Looping SVG explainers (`.anim`) with a caption: growth, constants, nested, halving, hashing. Strokes use `--or` for the focus curve and `--navy`, `--green`, `--blue`, `--bad`, `--pink` for comparison series. In reduced motion each renders its final frame once (`step(1)`).

### Navigation
256px sticky sidebar, hex-clipped links, active link `--blood` fill, a 140px `--or` fade line on the sidebar edge, group labels in the app shell.

## 6. Do's and Don'ts

**Do**
- Use `--ink` for correct and `--or` for wrong; gold only for PRs and gold splits.
- Clip interactive pills and buttons with `--hex` / `--hexs`; keep cells rectangular and ruled.
- Set measured numbers in mono with tabular figures.
- Animate verdicts as a single thud (scale and rotate once); keep the rest still.
- Provide a tap or arrow-button path for every drag (rank has up/down buttons; tokens are tappable).

**Don't**
- Don't add coloured glow, hard offset shadows, or side-stripe borders.
- Don't add kicker or eyebrow labels above headings.
- Don't use emoji or glyph icons; icons are the authored stroke SVG set (`I` in `path.js`, one 2px stroke weight) plus the thorn and sigil masks.
- Don't use round nodes for progress, or a full-width coloured feedback slab.
- Don't put gold on anything that is not a PR or a gold split.

## 7. Motion and accessibility

- Easing token `--ease: cubic-bezier(.22,.9,.24,1)`. Page and card entrances use `rise`/`fade` (8-14px translate, 0.3-0.5s). Stamps use `stampIn` with an overshoot curve.
- `@media (prefers-reduced-motion: reduce)` disables every CSS animation and transition (`*{animation:none!important;transition:none!important}`). JS paths also check it: `anim.js` draws a static final frame, and `path.js` scrolls to the current session without smooth behaviour.
- Focus ring: 2px `--or`, 3px offset (inset on session cells).
- Touch targets on phones: close and rank-move buttons grow to 44px under 700px.

## 8. Known gaps and drift (recorded, not canonized)

Honest gaps in the build:
- **No live session clock or ghost.** Only the personal-best time is shown at the top of a session; the speedrun-log promise is partly met (splits are logged, not raced live).
- **Stamps are flat CSS.** Border, text and rotation only; no ink texture, bleed or misregistration. They read as outlined labels more than rubber stamps.
- **Stamped and gold states have not been captured visually** in screenshots; they are recorded here from the CSS and `path.js` markup.

Drift present in the build and deliberately not made into rules:
- Uppercase, wide-tracked small labels (`.cap`, `.ng`, `.tname`, `.tbl th`, `.stim .cap`) are kicker-style labels carried by the older shell; not to be extended to new surfaces.
- `.av-code span.on` uses a 3px left border as a highlight stripe; `.lcard::before` draws a gradient top stripe. Side-stripe pattern is not part of the system.
- `.btn.primary::after` sheen sweep, `.xpbar` gradient shimmer and `.callout` / `.loot` gradient backgrounds are legacy flourishes.
- Gold is hard-coded as `#C9933A` in `.toast`, `.loot`, and `anim.js` (`C.gold`) instead of `--gold`; the two golds differ (`#E0A63C` token).
- `.wk-n` references an undefined `--mono` variable and falls back to the generic `monospace` rather than JetBrains Mono.
- Legacy `.opt.right/.wrong` (quiz sessions) match the verdict rule; `.expl.ok/.no` and `.rev` marks still use green for correct.
