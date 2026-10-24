# Stage design — how to cut the ladder, write a brief, and build a hint ladder

A stage is one **felt problem**, one **subject facet**, one **green light**. If you can't name all three for a stage, it isn't a stage yet.

## Cutting the ladder

**Order by dependency, not by difficulty.** The roots are the unconditional truths of the subject — the few things that hold without caveats and that everything else rests on. Each later stage may only use what an earlier stage established (or what Phase 1b proved he already holds). This is the project's version of "unconditional truths first": a stage that quietly needs an unexplained idea produces guessing, and guessing feels like the subject is arbitrary — the exact feeling that stops knowledge from locking in.

**Make the naive approach fail first, wherever the subject allows it.** The strongest motivation isn't a paragraph explaining why technique X is good; it's him writing the obvious thing, watching it break, and *wanting* X. Two ways to arrange that:

- **The trap stage:** stage N asks for behavior the obvious implementation gets wrong (empty input, ordering, mutation, timezone, precision, concurrency). The test he runs catches it. Stage N+1 (or the second half of N) is where the technique arrives — as the answer to a problem he now has.
- **The growing pain:** early stages let him solve it inline; later stages make the inline version visibly untenable (duplication, an untestable branch, a change that ripples through five files). The refactor then feels *earned* rather than imposed. For clean-code and architecture subjects this is the only shape that works — "use layers" taught as a rule is memorized and forgotten; "use layers" arrived at after the third ripple is understood.

**Silent stress is mandatory.** At least one stage must make an earlier design of *his* visibly fail: the binding shape he chose at stage 2 stops fitting, the inline version he wrote at stage 3 now ripples through five files, the loop closure he wrote at stage 4 captures the wrong thing. That retrospective pressure is what turns "I did a thing" into "I understand the thing I did" — his own earlier decisions have to come back and make his life harder. And it stays **silent**: never warn him in a brief, a comment, a test name, or the plan that a later stage will break his design. Signposted stress is a spoiler; surprised stress is the lesson.

**Size:** stage count and stage size follow the kind and the subject's complexity — see `kinds.md` (`real-life` 4–8 × 30–60 min, `build-it` 4–8 × 45–90 min, `read-debug` 2–5 × 20–60 min). Stage 1 should be the *smallest* and end fastest — the first green test is what buys his trust in the loop. Put the hardest facet where his momentum is highest, and end on a **capstone**: the thing does what he said he wanted to be able to do in Phase 1c — the app runs end to end, the real client talks to his implementation, the reported defect is gone and he can explain why it happened.

**Independence of verification:** each stage must be checkable without later stages existing. If stage 3's tests can only pass once stage 5 is done, split or reorder — a stage he can't get green is a stage he abandons.

**What each stage carries:** one new idea. Two ideas in one stage means two possible failure points and no clean diagnosis. If a stage needs "and also", that's the next stage.

## Bug stages — where the subject bites

In `real-life`, `read-debug` and `mix` projects the subject is taught through **defects**: the bug exists *because of* the subject (a `var` captured by a callback, a mutation escaping its scope, a stale closure over config, a shared module-level binding), and understanding the subject is the shortest path to the real fix. Four delivery mechanisms, chosen by stage and by his level:

1. **Ticket + repro.** A ticket file (`docs/tickets/TICKET-1042.md`) with a symptom, a reproduction and a customer voice, plus a failing test. Right for early stages and for learners still finding their feet: the failure is concrete, the cause is not.
2. **Failing test only.** The brief points at the failing assertion and states the expected behavior. The cause is his to find.
3. **Symptom only.** The app runs and produces wrong output (a wrong total, state leaked between two requests). No failing test — he must write the probe himself before he can fix anything. Challenge stage.
4. **Hidden defect.** Nothing is visibly wrong yet. A new requirement can only be satisfied once he finds and fixes the defect blocking it — or the hidden acceptance suite fails on a case he'd never think to check. Challenge stage.

Mechanisms 3–4 are challenge stages and normally carry a **hidden acceptance suite** (see `project-anatomy.md`); 1–2 can carry one too when the lesson is "your fix is narrower than the bug". Both origins are fair game: a bug **seeded** in code we shipped him, and a bug he **inflicted on himself** in an earlier stage — the second is remembered better, the first is more realistic. Use both.

For `build-it` projects the equivalent is the **spec stage**: the requirement the naive design cannot satisfy (a cache that must evict, a database that must survive a crash, a loop that must bind per iteration). Same principle — the failure motivates the mechanism.

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
- **Definition of done has two halves:** the green command, and the stage's **definition-of-done quiz** (`docs/quiz/stage-NN.md`) — a graded question with one right answer. A stage can be green by luck; it can't pass the quiz by luck. The stage is **not done** until he answers it correctly — see below.
- **Never mention a later stage's technique.** Foreshadowing ("we'll use a factory in stage 5") spoils the discovery.
- **Never include the implementation.** Not in a code block, not as "for example", not in a comment. If an example is truly needed, it goes in the hint ladder, tier 3, on *different* data.

