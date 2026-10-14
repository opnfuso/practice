# Stage design — how to cut the ladder, write a brief, and build a hint ladder

A stage is one **felt problem**, one **subject facet**, one **green light**. If you can't name all three for a stage, it isn't a stage yet.

## Cutting the ladder

**Order by dependency, not by difficulty.** The roots are the unconditional truths of the subject — the few things that hold without caveats and that everything else rests on. Each later stage may only use what an earlier stage established (or what Phase 1a proved he already holds). This is the project's version of "unconditional truths first": a stage that quietly needs an unexplained idea produces guessing, and guessing feels like the subject is arbitrary — the exact feeling that stops knowledge from locking in.

**Make the naive approach fail first, wherever the subject allows it.** The strongest motivation isn't a paragraph explaining why technique X is good; it's him writing the obvious thing, watching it break, and *wanting* X. Two ways to arrange that:

- **The trap stage:** stage N asks for behavior the obvious implementation gets wrong (empty input, ordering, mutation, timezone, precision, concurrency). The test he runs catches it. Stage N+1 (or the second half of N) is where the technique arrives — as the answer to a problem he now has.
- **The growing pain:** early stages let him solve it inline; later stages make the inline version visibly untenable (duplication, an untestable branch, a change that ripples through five files). The refactor then feels *earned* rather than imposed. For clean-code and architecture subjects this is the only shape that works — "use layers" taught as a rule is memorized and forgotten; "use layers" arrived at after the third ripple is understood.

**Size:** 4–8 stages, 30–60 minutes each, 2–6 hours total. Stage 1 should be the *smallest* and end fastest — the first green test is what buys his trust in the loop. Put the hardest facet where his momentum is highest (usually stages 3–5), and end on a stage that makes the whole thing *do* what he said he wanted to be able to do in Phase 1b.

**Independence of verification:** each stage must be checkable without later stages existing. If stage 3's tests can only pass once stage 5 is done, split or reorder — a stage he can't get green is a stage he abandons.

**What each stage carries:** one new idea. Two ideas in one stage means two possible failure points and no clean diagnosis. If a stage needs "and also", that's the next stage.

## The brief — `docs/stages/stage-NN-<slug>.md`

Fixed structure, in this order. The order *is* the pedagogy: problem → requirements → constraints → verify → done. No theory section, and no hints (those live in the ladder).

