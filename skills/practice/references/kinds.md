# Kinds — the first decision: what *kind* of practice project

Before the probe, before the subject is pinned down: ask which **kind**. The probe depth, the stage content, and what "done" means all depend on it. It is a preference with no right answer, so use `ask_user_question` — one question, phrased as the goal ("what do you want to be able to do afterwards?"). If his opening message already states the goal, infer the kind and confirm it in one question instead of asking blindly.

Names are placeholders; keep the wording simple.

| kind | one line | what he gets out of it |
|---|---|---|
| `real-life` | a plausible product with real business logic where the subject bites | how the subject plays out at work — spotting the bug, making the change, understanding why it happened |
| `build-it` | implement the technology itself | how the thing works inside — because he built the inside |
| `read-debug` | an existing real codebase, working but wrong | reproducing, diagnosing and fixing defects he didn't write |
| `mix` | a real-life project with 1–2 stages where he builds the machinery it needs | both views: the application, and one mechanism from the inside |

**One kind per project.** If he wants another kind afterwards, that is a new project — say so, and offer to scaffold it in a fresh session. Don't grow one project into two kinds.

Anatomy is identical across kinds: briefs, four-tier hint ladders, per-stage `verify`, a definition-of-done quiz, `PRACTICE.json`, hidden acceptance suites, the coaching contract. **Only the content differs.**

---

## `real-life` — the subject bites in a business codebase

He works a codebase like the one he'd meet at a job: read a ticket, find the cause, write the fix, defend the change in review — plus feature stages that only work if he genuinely understands the subject.

Three non-negotiables of realism:

1. **A real business domain** — rules a product owner would recognize and could argue about (pricing rules, refund policies, seat limits, SLA windows, inventory reservations). Not "foo/bar" data with a thin story.
2. **A real stack** — real framework, real tooling, real layout, real commands. Nobody ships a backend in pure Java with no framework; don't scaffold one. He should recognize the shape of the project from work.
3. **Real failure modes** — seeded defects, edge-case data, symptom reports, regressions. The subject is what makes the bug, and understanding the subject is the shortest path to the real fix.

**Stack realism rules** (they bend the older "keep it tiny" instinct, not determinism):

- Real frameworks and real dependencies, installed **once at setup** (`npm install`, `pip install`, `go mod download`). Setup may touch the network; everything after that runs offline.
- **Real persistence where the subject touches it**: SQLite, a real file format, a real message queue's local mode. An in-memory fake is only acceptable when persistence is not part of the lesson.
- **Local services (Docker: Postgres, Redis, …) are allowed when the subject genuinely needs them to be real** — learning to fix a connection-pool bug needs a real pool. Otherwise don't add them. Never remote services, never API keys, never accounts.
- Still **deterministic**: seeded fixtures, a fake clock where time matters, no unseeded randomness in anything a test asserts.
- `verify` runs in seconds where possible; **up to ~30 s is fine when a server must boot**. Never minutes.

**Domain:** ask him (a domain from his work is the best answer). No taste stated → pick from the solid menu: invoicing/pricing, booking/reservations, inventory, log/observability, ticketing, subscriptions. Nothing is banned.

**Bugs** arrive through the four mechanisms in `stage-design.md` (ticket+repro, failing test, symptom only, hidden defect) — early stages and beginners get mechanisms 1–2, challenge stages get 3–4. Both origins are in play: bugs **seeded** in shipped code and bugs he **inflicted on himself** in an earlier stage.

**Bypasses are never blocked.** If he finds a fix that works without touching the subject, the tests don't punish him — the **review** flags it and explains the tradeoffs (see `coaching.md`). Real work is full of workarounds; the lesson is recognizing them.

**Capstone:** the app does the thing end to end — he runs it and shows it working.

Briefs open with the business consequence or the ticket; "Why this stage exists" is a poke he can perform against the running system.

---

## `build-it` — implement the technology itself

He builds the machinery: a cache, a database, a queue, an interpreter, a protocol server, a scheduler, an event loop. Deep, technical, from the inside.

