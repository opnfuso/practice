# Project shapes — picking the project so the subject is unavoidable

The **kind** of project (`real-life` / `build-it` / `read-debug` / `mix`) is chosen first — that decision lives in `kinds.md`. Within a kind, the remaining design question is the shape: how the subject becomes the only way through.

The single design decision that determines whether the project teaches anything: **the subject must be load-bearing**. Test every candidate: *can he complete this stage without ever exercising the subject?* If yes, choose a different project or a different stage.

## The four shapes

Most subjects fit one of these. Pick by what the lesson *is*, not by variety.

**1. Greenfield build (default).** Empty seams, he fills them, tests go green in order. Best when the subject is a capability he doesn't have yet: language semantics, a paradigm, an API, a data structure, async, types.
- Ladder shape: each stage adds one capability the previous one couldn't express.

**2. Legacy refactor.** You ship *working but bad* code (long functions, duplicated logic, hidden coupling, no tests). He improves it under a safety net he builds first. Best when the subject is judgment rather than mechanics: clean code, naming, coupling/cohesion, refactoring, architecture, technical debt.
- Ladder shape: stage 1 is always **characterization tests** (pin current behavior — this is itself a lesson: you cannot safely change what you cannot observe). Later stages each remove one specific smell, with the tests proving nothing broke.
- The bad code must be *plausibly* bad — written by a competent person in a hurry, not by a cartoon villain. And `docs/ARCHITECTURE.md` must say the mess is deliberate, or he'll distrust the whole skeleton.
- For architecture subjects: the enforcement (import-boundary tests, lint rules) arrives as a stage, so he feels the pain of the rule *not* existing before he adds it.

