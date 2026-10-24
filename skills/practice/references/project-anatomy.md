# Project anatomy — the exact shape of a generated practice project

Everything here is a *requirement*, not a suggestion: the tools (`hint`, `progress`), the verify loop, and the coaching protocol all assume this shape. Adapt names and commands to the language; do not drop pieces.

```
<cwd>/<project-slug>/
├── README.md                     # the pitch + setup + the loop + ground rules
├── AGENTS.md                     # the coach contract (loaded automatically by pi/other agents)
├── PROGRESS.md                   # the stage checklist he ticks off
├── PRACTICE.json                 # the manifest — read by the hint/progress tools
├── .gitignore
├── <manifest/config files>       # package.json, pyproject.toml, tsconfig.json, Makefile…
├── docs/
│   ├── ARCHITECTURE.md           # what's pre-built, what's his, where the seams are (+ mermaid)
│   ├── PROFILE.md                # his level map from the probe — what he holds, where his edge is
│   ├── stages/
│   │   ├── stage-01-<slug>.md    # one brief per stage — see stage-design.md
│   │   └── …
│   ├── hints/
│   │   ├── stage-01.md           # the four-tier ladder — NEVER referenced from briefs
│   │   └── …
│   ├── quiz/
│   │   ├── stage-01.md           # the definition-of-done quiz — NEVER shown before he answers
│   │   └── …
│   └── tickets/                  # real-life/read-debug: the bug reports, one per bug stage
│       └── TICKET-1042.md
├── hidden-tests/                 # the acceptance suite — he never opens this directory
├── src/                          # skeleton (yours) + TODO stubs (his)
│   └── …
├── tests/                        # one file per stage, runnable individually
│   ├── stage01_<slug>.test.<ext>
│   └── …
└── fixtures/                     # deterministic sample data (yours)
```

Rules that apply to the whole tree:

- **Nothing outside `src/` (or the language's source dir) implements a lesson.** Tests, fixtures, config, and docs are yours. If a solution exists anywhere in the tree, the project is broken.
- **Every file he must touch is marked** with a stage-tagged TODO pointing at its brief.
- **Nothing he must *not* touch is interesting.** Pre-written plumbing should be boring and obviously plumbing.
- **The skeleton is exemplary code** — he will imitate it. Naming, file length, error handling, comments: this is the standard you are silently teaching.
- **`hidden-tests/` describes behavior, never location.** A hidden test's name may say what must hold; it must never name the file, function, or line where the fix goes. The directory is off-limits to him (ground rule, like `docs/hints/`) and the coach never relays its code.
- **`docs/quiz/` answers stay in their files.** The coach reads each file straight into the `quiz` tool; no answer or explanation appears in chat before he has answered.

## `PRACTICE.json` — the manifest

Written last, but it is the contract the tooling depends on. Every stage needs `n`, `slug`, `title`, `brief`, `hints`, and `verify`.

```json
{
  "version": 1,
  "kind": "real-life",
  "subject": "JavaScript data types and coercion at boundaries",
  "project": "ledgerlint",
  "language": "typescript",
  "testCommand": "npm test",
  "createdFromSession": "2026-10-14",
  "stages": [
    {
      "n": 1,
      "slug": "parse-rows",
      "title": "Turn raw CSV text into typed rows",
      "brief": "docs/stages/stage-01-parse-rows.md",
      "hints": "docs/hints/stage-01.md",
      "quiz": "docs/quiz/stage-01.md",
      "verify": "npm test -- stage01",
      "hidden": "npm run hidden -- stage01",
      "minutes": 40
    }
  ]
}
```

- `verify` must run **one stage** and exit non-zero when that stage is unfinished. It is what `progress` executes, so keep it fast (seconds, not minutes) and quiet.
  - Node/vitest: `npm test -- stage01` · jest: `npx jest stage01` · pytest: `pytest -q tests/test_stage01.py` · Go: `go test ./... -run Stage01`
- `kind` is one of `real-life`, `build-it`, `read-debug`, `mix` — see `references/kinds.md`. It is what the coaching and the grading adapt to.
- `quiz` (per stage, required) points at the definition-of-done quiz file — one fenced `json` block with the exact `quiz` tool parameters (see `stage-design.md`).
- `hidden` (per stage, optional) is the stage's **hidden acceptance suite** command — same contract as `verify`, run through the `grade` tool. Only challenge stages (and early stages where a regression lesson needs it) carry one.
- Paths in the manifest are **relative to the project root**.
- Keep `slug` kebab-case and stable — he'll type it into `/hint parse-rows`.

## TODO stubs — fail loudly, point at the brief

A stub must make the stage's absence *impossible to miss*, and must never be silently wrong (a stub returning `[]` can pass a weak test and let him skip the lesson).

```ts
// src/parse.ts
import type { Row } from "./types.ts";

/** Stage 1 — see docs/stages/stage-01-parse-rows.md */
export function parseRows(csv: string): Row[] {
	throw new Error("TODO(stage-1): implement parseRows — see docs/stages/stage-01-parse-rows.md");
}
```

- Message format is exactly `TODO(stage-N): <what's missing> — see <brief path>`. The stage tag makes a red test self-explaining: he immediately knows *whose* gap this is, not that the project is broken.
- Type signatures, interfaces, and exported names are **yours** (they're the contract his code must satisfy, and they keep the stages independent). Bodies are **his**.
- Where the language allows, leave the seam visible in the type system too (an `unimplemented` marker type, a `never` return, a required field he must fill).
- In legacy-refactor projects the seam is different: the code *works* and the task is to improve it under a safety net. Then the pre-existing mess is deliberate — but say so in `docs/ARCHITECTURE.md`, or he'll assume you wrote it badly by accident and lose trust in the skeleton.

## Tests — one stage per file, behavior over implementation

```
tests/stage01_parse-rows.test.ts
tests/stage02_coerce-numbers.test.ts
```

- **Per-stage files** so `verify` can target one, and so `progress` produces a clean ladder.
- **Assert behavior, not internals.** Test what the code must *do* (given this input → this output / this error / this call), not which private helper he used or how he structured the loop — unless structure *is* the subject, in which case enforce it explicitly and say so in the brief.
- **Encode the misconceptions as tests.** The researcher's list of gotchas becomes cases that fail under a wrong model: the empty-string case, the `-0`/`NaN` case, the mutation-surprise case, the timezone case. A test that catches his exact misconception is the highest-value thing in the project — it gives him the counter-evidence at the moment his belief is cheapest to update.
- **Give each test a name that teaches.** `test("empty numeric cell is null, not 0")` states a requirement he can act on; `test("parse works")` does not.
- **Structure/architecture subjects get mechanical enforcement**, not vibes:
  - import-boundary tests (domain must not import from infrastructure) — e.g. `dependency-cruiser`, `eslint-plugin-boundaries`, `import-linter` (Python), `archunit` (JVM);
  - a lint config with the rules the subject is about, run as part of `verify` for that stage;
  - type-level tests (`expectTypeOf`, `tsc --noEmit` on a fixture that must fail to compile);
  - the rule stated in the brief *as a consequence of a problem he already felt*, never as dogma.
- **All stage tests fail at handover** — that's the point, and the visible progress bar. Say so in the README so a wall of red reads as "your work ahead", not "broken project".

## Hidden acceptance tests — `hidden-tests/`

The grader he can't see: extra cases for stages where the visible suite can't tell a real fix from a narrow one — the regression he'd never think to check, the ticket's case *plus* the two neighbors, the behavior the real client would catch. Run them with the `grade` tool (which executes the stage's `hidden` command from the manifest) when the stage's visible verify is green.

- **When a stage carries one:** challenge stages (bug mechanisms 3–4) always; early stages when the lesson is "your fix is narrower than the bug"; `build-it` stages when fidelity is the point (the real client against his implementation).
- **What it may assert:** behavior and consequences — totals, states, return codes, side effects after the second call. It must **never** name where the fix goes: no test name mentioning a file, function, or variable he should edit, no assertion that only one implementation satisfies.
- **It fails at handover for a behavioral reason** (the bug is there, the behavior is missing) — and it passes when the stage is solved honestly. Both directions get verified in Phase 4.
- **Failure output is names and messages**, which is what `grade` returns and all that is ever relayed to him. He fixes it from the message alone first; only if he is blocked does the coach describe the failing scenario in words (see `coaching.md`).
- It lives in the repo like everything else — he *can* open it; the ground rule says he doesn't, the same way he doesn't read ahead. Keep it small and readable-but-useless: its value is being unseen.

## `README.md`

Short, and written to *him*, not to a hypothetical user. Sections, in order:

1. **What this is** — 2–4 sentences: the project, the domain, the subject it teaches, why this shape.
2. **Ground rules** — you write the code; don't read ahead; hints are a ladder (`/hint <stage>`), not a solution dispenser; never open `hidden-tests/`; asking questions is encouraged, asking for the implementation isn't answered.
3. **Setup** — exact commands, verified to work on his machine (Phase 1c checked the toolchain; use those versions).
4. **The loop** — read the brief → write code → run the stage's verify → green means the definition-of-done quiz, then next (on stages with a hidden suite: `/grade` before you call it done). Include `/check`, `/hint`, and `/grade`.
5. **Stage map** — the mermaid DAG plus a table: `#` · title · est. minutes · verify command.
6. **Layout** — one line per top-level directory, pointing at `docs/ARCHITECTURE.md`.
7. **When you're stuck** — the escalation path: re-read the brief's requirements → `/hint N 1` → run the failing test and read the assertion → ask the coach a question → `/hint N 2` → … Explicitly: *the coach will not write your implementation, and that's on purpose.*

## `AGENTS.md` — the coach contract

Any agent session opened in this directory loads this file as context, so it is how you make the coaching rules survive past this session. Required content (adapt wording, keep every rule):

```markdown
# Coaching contract

This is a **practice project**: an intentionally incomplete codebase that I am
finishing myself to learn <subject>. The tests are the teacher.

You are my **coach**, not my implementer.

## Never
- Never write, complete, or patch the implementation of a TODO — not in `src/`,
  not "just this one line", not in a code block "for illustration".
- Never reveal a solution in chat, in a comment, in a commit message, or in a
  new file.
- Never `read` files under `docs/hints/` — use the `hint` tool, one tier at a
  time, starting at tier 1.
- Never weaken, skip, delete, or "fix" a test to make it pass. Tests are the
  specification; if one is genuinely wrong, tell me and let me decide.
- Never `read` or reveal anything in `hidden-tests/` — hidden failures come
  back to me as names and messages only.
- Never reveal a definition-of-done quiz's answer or explanation before I have
  answered it.
- Never edit my source files. Config, fixtures, and docs you may touch, with my ok.

## Always
- Run `progress` before judging whether something works.
- Ask what I tried, what I expected, and what happened — before advising.
- Give the minimum help that unblocks me: a question, then a tier-1 hint, then
  tier 2, then tier 3, then tier 4 (an isomorphic example on different data),
  then narrow the problem with me.
- Run the stage's definition-of-done quiz when its verify is green. It is
  blocking: the stage is done when the code works AND I can say why.
- When a stage is green, review my code with questions, not rewrites.
- If I ask you to just write it: refuse once, explain why (writing it is what
  makes it stick), and offer the smallest useful next step instead.
```

## `docs/ARCHITECTURE.md`

The map of what exists and why: the layers/modules, a mermaid diagram of the dependency structure, what is pre-written vs. his, where the seams are, and which stages introduce which parts. Keep it truthful at handover time — if stages will *add* layers, say so ("stages 5–6 introduce the adapter layer; it does not exist yet").

## `PROGRESS.md`

A checklist he ticks: `- [ ] Stage 1 — parse-rows (40 min) — npm test -- stage01`. One line per stage, verify command inline. Cheap, and the tick-boxes are the motivational counterweight to the wall of red.

## `.gitignore` and the first commit

Language-appropriate ignores, plus `.practice/` (that's where the hint log lives — it's session data, not project code). Then `git init` and one commit, `stage 0: skeleton, tests, briefs`. Two payoffs: `git diff` shows him exactly what he's built (a surprisingly strong motivator), and `git checkout -- src/` lets him retry a stage from clean after a bad turn.
