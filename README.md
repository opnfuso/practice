# practice

A pi configuration that teaches programming **by building**, not by reading.

It is the sibling of [`learn`](https://github.com/amosblomqvist/learn): same probing, same planning, same insistence on understanding over memorized facts — but where `learn` produces a lesson, this produces a **practice project**: a real-but-incomplete codebase the learner finishes himself, with staged TODOs, a failing test per stage as the feedback loop, motivated briefs, a four-tier hint ladder, and a blocking definition-of-done quiz per stage.

The premise is the generation effect: reading a correct solution produces *recognition*, which evaporates at the first blank editor; writing the code produces *ability*. So the hardest rule in this repo is that **the agent never writes the code that carries the lesson.**

## What a session looks like

1. **Kind, then probe.** `ask_user_question` opens with the one decision that shapes everything: what *kind* of project — **`real-life`** (a real business codebase where the subject bites: tickets, seeded bugs, features that only work if you understand it), **`build-it`** (implement the technology itself — a cache, a DB, an interpreter), **`read-debug`** (reproduce, diagnose and fix defects in an existing codebase), or a **`mix`** (a real-life app with stages where he builds the machinery it needs). Then graded `quiz` questions binary-search the edge of what he already knows, along every strand the project will lean on (language semantics, paradigm, tooling, domain, debugging fluency) — deeper for `build-it`, able to span sessions, with the level profile written to disk as it goes. `ask_user_question` pins the rest: exact subject, stack and version, hours, domain taste, shape (greenfield build / legacy refactor / test-writing / extension). The toolchain is checked on the machine before anything is designed.
2. **Plan** — a `researcher` subagent maps the subject's real first principles, the *current* idiomatic APIs and versions, and the misconceptions that become the traps. Then the pitch, the stage DAG, the stage table, and the shape of the run (the `mix` blend, which stages carry hidden acceptance suites, the `build-it` fidelity decision) are presented — and it waits for the go-ahead. One thing the plan never says: which later stages will break the design he's about to write.
3. **Scaffold** — a runnable skeleton (a real stack: real framework, real persistence where the subject touches it), per-stage tests that fail now, stubs that fail loudly and point at their brief, one brief per stage (problem → requirements → constraints → verify → definition of done), a four-tier hint ladder and a blocking definition-of-done quiz per stage, hidden acceptance suites on the challenge stages, tickets for the bug stages, `PRACTICE.json` (carrying its `kind`), `README.md`, `AGENTS.md`, `PROGRESS.md`, `docs/PROFILE.md`, and a `stage 0` git commit so he can diff his own work.
4. **Verify** — it installs, it runs, every test fails for a *stub* reason and not a syntax error, no answers leak anywhere in the tree (including `hidden-tests/` and `docs/quiz/`), and a `solution-checker` subagent proves from a scratch copy that the briefs alone are sufficient — solving every stage itself with the hidden suites moved out of the way, auditing for cheat-able and over-constrained tests, then running the hidden suites as acceptance and deleting the scratch.
5. **Hand over** — a short orientation (the loop — including `/grade` and the definition-of-done quiz, where to start, the ground rules), then it stops talking and lets him build.
6. **Coach** — when he comes back: objective state via `progress`, diagnosis before help, hints one tier at a time (four tiers), the stage's definition-of-done quiz when its verify goes green (blocking), `grade` for hidden suites, code review as questions rather than rewrites (bypasses are flagged with tradeoffs, never blocked), and recalibration of the remaining ladder from the hint log.

## What's in it

- `skills/practice/` — the philosophy and the process, plus:
  - `references/kinds.md` — the four kinds of project (`real-life` / `build-it` / `read-debug` / `mix`): what each demands of realism, fidelity, deliverables, and stage budgets
  - `references/project-anatomy.md` — the exact shape of a generated project (files, manifest, stub style, tests, hidden suites, quizzes, README, `AGENTS.md`)
  - `references/stage-design.md` — cutting the ladder, bug stages, silent stress, writing a brief, the definition-of-done quiz, building a four-tier hint ladder
  - `references/project-shapes.md` — subject → project mappings, the four shapes, domain rules, scale, per-language `verify` notes
  - `references/coaching.md` — the post-handover protocol
- `skills/visualize/` — a correct, minimal diagram when an idea is clearer as a picture (in generated projects: fenced ```mermaid``` blocks, not PNGs)
- `extensions/practice.ts` — `hint` (graduated, logged, anti-spoiler help), `progress` (per-stage verify runs) and `grade` (hidden acceptance suites) tools, plus `/hint`, `/check` and `/grade`
- `extensions/quiz.ts` — graded questions with instant feedback (✓/✗, correct answer, explanation)
- `extensions/ask-user-question.ts` — questions through a UI popup, for the ones with no right answer
- `extensions/md-log.ts` — mirror the session to a markdown file
- `extensions/visual-tools/` — tools for the visualization subagents
- `agents/` — `researcher`, `solution-checker` (new), `svg-maker`, `mermaid-maker`
- `APPEND_SYSTEM.md` — the coach contract, applied to every session in this workspace whether or not the skill is loaded

## Install

This repo **is** a `.pi` directory. Create a workspace directory for the subject, then:

```bash
mkdir -p ~/practice/javascript-types && cd ~/practice/javascript-types
git clone <this repo> .pi
pi
```

Then tell it what you want to learn by building, e.g. *"I want to learn clean architecture by building something"*, or force the skill with `/skill:practice`. The project gets scaffolded into a subdirectory of the workspace, so one workspace can hold several projects (and the session logs stay out of the generated code).

`/md-log <file>` mirrors the session into markdown if you want a readable record; `/hint <stage> [tier]`, `/check [stage]` and `/grade [stage]` work once a project exists.

## Requirements

- [pi](https://github.com/earendil-works/pi)
- A subagent implementation, so the system can spawn the researcher, the solution checker, and the visual makers. Recommended: [pi-interactive-subagents](https://github.com/amosblomqvist/pi-interactive-subagents) (tmux only). Any other implementation works, but expect to adapt the agent definitions — `agents/researcher.md` lists `safe_bash` and `agents/solution-checker.md` lists `bash`, both of which are implementation-specific names. **The solution checker genuinely needs to install dependencies and run tests**, so a read-only sandbox won't do; if you can't give it a real shell, run its procedure yourself in the main session instead.
- `ask-user-question` — use the copy bundled here. If your setup already has one, use **this** one in its place: popups from different extensions serialize through a shared UI lock, which only works when it's the same implementation.
- For the visual makers: `npm install` inside `extensions/visual-tools/`, an installed Chrome (Mermaid CLI), and `rsvg-convert` or ImageMagick (SVG).

## Notes

Import paths in the copied extensions target current pi (`@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`, `typebox`). If you're on an older build, they were `@mariozechner/*` and `@sinclair/typebox`.

You can run the system without subagents: the main session does the probing, planning, and scaffolding. You lose the research verification (accuracy), the independent solvability proof (the most valuable quality gate here), and generated visuals. If you skip the solution checker, at minimum do its baseline pass yourself — install, run, and read *why* each test fails before handing the project over.

The skill is written for one learner. Edit `skills/practice/SKILL.md` and `APPEND_SYSTEM.md` to fit how you learn best — in particular the stage count, the hint-ladder discipline, and how firmly the coach refuses to write your code.
