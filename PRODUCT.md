# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Job seekers and career-switchers preparing for data science, AI/ML and software engineering interviews (confirmed: public product). The founder is the first user, but the product must work for strangers who arrive with no context. They study in two modes: short sessions on a phone (commute, bed, between tasks) and longer sessions on a laptop. Lessons must feel good one-handed on a phone.

## Product Purpose
Gradient.ai (GRADIENTAI) is a self-contained, adaptive interview-prep course: ten tracks (Foundations, Coding Interviews, ML, Deep Learning & GenAI, Agentic AI, Data Science, Business Analytics, Software Engineering, ML System Design, Investing & Trading). Every answer updates a per-skill mastery estimate. Success means people come back daily, progress through small lessons without feeling overwhelmed, and eventually solve hard (LeetCode Hard level) interview problems and pass real interviews.

## Positioning
A habit-forming, game-like learning path for technical interviews, modeled on the mechanics of language-learning apps (small steps, unlocks, streaks, lives, daily goals) but with its own identity and no visual imitation of any specific app. Content is taught through watch-first animations and tap/drag exercises rather than long reading. Everything runs in the browser with no account and no backend.

## Operating Context
- Static site deployed on GitHub Pages at https://frankponce.me/gradient-course/ (custom domain via the owner's user site).
- Progress, game state and settings live in the browser's localStorage, exportable as JSON.
- The coding-interview course is a path of units: a teaching lesson (or two) per unit, then practice lessons, then problems escalating to Hard, then a unit test and a reward.
- Older surfaces stay: track pages, written lessons ("guidebooks"), quizzes, mock tests, the interactive lab, coding practice (Python, JavaScript, SQL in the browser), the LeetCode hub, shop, profile and coin exchange.

## Capabilities and Constraints
- Vanilla HTML/CSS/JS, no build step, no dependencies; Pyodide and sql.js load from a CDN on first use.
- Dark theme is the default; a light theme exists and must keep working.
- Must not imitate the trade dress of Duolingo or any other specific product (user requirement).
- All motion must respect prefers-reduced-motion.

## Brand Commitments
- Gothic black with blood-red accent (#A8191F family), shared with the owner's other work (Stray Club, frankponce.dev).
- The self-roasting joke voice: the "Got Rejected Again, Decided I'm an Ex-Larper Now. Training Arc Initiating..." backronym and level titles such as "Google won't even look at your resume".
- The game economy is part of the product: XP, levels, coins, streaks, quests, achievements, the shop, cursed pet companions (Void, Nyx, Boo-lean, Overfit, Null) and the coin exchange.
- Not binding (open to change): the blackletter display type and the sigil ornaments.

## Evidence on Hand
No users, testimonials, metrics or press yet. Do not fabricate any.

## Product Principles
1. Small, finishable steps: every session ends with visible progress.
2. Show before telling: animate the idea, then let the learner prove it.
3. Interaction over reading: tap, drag, match and order; long text lives in guidebooks.
4. Honest difficulty: the path keeps escalating until Hard problems are approachable.
5. Personality without noise: jokes and rewards add delight but never block the learning.

## Accessibility & Inclusion
Every drag interaction needs a tap/keyboard alternative. Respect prefers-reduced-motion. Keep text readable on small phones.
