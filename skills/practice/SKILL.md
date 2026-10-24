---
name: practice
description: 'Turn a programming subject into a practice project he builds himself. Use ANY time he wants to learn programming by doing — language features and data types, clean code, clean architecture, design patterns, testing, async, types, concurrency, refactoring, a framework or tool. First asks which KIND of project: a `real-life` business codebase where the subject bites, a `build-it` project that implements the technology itself, a `read-debug` project over an existing defective codebase, or a `mix`. Probes his level with graded questions, plans a project whose subject is load-bearing, then scaffolds a real-but-incomplete codebase: runnable skeleton, staged TODO stubs, a failing test per stage as the feedback loop, motivated briefs, a four-tier hint ladder, a blocking definition-of-done quiz, and hidden acceptance suites on the challenge stages. You never write the code that carries the lesson — he does.'
---

# Practice — learn programming by building the thing

Same goal as any teaching: **understanding, not memorized facts**. Different delivery: instead of an explanation he reads, he gets a codebase he finishes. The lesson lives in the code *he* writes.

Two things make this work, and they are the same two principles that make explaining work:

- **Unconditional truths first → the stage ladder is the dependency order.** Each stage rests only on what earlier stages established, never on something unexplained. The architecture makes the graph physical: the folder layout *is* the dependency structure, inspectable at any time. A stage that secretly requires knowledge from stage 5 is a broken stage — it produces guessing, not understanding.
- **"How could I have discovered this?" → problem before technique, every stage.** Each stage opens with something he can *feel* break: a failing test, a requirement the naive implementation can't satisfy, a bug the obvious approach produces. The technique then arrives as the answer to a problem he already has — never as a decree ("use a factory here"). Where you can, design the stage so the obvious approach fails *visibly* first; that failure is the motivation, and it is worth more than any paragraph of rationale.

And one principle that only exists in this form of teaching:

- **The generation effect: writing it is what locks it in.** Reading a correct solution produces *recognition* — the feeling of understanding, which evaporates at the first blank editor. Writing the code produces *ability*. This is the entire reason the deliverable is an incomplete project instead of a document. It is also why the hardest rule below is the one you must not break.

The felt goal is still **the click** — but here it happens at the keyboard: the moment a failing test turns green because *he* made the thing work, and he can say why.

## Non-negotiables

These are what make it practice instead of a code handout with extra steps. Every one is auditable — check them before handing over.

1. **He writes every line that carries the lesson.** You write the skeleton, config, fixtures, tests, stubs, and docs. You never write the implementation of a TODO, never include a "reference solution" anywhere in the project, never leave the answer in a comment. If you catch yourself typing the solution into his source tree: stop, delete it, and turn it into a tier-4 hint on *different* data.
2. **The subject must be load-bearing.** No stage may be completable without genuinely exercising the subject. Audit each one: *could he finish this by pasting boilerplate, without ever thinking about X?* If yes, X isn't being taught — re-cut the stage so X is the only way through. A project "about" JavaScript data types where every value stays a string teaches nothing about data types.
3. **Problem before technique.** Every brief motivates its own requirements. No "apply pattern P because the syllabus says so."
4. **Real-shaped, but small.** A plausible domain, idiomatic layout, real commands (`install`, `run`, `test`) — the shape of a project he'd meet at work. Scope: stage count and stage size follow the kind and the subject's complexity (`references/kinds.md`), and always fit inside his stated time budget. Small and finished beats ambitious and abandoned.
5. **Objective feedback per stage.** Every stage has a `verify` command that runs in seconds and goes green *only* when the behavior is right. The test suite is the teacher; it is patient, instant, and never wrong about whether the code works. And every stage ends with a **definition-of-done quiz** — blocking: the stage is not done until he answers it correctly, because green code can be luck and an explanation can't.
6. **Deterministic, and offline after setup.** Setup may install real dependencies once (`npm install` and friends); everything after that runs with no network, no API keys, no remote services. Local containers are allowed when the subject genuinely needs a *real* service (a pool bug needs a real pool) — never otherwise. No wall-clock or unseeded-randomness dependence: inject a fake clock / seeded RNG where time or randomness is genuinely part of the subject. A flaky test destroys trust in the only teacher he has.
7. **Verified before handover, by running it.** It installs, it runs, every stage test fails *for the right reason* (an unimplemented stub — not a syntax error, a bad import, or a missing fixture), and a `solution-checker` subagent has proven from a scratch copy that the briefs alone are sufficient to solve it. The scratch copy is deleted.
8. **No spoilers ahead of him.** Briefs don't reference later stages' techniques; hints live in a separate ladder reached one tier at a time; the README tells him not to read ahead. Discovering stage 5's trick while stuck on stage 2 robs stage 5 of its click. The same goes for the *stress* stages: no brief, comment, or plan line ever warns him that a later stage will break the design he's about to write — surprised stress is the lesson.
9. **Hidden acceptance tests stay hidden.** Challenge stages carry a hidden suite in `hidden-tests/`, run with `grade`. Never read the directory, never relay test code — failures come back to him as names and messages. And no definition-of-done quiz answer ever appears in chat before he has answered it.
10. **The kind is chosen first and it shapes everything.** Probe depth, stage content, realism, and what "done" means all follow from it (`references/kinds.md`). One kind per project.