**From scratch by default.** One exception — his own request to learn a *specific part* (ask as a follow-up in the kind picker: **whole thing / one mechanism**). Then everything else ships **pre-built**, and how it ships is decided by one rule:

> If the pre-built code contains the technique he is supposed to invent, it is a **leak** — hide it or make it opaque (compiled dependency, sealed module, distant service). If studying it *teaches* — it shows how the surrounding pieces connect, which is architecture rather than answer — make it **readable** and say so in `ARCHITECTURE.md`.

**Fidelity is a per-subject decision, made in planning and stated in the plan:**

- **spec-model** — the implementation mirrors how the real thing is specified or modeled (js-scope-engine mirrors ECMA-262: the architecture *is* the spec's architecture; tests assert semantic facts).
- **compatible** — the real client or tool talks to *his* implementation (`redis-cli` against his server, a real HTTP client against his framework, the real wire format). This is the strongest acceptance suite there is, and it usually *is* the hidden acceptance suite.

**Probe much deeper** than other kinds — prerequisites, internals, the spec — and expect it to span sessions (see SKILL.md, Phase 1b).

**Stages: one mechanism each** (persistence, eviction, concurrency, protocol, recovery, per-iteration bindings), and deeper stages are normal (45–90 min). The naive design must fail before the mechanism arrives — that is the same "problem before technique" rule, at a lower level.

**Capstone:** the real client runs against his thing, or the demo does the whole job — proof it is not a toy.

Briefs open with the requirement the naive design cannot satisfy.

---

## `read-debug` — reproduce, diagnose, fix

He joins a project mid-fire. The code works — mostly — and something is wrong in a way only understanding the subject explains.

**Deliverable is diagnosis + fix** (both, always): the code change *and* the cause explained in his own words. A fix without a correct diagnosis is a stage half-done.

- Shape: a plausible-but-wrong codebase (a competent person in a hurry — never a cartoon villain) with characterization tests pinning current behavior. `ARCHITECTURE.md` says the mess and the defects are deliberate.
- **Grading:** the fix is graded by **hidden acceptance suites** (the reported case plus regression cases he'd never think to check); the diagnosis is graded by the **definition-of-done quiz** and by the coach in review. That split is the whole point: anyone can make one test pass.
- Ladder: short by default (2–5 stages), one defect class per stage, escalating mechanisms — tickets and failing tests first, symptoms-only and hidden defects as the challenge stages.
- Briefs open with the repro or the symptom; the brief never names the cause.

---

## `mix` — a real-life project with machinery stages

A `real-life` project whose ladder contains **1–2 stages where he builds a piece of machinery the app needs** — stage 4: the booking service needs a rate limiter with a leaky bucket; stage 6: the report generator needs a small template evaluator. Those stages are `build-it` stages inside a real app: same realism rules, deeper technical content, motivated by an application requirement rather than by the syllabus.

- The machinery must be **genuinely needed** by a requirement of the app. If it can be deleted and the app still makes sense, it is two projects glued together — cut it.
- The blend is **proposed in the plan and confirmed by him**: "N application stages and M machinery stages", with the machinery stages named.
- Everything else follows `real-life`.

---

## Stage budgets — by kind and complexity

There is no universal ceiling; there is his time budget and the subject's complexity.

| kind | typical stages | typical stage | typical total |
|---|---|---|---|
| `real-life` | 4–8 | 30–60 min | 2–6 h |
| `build-it` | 4–8 | 45–90 min | 4–10 h |
| `read-debug` | 2–5 | 20–60 min | 1.5–4 h |
| `mix` | real-life + 1–2 machinery | mixed | 3–8 h |

Two rules that outrank the table:

- **The ladder must fit his stated budget, with margin for being stuck.** If it can't, cut the subject into **two projects** (foundation + advanced) and say so in the plan — that is a better outcome than one abandoned ladder. An unfinished project teaches "I don't finish things".
- **Stage 1 is always the smallest and ends fastest.** The first green test is what buys his trust in the loop.