**3. Test-writing / bug hunt.** The implementation is given (buggy or untested); he writes the tests, or finds and fixes the defects. Best when the subject *is* testing: test design, edge cases, mocking/fakes, TDD, property-based testing, debugging.
- Ladder shape: each stage hands him a module with a known defect class; his tests must catch it. A hidden "defect report" (revealed per stage in the brief's *Why this stage exists*) keeps it honest.
- Also the right shape for "read other people's code" skills, which greenfield never teaches.

**4. Extension / integration.** A small working system, and each stage plugs a new capability into it (a new adapter, a new command, a new event handler). Best when the subject is a pattern, a framework, a plugin architecture, or extension points: strategy/observer/command, DI, event-driven design, hexagonal adapters.
- Ladder shape: stage 1 = use the extension point that exists; stage 2 = the requirement the existing point can't express; stage 3 = he designs the extension point himself. The last step is the click.

Shapes combine: a legacy refactor inside a greenfield project (stage 5: "the module you wrote in stage 2 has grown — restructure it") is often the most realistic and the most instructive.

## Subject → project mappings

Starting points, not a menu to copy blindly — always re-derive from *his* goal (Phase 1c) and edge (Phase 1b).

| Subject | Project that forces it | Shape |
|---|---|---|
| JS/TS data types, coercion, `typeof`, null vs undefined | A CSV/TSV parser with a typed schema: every value crosses a string→typed boundary, empty cells, `NaN`, `-0`, `BigInt` ids, `Date` parsing, and a serializer that must round-trip | Greenfield |
| Type-driven design, generics, unions, narrowing | A typed event emitter or a type-safe query builder where wrong code must **fail to compile** (type-level tests in `verify`) | Greenfield |
| Clean code (naming, functions, cohesion) | A working-but-ugly module doing something real (invoice totals, log parsing, a pricing rule set) + characterization tests, then six smells to remove | Legacy refactor |
| Clean architecture / hexagonal / dependency rule | A small app (URL shortener, expense tracker, weather CLI) where stages add layers and an **import-boundary test** fails the build on violation | Greenfield + enforcement |
| SOLID, design patterns | A reporting/export tool: one stage per pattern, each introduced by a requirement the previous design cannot satisfy (new export format, new rule, swapped dependency) | Extension |
| Async/await, promises, concurrency, race conditions | A rate-limited scheduler or a parallel fetch pipeline with a **fake clock** and injected transport: ordering, cancellation, timeout, retry-with-backoff, `allSettled` vs `all` | Greenfield |
| Testing (unit, mocks/fakes, TDD) | A module with seeded defects he must catch; then a TDD stage where the brief gives the spec and he writes tests *before* code | Test-writing |
| Refactoring / working with legacy | A 400-line function from a plausible domain, pinned by characterization tests, then a sequence of mechanical extractions | Legacy refactor |
| Recursion, data structures, algorithms | A file-tree/AST/comment-thread tool where the recursive solution is dramatically simpler than the iterative one; then a stage that breaks the naive version (deep nesting → stack overflow) forcing memoization/generators | Greenfield |
| State management, immutability | An undo/redo editor or a shopping-cart reducer: history requires structural sharing, and a mutation bug breaks undo visibly | Greenfield |
| Error handling, resilience | A CLI client over a flaky fake transport: retry, backoff, timeout, circuit breaker, typed errors, and error *boundaries* | Greenfield |
| SQL / databases | A query-builder or repository layer over SQLite with fixtures; stages: joins, indexes proven by `EXPLAIN`, transactions proven by an interrupted write, N+1 detected by a query counter | Greenfield |
| Concurrency (goroutines, threads, actors) | A worker pool / fan-out pipeline with a deterministic scheduler or injected channels; stages expose data races (run with the race detector in `verify`) | Greenfield |
| HTTP/APIs, REST semantics | A small service with contract tests: status codes, idempotency, pagination, versioning — verified by HTTP-level tests against a local server | Greenfield |
| A framework (React, FastAPI, Spring…) | A tiny but real app in that framework where each stage is one framework concept made necessary by a requirement (state → props → effects → data fetching → routing) | Extension |
| Security basics (input validation, injection, authz) | A deliberately vulnerable app + a test suite that *attacks* it; each stage closes one hole while keeping the feature working | Legacy refactor + test-writing |
| Performance | A working implementation with a benchmark harness in `verify`; stages are measurable targets (p95, allocations) and profiling tasks | Extension |
| Git / build tooling / CI | A repo with a broken build pipeline he must fix; `verify` runs the pipeline locally | Legacy refactor |
| How a piece of technology works inside (Redis, a DB, a queue, an interpreter, a protocol, an event loop) | Implement it — `kinds.md` decides the fidelity (spec-model vs. compatible with the real client) | Greenfield (`build-it`) |
| Working with code he didn't write (diagnosis, regression hunting, defect triage) | A plausible-but-wrong codebase plus tickets: reproduce, diagnose, fix | Test-writing / bug hunt (`read-debug`) |

## Domain selection

The domain is motivation, so it isn't decoration — but it must stay *cheap*. Rules:

- **He picks it, from concrete pitches.** Ask first whether he has a domain from his own work (the best answer there is); otherwise offer 2–3 in Phase 1c ("a CSV ledger linter, a subtitle-file fixer, a playlist analyzer") rather than an open question; interest is what carries him through stage 5.
- **Data must be trivially fakeable.** Files, text, in-memory collections, SQLite, fixtures. No live services, no accounts, no API keys, no scraping.
- **The domain must not itself be a new subject.** If he has to learn finance *and* clean architecture, he'll learn neither. Prefer domains he already has a mental model of: files, playlists, todo items, shopping carts, logs, CSV exports, subtitles, game scores, recipes.
- **The domain must generate edge cases for free.** Empty inputs, duplicates, unicode, missing fields, huge files, out-of-order events. Edge cases are where the misconception-catching tests come from — a domain with no natural edge cases can't teach semantics.
- **Real-shaped surface.** A CLI he can run, or a tiny server, or a library with a public entrypoint and a demo script. Something he can *show*. "It runs and does a thing" is a large part of why the project feels real.

## Scale

Stage count and stage size follow the **kind** and the subject's complexity — the budget table is in `kinds.md` (defaults: `real-life` 4–8 × 30–60 min, `build-it` 4–8 × 45–90 min, `read-debug` 2–5 × 20–60 min, `mix` = real-life plus 1–2 machinery stages). Files he touches scales with it: roughly one source file per stage, plus tests.

The real constraint is **his time budget**: the whole ladder must fit inside it, with margin for being stuck. When it can't, cut the subject into **two projects** (a foundation project and an advanced one) and say so in the plan — that's a better outcome than one abandoned ladder. Whatever the budget, an unfinished tail teaches "I don't finish things": never plan more than he can actually finish.

Pre-written scaffolding scales inversely with his level (Phase 1b): a beginner gets signatures, types, fixtures, and one stub per stage; an experienced learner gets interfaces and a lot of blank space. Never so little scaffolding that he's fighting config instead of the subject — config isn't the lesson unless config *is* the subject.

## Language notes (keep `verify` fast and per-stage)

- **Node/TS:** vitest or node's built-in test runner; per-stage `npm test -- stageNN`; `tsx`/`ts-node` or a build step that's already wired. Strict `tsconfig` if types are part of the subject.
- **Python:** pytest with per-stage files and `pytest -q tests/test_stage01.py`; `ruff`/`mypy` in `verify` when structure or types are the subject.
- **Go:** `go test ./... -run Stage01`; `-race` in `verify` for concurrency stages; `go vet`.
- **JVM:** JUnit `@Tag("stage1")` with `./gradlew test --tests '*Stage1*'`; ArchUnit for boundary enforcement.
- **Rust:** `cargo test stage01`; `clippy -D warnings` in `verify` when idiom is the subject.

Whatever the language: `verify` runs in **seconds**, needs no network, and exits non-zero when the stage isn't done. Those three properties are what make the test suite a usable teacher.