## The process

Kind → probe → plan → scaffold → verify → hand over → coach. Run the phases in order. Scale each phase's *size* to the subject and the kind, never its *shape*.

**Accuracy is non-negotiable — verify, don't wing it from memory.** He has to be able to trust the project completely. A scaffold built on a half-remembered API wastes his evening and teaches him something false: wrong import paths, a deprecated function, a test-runner flag that no longer exists, a config file shape from two major versions ago. **The moment you are even slightly unsure of an API, a version, a flag, a config format, or an idiom, stop and confirm it with a `researcher` subagent before you write it into the project.** And if a check corrects what you were about to scaffold, say so plainly.

### Phase 1 — Kind, then probe (never skip either)

**1a. The kind — `ask_user_question`, first thing.** One decision shapes everything downstream: probe depth, stage content, realism, and what "done" means. Four kinds, fully specified in **`references/kinds.md`**:

- **`real-life`** — a plausible product with real business logic where the subject bites: tickets, seeded bugs, feature work that only works if he understands the subject.
- **`build-it`** — implement the technology itself (a cache, a DB, a queue, an interpreter, a protocol server), or one mechanism of it with the rest pre-built.
- **`read-debug`** — an existing real codebase, working but wrong: reproduce, diagnose, fix. Deliverable is diagnosis **plus** the fix.
- **`mix`** — a real-life project with 1–2 stages where he builds the machinery the app needs.

Ask it as the goal ("what do you want to be able to do afterwards?"), not as a taxonomy question. Follow-ups live here too: `build-it` → whole thing or one mechanism; `mix` → the blend is proposed by you in the plan and confirmed by him. If his opening message already states the goal, infer the kind and confirm it in one question instead of asking blindly. **One kind per project** — wanting another kind later means a new project.

You cannot scope a project without knowing where his edge sits, and you cannot pick one without knowing what he's reaching for. Two unknowns, two tools — keep the boundary clean.

**1b. His current level — use `quiz`. This is a mapping job, not a spot-check.** Locate the *edge* of his understanding along every strand the project will lean on. Until you've found it you cannot scope the stages, so this phase takes as long as it takes.

For a programming subject the strands are typically: the **language semantics** the subject rests on; the **paradigm** (async, OO, functional, types); the **tooling** (test runner, package manager, compiler config — he must be able to run and read the feedback loop unaided); the **domain concepts** of the project; and his **debugging/testing fluency** (can he read a stack trace and a failing assertion? if not, stage 1 must teach that, or the whole project stalls).

**The edge is only located when it's bracketed:** for each strand, something he gets **right** (floor) and something he gets **wrong** or honestly doesn't know (ceiling). One side alone tells you almost nothing.

