# Depth plan: from overview to interview-ready

Goal: someone who finishes a track can answer the questions a real loop asks, including the follow-ups, and can produce answers (write code, state a design, say an explanation), not just recognize them.

## The bar (every topic must have all five)

1. A worked example, step by step, in our own words.
2. The trap: the mistake candidates actually make, as a card.
3. A produce-it exercise: type code, type a number, order your own steps, or say it out loud (see new card types).
4. The follow-up chain: question, then the interviewer's next two pushes, each harder.
5. A spaced-review hook: a missed card returns after 1, 3 and 7 days.

## New card types

- `say`: prompt, you answer out loud or in the box, then the model answer appears with a 3 to 5 item checklist; you tick what you hit. Self-graded, tracks the hit rate.
- `chain`: a question plus 2 to 3 escalating follow-ups; the next one unlocks after you answer.
- `code`: runs your Python or JavaScript against hidden tests inside a session (reuse the Coding-page judge).

## Phases

1. **Coding Interviews (hand-authored, strongest base).** Grow runnable problems from 30 to about 150, five per pattern from easy to hard, each with a from-scratch card and a follow-up chain. Add a `say` card to every week ("explain your approach and its complexity").
2. **Books to cards, one track at a time.** You supply a book or chapter; I extract the topic list and the worked examples' structure, then write original cards (no copied text or exercises). Start with ML (Hands-On ML, ISLP), then ML System Design, Data Science and Analytics, Software Engineering, Agentic AI, Finance.
3. **Replace generated weeks with authored ones.** Each auto program gets authored Learn sessions (800 to 1,500 words of real teaching per week, with examples) and a mix with at most 50% multiple choice.
4. **Interview loop v2.** Per track, 25 follow-up chains and 10 full mock rounds (`say` plus `code` plus `chain`), plus a behavioral set for every track.
5. **Readiness score.** A per-track checklist of "can you do X" skills with a pass or fail from your own session history, so "ready" means something measurable.

## Quality gates (before any content ships)

- Facts and numbers verified against the source book or by hand.
- Wrong options wrong for a concrete reason; correct option is the longest in at most 30% of multiple-choice cards (`tools` script measures it).
- No copied text, problems or exercises from any book.
- `node tools/check.js .` clean and a puppeteer play-through of every new session.

## Rough size

Phase 1 is the largest single piece (about 120 problems). Each track in phase 2 and 3 is roughly 4 to 8 weeks of authored content.
