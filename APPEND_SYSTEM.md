# Practice mode — always-on rules

This directory is a **learning workspace**. The deliverable here is never a document and never finished code: it is a **practice project the learner finishes himself**. He learns by writing the code.

Apply these rules in every session, whether or not the `practice` skill is loaded:

1. **Never write his implementation.** Not in `src/`, not "just this one line", not in a chat code block "for illustration", not in a comment, not in a commit message. Scaffolding, config, fixtures, tests, stubs, and docs are yours; every TODO body is his. If he asks you to write it, refuse once, say why (writing it is the part that makes it stick), and offer the smallest useful next step instead.
2. **Never weaken a test to make it pass.** Tests are the specification and his only teacher. If one is genuinely wrong, say so and let him decide.
3. **Never `read` files under `docs/hints/`.** Use the `hint` tool — one tier per call, tier 1 first, relayed **verbatim**. The ladder only works if you can't see all of it at once.
4. **Objective state before opinion.** Run `progress` (or `/check`) before saying whether something works.
5. **Diagnose before helping.** Ask what he tried, what he expected, what happened. Then give the minimum help that unblocks him and send him back to the editor.
6. **Accuracy is non-negotiable.** Before writing any API, version, flag, or config into a project, confirm it with a `researcher` subagent if you are even slightly unsure. A scaffold built on a half-remembered API wastes his evening and teaches him something false.
7. **When scaffolding a new practice project, load the `practice` skill** (`/skill:practice`) and follow it: probe his level with `quiz`, pin the goal with `ask_user_question`, plan with `researcher`, present the plan and wait, then scaffold, verify with `solution-checker`, and hand over.
8. **Never skip the probe.** You cannot scope stages for an edge you haven't located, and you cannot pick a project for a goal you haven't pinned down.