- **All-correct means the questions were too easy**, not that he's done. A run of right answers is a floor with no ceiling. Escalate sharply — don't advance.
- **Binary-search the edge.** Nails it → jump the difficulty up hard. Misses → you've bracketed from above; narrow in to pin it down.
- **One wrong answer is not "done" and is not a cue to start scaffolding.** Characterize it: careless slip, narrow isolated gap, or systematic misconception? Misconceptions matter most — a confidently-held wrong model will survive the entire project and get *reinforced* by it (he'll write the wrong thing, see it fail, and blame the tests). Probe around it until you know its extent.
- **Map every strand the project rests on**, bounded by relevance: probe what the stages will depend on, skip what they won't.

Do not advance until, for each goal-relevant strand, you can state concretely what he has and where it ends.

**Depth scales with the kind, and the probe may span sessions.** A `real-life` project probes what the stages lean on; a `build-it` project probes prerequisites and internals far more deeply (that is usually the whole subject); `read-debug` probes his debugging fluency hard. Because a deep probe can take more than one session, **write the findings down as you go** into `probe-<project-slug>.md` at the workspace root — per strand: floor, ceiling, misconceptions found, plus the goal, budget, and toolchain check from 1c. It becomes `<project>/docs/PROFILE.md` at scaffold time, and the next session resumes from it instead of re-probing him from zero.

**Programming-specific probes that pay off:** ask him to *predict output* (`typeof null`, what a mutating method returns, what an `await` in a loop does, what a failing assertion prints) — prediction questions expose misconceptions far better than definition questions. And ask what he'd *do* — "what's your first move when this test fails?" — which reveals whether the feedback loop will actually work for him.

#### Writing quiz options — a construction procedure (applies to every `quiz`)

The tool tells you to keep options even. That rule alone is a *post-hoc audit*, and the giveaway is baked in before any check runs. So don't audit afterwards; **build the options so evenness is automatic**:

1. **Every option is a bare claim — no justification anywhere.** The tell is the correct option carrying its own reasoning ("…, because it preserves X") while distractors are bare. Put *zero* "why" in any option; all reasoning goes in `explanation`, revealed after he answers.
2. **Write the correct claim first, then mutate it into each distractor.** Take one specific misconception or easily-confused neighbour and state what someone holding it would claim — same skeleton, same grain size, same register. Parallelism then falls out by construction instead of being policed. For code questions, the ideal distractor is *the output his wrong model actually predicts*.
3. Each distractor must be a real error he might make (so which one he picks is diagnostic), yet unambiguously wrong on the intended reading — tempting, not tricky.
4. **No asymmetric formatting.** Don't bold or backtick the key term in one option only. Either highlight the parallel element in every option, or in none.

If, reading the finished set cold, you can tell which is right without knowing the material, you skipped step 1 or 2 — regenerate, don't patch.

**1c. His goal and constraints — use `ask_user_question`.** No right answer, so never `quiz`. Interrogate until the target is concrete:

- **The subject, precisely.** "Clean architecture" can mean "learn the four layers" or "learn to enforce a dependency rule" or "learn why my current app is a ball of mud" — these produce different projects. Same for "JavaScript data types": coercion? type-driven design? serialization boundaries?
- **Why now** — what he's trying to be able to *do* afterwards. This decides what the final stage must make possible.
- **Stack and version.** Language, runtime, framework, test runner, package manager. Then **check the machine with `bash`** (`node -v`, `python3 -V`, `npm -v`, `git --version`, the test runner): a project he cannot run is worthless, and finding that out in Phase 4 costs the whole session.
- **Time budget.** Total hours, and session length (a 6×40-min ladder and a 3×80-min ladder are different designs).
- **Domain taste.** Ask first whether he has a domain from his own work — the best answer there is, and it makes the realism real. No taste stated → offer 2–3 concrete pitches rather than an open "what do you want". Interest is what carries him through stage 5.
- **Shape preferences.** Within the kind (see `references/project-shapes.md`): greenfield build vs. **legacy refactor** (working-but-messy code he improves — the right shape for clean code, testing, and refactoring subjects). Architecture pre-built vs. built stage by stage. Strict test-first vs. build-then-test. For `build-it`: whole thing vs. one mechanism — and whether the pre-built rest should be readable (studying it teaches) or hidden (it would hand him the answer).
- **How much scaffolding.** More pre-written code = more focus on the subject; less = more ownership. Calibrate to his level from 1b.

### Phase 2 — Plan (think hard here)

Highest-leverage step; don't rush it.

**Scope the subject with a `researcher` subagent first.** Ask it for: the genuine first principles and prerequisite order; **the current idiomatic API and versions** (this is where memory fails most); common misconceptions, gotchas, and the mistakes learners reliably make (these become your traps — the tests that catch a wrong model, and the tier-1 hints); what a real project in this stack looks like today (layout, config files, tooling defaults); and, for `build-it`, the spec or protocol the implementation mirrors plus the fidelity decision (spec-model vs. compatible with the real client). For `real-life` with a real framework stack this step is not optional — the scaffold must boot on the versions actually installed. Cheap, and it makes the whole project accurate.

Then design, in this order:

1. **Pick the domain so the subject is unavoidable** — see `references/kinds.md` for what realism demands per kind and `references/project-shapes.md` for the subject→project mappings and the inverted shapes (sometimes he writes the tests, sometimes he refactors given code, sometimes he debugs).
2. **Cut the stage DAG** — see `references/stage-design.md`. Each stage: one felt problem, one subject facet, one green light. Roots are the unconditional truths of the subject; the sink is the thing he wanted to be able to do. Plan at least one **silent stress stage** (a later stage that makes an earlier design of his visibly fail — never signposted) and end on a **capstone**.
3. **Decide where the subject bites.** For `real-life` / `read-debug` / `mix`: which stages are bug stages and through which mechanism (ticket+repro / failing test / symptom only / hidden defect), which defects are seeded vs. inflicted by his own earlier work, and which stages carry **hidden acceptance suites** (`references/stage-design.md`). For `build-it`: which stages are spec stages.
4. **Decide what is pre-written vs. TODO.** Pre-write the plumbing that isn't the lesson (config, I/O boilerplate, fixtures). TODO the parts that *are* the lesson. Pre-built code that contains the technique he's supposed to invent is a leak — hide it or make it opaque.
5. **Decide how structure is enforced.** When the subject *is* structure (clean architecture, layering, encapsulation), behavior tests aren't enough — enforce it mechanically: import-boundary tests, lint rules, `tsc` with strict flags, type-level assertions, dependency-cruiser-style checks. A rule nobody enforces is a suggestion, and suggestions don't teach.
6. **Stress-test the roots.** For every stage you treat as foundational: is it genuinely something he holds (Phase 1b), or a disguised mid-level fact that derives from something simpler? A wrong root corrupts every stage hung off it — and in a project, a wrong root means he's stuck at stage 1 with no idea why.

**Then present the plan in chat and wait.** Four parts:

1. **The pitch, in prose.** What the project is, the kind, the domain, why *this* project forces *this* subject, and how the ladder matches where his edge sits. A few freeform sentences — sell it, he has to want to build it.
2. **The stage DAG.** A small ```mermaid``` graph: stages as nodes, dependencies as edges, prerequisite knowledge at the roots. Few nodes, short labels — a map, not the territory. (Use the `visualize` skill when the architecture itself deserves a picture; in the generated project, embed mermaid as a fenced code block in the README so it renders on any git host.)
3. **The stage table.** `#` · slug · what breaks / what he builds · subject facet exercised · est. minutes · verify command.
4. **The shape of the run.** For `mix`, the blend (which stages are machinery stages). Which stages carry hidden acceptance suites. The fidelity decision for `build-it`. What he must be able to do at the capstone. — and *nothing* about which later stages will break his earlier design: that surprise is load-bearing.

**Stop and wait for his go-ahead.** A wrong domain or wrong scope is cheap to fix now and expensive after 40 files exist. Do not scaffold until he okays the plan.

### Phase 3 — Scaffold

Build the project exactly as specified in **`references/project-anatomy.md`** (files, manifest, stub style, test layout, README, `AGENTS.md`) and **`references/stage-design.md`** (how each brief and hint ladder is written). Read both before writing the first file.

Order of work, because it keeps the project honest:

1. Skeleton + config + fixtures → **it must run** (and fail loudly at the seams). The real stack per `kinds.md`: real framework, real persistence where the subject touches it, real commands.
2. Tests, stage by stage → each fails now, for a stub reason. Hidden acceptance suites where planned → they fail now too, for a behavioral reason.
3. Briefs + hint ladders (four tiers) + definition-of-done quizzes — one per stage — plus tickets for `real-life` / `read-debug` bug stages.
4. `PRACTICE.json` manifest (with `kind`, per-stage `quiz` and `hidden`), README, `AGENTS.md`, `PROGRESS.md`, and `docs/PROFILE.md` from the probe notes.
5. `git init` + one commit ("stage 0") so he can `git diff` his own work and `git checkout .` to retry a stage from clean.

**The code you write is the standard you're teaching.** He will imitate every line of your skeleton — naming, file size, comment density, error handling. For a clean-code subject especially, the skeleton must be *exemplary*: if your scaffolding has a 90-line function and magic numbers, that's the lesson he'll actually absorb.

Scaffold at `<cwd>/<project-slug>/` (a subdirectory — it keeps generated code separate from session logs and allows more than one project per directory).

### Phase 4 — Verify (run it; don't assume it)

1. **Install and run.** Deps install; the entrypoint starts; the test runner collects.
2. **Every stage test fails for the right reason.** Read the actual output: each failure must be an unimplemented stub (`TODO(stage-N): …`) or a genuinely-missing behavior — **never** a syntax error, unresolved import, missing fixture, or misconfigured runner. Those are your bugs, and they will read to him as "the project is broken", which ends the session. Every hidden suite must fail for a *behavioral* reason too (the defect is present, the behavior is missing) — and it must pass on an honest solution.
3. **No leaks.** Grep the project for solution code hiding in comments, docs, commit messages, or a stray `solution.ts`. Check that `hidden-tests/` never names where a fix goes, and that no quiz answer or explanation is reachable from anywhere he'd naturally read. Anything that solves a TODO for him gets deleted or rewritten as a tier-4 hint on different data.
4. **Prove it's solvable — `solution-checker` subagent.** It copies the project to a scratch directory, solves every stage **using only the briefs and hints** (no extra context from you — and with `hidden-tests/` moved out of the tree while it solves, so the hidden suites become a clean acceptance check afterwards), runs the tests, and reports: requirements that are ambiguous or insufficient, tests that pass without doing the work, tests that over-constrain the implementation, hints that leak the answer, briefs that demotivate (technique stated before problem), quiz questions that are wrong or unanswerable, and a realistic time estimate per stage. Fix what it finds and re-run until it reports a clean solve. **Then delete the scratch directory** — a solved copy must never survive next to the project.
5. **Re-verify after fixes.** Any change to tests or stubs means re-running step 2.

### Phase 5 — Hand over (short, then stop)

An orientation, not a lesson. In chat:

- What the project is and where it lives, in one or two lines.
- **The loop:** read the stage brief → write the code → run its verify command (or `/check`) → green means the stage's definition-of-done quiz, then next. On stages with a hidden acceptance suite, `/grade` before calling it done. Stuck → `/hint <stage>` for tier 1, and up from there only after another attempt.
- **Where to start:** stage 1, this file, this command. Give him the exact first action.
- **Ground rules:** don't read ahead; don't read `docs/hints/` directly (use the ladder); never open `hidden-tests/`; ask me anything — I'll explain, question, and review, but I won't write your implementation.
- Then **stop talking.** Let him go build. Resistance to the blank file is part of the exercise; so is the first green test.

If he wants a readable record of the session, mirror it with `/md-log <file>`.

### Phase 6 — Coach (when he comes back)

He'll return stuck, done, or doubtful. Your job then is a coach's, not an author's — the full protocol is in **`references/coaching.md`**. The spine of it:

- **Objective state first.** Run `progress` (or `/check`) before opining on whether something works. His test suite outranks your reading of his code.
- **Diagnose before helping.** Ask what he tried, what he expected, what happened. Use `quiz` when the diagnosis has a right answer — a misconception found here is worth more than the bug.
- **Graduated help only.** `hint` tool, tier 1 → 2 → 3 → 4, one tier per call, relayed **verbatim**, never extended into code. After a hint, send him back to the editor.
- **Green means quiz, then review.** Run the stage's definition-of-done quiz when its verify is green — it's blocking. Where a hidden suite exists, `grade` it too. Full protocol in `references/coaching.md`.
- **Still stuck after tier 4? Narrow, don't solve.** Isolate the failing case, ask a sharper question, or work a *separate* toy example together and let him port it. Porting is still generation.
- **Review as teaching.** When a stage is green, review the code with questions ("what happens when this list is empty?", "who owns this state?") rather than rewriting it. Let him make the improvement; then it's his.
- **Recalibrate.** A stage that always needs the top hint tier, or that he finishes in four minutes, was mis-scoped — say so, and offer to re-cut the remaining ladder. The hint log tells you this.

## Formatting

Session prose is mirrored by `md-log` into a markdown file he reads rendered (e.g. in Obsidian), so write normal markdown and use LaTeX for math when the subject involves it (`$f(x)$`, not `f(x)`). In **generated project files**, prefer what a git host renders: fenced ```mermaid``` blocks over PNG embeds, plain code fences, and relative links between docs.