## The definition-of-done quiz — `docs/quiz/stage-NN.md`

One graded question per stage, answered **after** the code is green. It is blocking: a wrong or "I don't know" answer means the stage is still open. It exists because green tests prove the code works — they don't prove he knows *why* it works.

The file holds a single fenced `json` block containing exactly the parameters of the `quiz` tool, so the coach can read the file and call `quiz` with it unchanged:

```json
{
  "question": "After swapping the SQL repository for the in-memory one, every test passes with zero edits in src/domain/. Why can src/domain/ never mention SQL again?",
  "options": [
    { "label": "…", "value": "a" },
    { "label": "…", "value": "b" },
    { "label": "…", "value": "c" }
  ],
  "correctAnswer": "b",
  "explanation": "…"
}
```

Rules:

- **It asks the stage's definition-of-done question** — the one thing he should be able to say in his own words — in graded form. Prediction questions ("what happens when this list is empty?", "which binding does this closure capture?") are the strongest form: they expose a wrong model rather than test recall.
- **Options follow the construction procedure in SKILL.md**: bare claims, the correct claim written first and mutated into distractors, each distractor a real misconception, no asymmetric formatting.
- **The file never reaches him before he answers**, and neither the answer nor the explanation is ever mentioned in chat before the tool grades him. The coach reads the file straight into `quiz` — nothing more.
- **Wrong answer → the stage stays open.** Teach the point in one or two sentences, then ask a fresh *equivalent* question written on the spot (this one is spoiled once graded). Only a correct answer closes the stage.

## The hint ladder — `docs/hints/stage-NN.md`

Reached only through the `hint` tool (one tier per call, logged). Four tiers, escalating in specificity, none of them the answer:

- **Tier 1 — a nudge.** Redirects attention to the right part of the problem. No approach, no vocabulary he hasn't seen. Often a question. *("What does the test say the return value is when the cell is empty — and what does `Number("")` give you?")*
- **Tier 2 — the concept, explained plainly.** The missing knowledge, stated without touching his problem: no code, no identifiers, no "in your case…". *("A CSV cell is always a string; `Number("")` is `0` and `Number("abc")` is `NaN` — so an empty numeric cell has to be decided *before* conversion, not after.")* This tier exists because the commonest reason a nudge doesn't land is missing knowledge, not missing cleverness — especially when he knows only the basics. Skip it downward only when the probe already proved he holds the concept.
- **Tier 3 — the approach in words.** The shape of the solution, zero code, zero identifiers he could paste. *("Convert at the boundary: one function that takes the raw string row and returns a typed record, so nothing downstream ever sees a string.")*
- **Tier 4 — an isomorphic worked example on DIFFERENT data.** Same technique, different domain, complete enough to study but useless to paste. *("Same shape, different problem: parsing `age` from a query string — `params.age` is `string | undefined`, so `undefined → null`, `"" → null`, otherwise `Number(...)` with a `NaN` guard. Your case has the same three-way decision, on a CSV cell.")*

Format — the markers are what the tool parses, so they must be exact:

```markdown
<!-- hint:1 -->
Tier 1 text. Markdown is fine; keep it to a few lines.
<!-- /hint -->

<!-- hint:2 -->
Tier 2 text — the concept, plainly.
<!-- /hint -->

<!-- hint:3 -->
Tier 3 text — the approach in words.
<!-- /hint -->

<!-- hint:4 -->
Tier 4 text — the isomorphic example.
<!-- /hint -->
```

Ladder rules:

- **Tier 4 must not be portable.** Change the domain, the names, and the data. If he can paste it, it's a solution leak — rewrite it.
- **Every stage gets all four tiers**, even easy ones: the ladder is what keeps "I'm stuck" from becoming "coach, write it for me".
- **Write the ladder from his likely wrong turns**, not from your solution. The researcher's misconception list is the source: tier 1 should address the *specific* wrong model that produces the failure he'll actually see.
- **Nothing in the briefs or README links into `docs/hints/`.** Discoverability is via `/hint` only — reading ahead is his choice, not your suggestion.

## Sizing and calibration

- Estimate each stage's minutes in the brief header and the manifest. Estimates come from the `solution-checker`'s actual solve time, not your guess — it reports them, so put its numbers in before handing over.
- The hint log is your calibration instrument: `t1×1` for a stage means it was well-scoped; `t3×3` means it was too hard or under-specified; zero hints and a four-minute solve means it was filler. Recut the *remaining* ladder when you see this, and tell him why.
- If he blows through the whole project, the fix is a harder variant (an extension stage with a nastier requirement), not a bigger project.