```markdown
# Stage 3 — Enforce the boundary

**Est. 45 min · Verify: `npm test -- stage03` · Depends on: stage 1, stage 2**

## Why this stage exists
Right now `ReportService` builds SQL strings. It works — stage 2's tests are
green. Try this: swap the fixture database for the in-memory one in
`fixtures/`. Every test breaks, and to fix them you have to edit the service.
That coupling is the problem this stage removes.

## What you'll build
A `ReportRepository` interface in `src/domain/`, and an implementation in
`src/infra/`. The service depends on the interface and never sees SQL.

## Requirements
Behaviour the tests will hold you to:

1. `ReportService` compiles and passes stage 1–2 tests with **no** import of
   anything under `src/infra/`.
2. `SqlReportRepository` implements `ReportRepository` and is the only module
   that mentions SQL.
3. Swapping in `InMemoryReportRepository` (provided) makes all tests pass with
   **zero** edits to `src/domain/`.
4. The boundary test `tests/stage03_boundary.test.ts` passes: it fails the build
   if `src/domain/**` imports from `src/infra/**`.

## Constraints
- Don't change the public signatures from stage 2 — later stages depend on them.
- No new dependencies.
- The interface goes in `src/domain/`, not `src/infra/`. (Why do you think that
  is? If you're not sure, that's a tier-1 hint question — ask, or reason it out
  from requirement 1.)

## Files you'll touch
`src/domain/report-repository.ts` (new), `src/infra/sql-report-repository.ts`
(new), `src/report-service.ts` (edit the seams marked `TODO(stage-3)`).

## Definition of done
`npm test -- stage03` green, stage 1–2 still green, and you can answer: *why
does the interface live in `domain/` and not `infra/`?* — in one sentence, in
your own words. Say it out loud to the coach; that question is the lesson, the
code is the practice.
```

Rules for briefs:

- **"Why this stage exists" comes first and is concrete.** A reproducible poke he can perform ("try swapping X — watch what breaks"), not an abstract justification. If you can't write this section without saying "because it's best practice", the stage isn't motivated — re-cut it or move it later in the ladder.
- **Requirements are testable statements**, numbered, in behavior terms ("the service passes all tests with no import of infra"), not instructions ("use dependency injection"). Name the technique *only after* the requirement makes it desirable — and prefer letting the test name it for you.
- **Constraints exist to keep stages independent and to create the productive friction.** Say which. A constraint with no reason reads as arbitrary, and arbitrary rules don't get internalized.
- **Files you'll touch** keeps him from wandering; the TODO markers keep him from missing a seam.
- **Definition of done has two halves:** the green command, and **one question he should be able to answer in his own words**. The question is where understanding gets checked — a stage can be green by luck, but not explainable by luck. This is the project's replacement for the confirm-after-each-node quiz.
- **Never mention a later stage's technique.** Foreshadowing ("we'll use a factory in stage 5") spoils the discovery.
- **Never include the implementation.** Not in a code block, not as "for example", not in a comment. If an example is truly needed, it goes in the hint ladder, tier 3, on *different* data.

## The hint ladder — `docs/hints/stage-NN.md`

Reached only through the `hint` tool (one tier per call, logged). Three tiers, escalating in specificity, none of them the answer:

- **Tier 1 — a nudge.** Redirects attention to the right part of the problem. No approach, no vocabulary he hasn't seen. Often a question. *("What does the test say the return value is when the cell is empty — and what does `Number("")` give you?")*
- **Tier 2 — the approach in words.** The shape of the solution, zero code, zero identifiers he could paste. *("Convert at the boundary: one function that takes the raw string row and returns a typed record, so nothing downstream ever sees a string.")*
- **Tier 3 — an isomorphic worked example on DIFFERENT data.** Same technique, different domain, complete enough to study but useless to paste. *("Same shape, different problem: parsing `age` from a query string — `params.age` is `string | undefined`, so `undefined → null`, `"" → null`, otherwise `Number(...)` with a `NaN` guard. Your case has the same three-way decision, on a CSV cell.")*

Format — the markers are what the tool parses, so they must be exact:

```markdown
<!-- hint:1 -->
Tier 1 text. Markdown is fine; keep it to a few lines.
<!-- /hint -->

<!-- hint:2 -->
Tier 2 text.
<!-- /hint -->

<!-- hint:3 -->
Tier 3 text — the isomorphic example.
<!-- /hint -->
```

Ladder rules:

- **Tier 3 must not be portable.** Change the domain, the names, and the data. If he can paste it, it's a solution leak — rewrite it.
- **Every stage gets all three tiers**, even easy ones: the ladder is what keeps "I'm stuck" from becoming "coach, write it for me".
- **Write the ladder from his likely wrong turns**, not from your solution. The researcher's misconception list is the source: tier 1 should address the *specific* wrong model that produces the failure he'll actually see.
- **Nothing in the briefs or README links into `docs/hints/`.** Discoverability is via `/hint` only — reading ahead is his choice, not your suggestion.

## Sizing and calibration

- Estimate each stage's minutes in the brief header and the manifest. Estimates come from the `solution-checker`'s actual solve time, not your guess — it reports them, so put its numbers in before handing over.
- The hint log is your calibration instrument: `t1×1` for a stage means it was well-scoped; `t3×3` means it was too hard or under-specified; zero hints and a four-minute solve means it was filler. Recut the *remaining* ladder when you see this, and tell him why.
- If he blows through the whole project, the fix is a harder variant (an extension stage with a nastier requirement), not a bigger project.
