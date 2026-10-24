/**
 * practice — the runtime half of a generated practice project.
 *
 * A practice project is a real-but-incomplete codebase the learner finishes
 * themselves: a runnable skeleton, staged TODO stubs, a failing test suite per
 * stage, and one brief per stage. Two problems show up once he starts working,
 * and this extension solves both:
 *
 *   1. Help must be GRADUATED. Hints live in `docs/hints/stage-NN.md` in four
 *      tiers (nudge → concept → approach → isomorphic worked example on
 *      different data). A coaching agent that just `read`s that file sees every
 *      tier at once and leaks the whole ladder — usually straight into writing
 *      the solution. So the tiers are reachable ONLY through the `hint` tool,
 *      one tier per call, and every call is logged. The log is the calibration
 *      signal: a stage that always needs the top tier was mis-scoped.
 *
 *   2. Progress must be OBJECTIVE. The test suite is the teacher, so "how am I
 *      doing?" should be answered by running it, not by opinion. `progress`
 *      runs each stage's own verify command from the manifest and returns a
 *      compact green/red ladder with the failing tail — no full test dumps into
 *      context. It also shows each stage's definition-of-done quiz state, which
 *      is blocking: green code plus a wrong "why" is not a finished stage.
 *
 *   3. Acceptance must be able to HIDE. Challenge stages carry a hidden
 *      acceptance suite in `hidden-tests/` — the regression he didn't think to
 *      check, the ticket's two neighbouring cases, what the real client would
 *      catch. `grade` runs it and returns failure names and messages only: he
 *      fixes it from the message first, exactly like a QA report at work. The
 *      suite is a grader, so it is never relayed as code.
 *
 * Both tools read the project manifest, `PRACTICE.json`, which the scaffolding
 * step writes at the project root:
 *
 *   {
 *     "version": 1,
 *     "kind": "real-life",
 *     "subject": "JavaScript data types",
 *     "language": "typescript",
 *     "stages": [
 *       { "n": 1, "slug": "primitives-in", "title": "…",
 *         "brief": "docs/stages/stage-01-primitives-in.md",
 *         "hints": "docs/hints/stage-01.md",
 *         "quiz": "docs/quiz/stage-01.md",
 *         "verify": "npm test -- stage01",
 *         "hidden": "npm run hidden -- stage01" }
 *     ]
 *   }
 *
 * Commands:
 *   /hint [stage] [tier]  — ask for a hint (relayed verbatim by the agent)
 *   /check [stage]        — run the stage verify commands and show the ladder
 *   /grade [stage]        — run the hidden acceptance suite (names + messages)
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { Type } from "typebox";

const MANIFEST = "PRACTICE.json";
const HINT_LOG = path.join(".practice", "hint-log.jsonl");
const QUIZ_LOG = path.join(".practice", "quiz-log.jsonl");
const MAX_TIERS = 4;
const VERIFY_TIMEOUT_MS = 120_000;
const OUTPUT_TAIL_LINES = 25;

interface Stage {
	n: number;
	slug: string;
	title: string;
	brief?: string;
	hints?: string;
	quiz?: string;
	verify?: string;
	hidden?: string;
}

interface Manifest {
	version: number;
	kind?: string;
	subject: string;
	project?: string;
	language?: string;
	testCommand?: string;
	stages: Stage[];
}

interface HintUsage {
	ts: string;
	stage: number;
	slug: string;
	tier: number;
}

type Resolve =
	| { ok: true; dir: string; manifest: Manifest }
	| { ok: false; error: string };

// ── manifest discovery ──────────────────────────────────────────────────────

function readManifest(dir: string): Manifest | null {
	const file = path.join(dir, MANIFEST);
	if (!fs.existsSync(file)) return null;
	try {
		const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
		if (!parsed || !Array.isArray(parsed.stages)) return null;
		return parsed as Manifest;
	} catch {
		return null;
	}
}

/** Look for practice projects in `cwd` and up to two levels of subdirectories. */
function discover(cwd: string): string[] {
	const found: string[] = [];
	const walk = (dir: string, depth: number) => {
		if (depth > 2) return;
		if (readManifest(dir)) found.push(dir);
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const e of entries) {
			if (!e.isDirectory()) continue;
			if (e.name.startsWith(".") || e.name === "node_modules") continue;
			walk(path.join(dir, e.name), depth + 1);
		}
	};
	walk(cwd, 0);
	return found;
}

function resolveProject(cwd: string, explicit: string | undefined): Resolve {
	if (explicit && explicit.trim()) {
		let dir = explicit.trim();
		if (dir.endsWith(MANIFEST)) dir = path.dirname(dir);
		const abs = path.isAbsolute(dir) ? dir : path.resolve(cwd, dir);
		const manifest = readManifest(abs);
		if (!manifest) {
			return { ok: false, error: `No ${MANIFEST} found at ${abs}. Pass the practice project directory (the one containing ${MANIFEST}).` };
		}
		return { ok: true, dir: abs, manifest };
	}

	const candidates = discover(cwd);
	if (candidates.length === 0) {
		return {
			ok: false,
			error: `No practice project found in ${cwd} (looked for ${MANIFEST} up to two levels deep). If the project lives elsewhere, pass it as \`project\`.`,
		};
	}
	if (candidates.length > 1) {
		const list = candidates.map((c) => path.relative(cwd, c) || ".").join(", ");
		return { ok: false, error: `Multiple practice projects found: ${list}. Pass one as \`project\`.` };
	}
	const dir = candidates[0];
	return { ok: true, dir, manifest: readManifest(dir)! };
}

function findStage(manifest: Manifest, wanted: string | number | undefined): Stage | undefined {
	if (wanted === undefined || String(wanted).trim() === "") return undefined;
	const raw = String(wanted).trim().toLowerCase();
	const asNum = Number(raw);
	if (Number.isFinite(asNum)) {
		const byN = manifest.stages.find((s) => s.n === asNum);
		if (byN) return byN;
	}
	return manifest.stages.find((s) => s.slug.toLowerCase() === raw)
		?? manifest.stages.find((s) => s.slug.toLowerCase().includes(raw) || raw.includes(s.slug.toLowerCase()));
}

function stageList(manifest: Manifest): string {
	return manifest.stages
		.map((s) => `  ${s.n}. ${s.slug} — ${s.title}`)
		.join("\n");
}

// ── hint extraction ─────────────────────────────────────────────────────────

const HINT_BLOCK = /<!--\s*hint:\s*(\d+)\s*-->([\s\S]*?)<!--\s*\/hint\s*-->/g;

function extractTiers(file: string): Map<number, string> {
	const tiers = new Map<number, string>();
	const text = fs.readFileSync(file, "utf-8");
	for (const m of text.matchAll(HINT_BLOCK)) {
		const tier = Number(m[1]);
		if (!Number.isFinite(tier)) continue;
		tiers.set(tier, m[2].trim());
	}
	return tiers;
}

function logHint(dir: string, stage: Stage, tier: number): void {
	const file = path.join(dir, HINT_LOG);
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		const entry: HintUsage = { ts: new Date().toISOString(), stage: stage.n, slug: stage.slug, tier };
		fs.appendFileSync(file, JSON.stringify(entry) + "\n", "utf-8");
	} catch {
		// A read-only project shouldn't break hint delivery.
	}
}

function readHintLog(dir: string): HintUsage[] {
	const file = path.join(dir, HINT_LOG);
	if (!fs.existsSync(file)) return [];
	try {
		return fs.readFileSync(file, "utf-8")
			.split("\n")
			.filter((l) => l.trim())
			.map((l) => {
				try { return JSON.parse(l) as HintUsage; } catch { return null; }
			})
			.filter((x): x is HintUsage => x !== null);
	} catch {
		return [];
	}
}

/** "stage 2: t1×1 t2×1 · stage 4: t3×2" — the calibration signal, one line. */
function summarizeUsage(log: HintUsage[]): string {
	if (log.length === 0) return "no hints used yet";
	const byStage = new Map<number, Map<number, number>>();
	for (const e of log) {
		const tiers = byStage.get(e.stage) ?? new Map<number, number>();
		tiers.set(e.tier, (tiers.get(e.tier) ?? 0) + 1);
		byStage.set(e.stage, tiers);
	}
	return Array.from(byStage.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([stage, tiers]) => {
			const parts = Array.from(tiers.entries())
				.sort((a, b) => a[0] - b[0])
				.map(([t, n]) => `t${t}×${n}`)
				.join(" ");
			return `stage ${stage}: ${parts}`;
		})
		.join(" · ");
}

// ── quiz log (definition-of-done quizzes, appended by the coach) ────────────

interface QuizLogEntry {
	ts: string;
	stage: number;
	ok: boolean;
}

function readQuizLog(dir: string): QuizLogEntry[] {
	const file = path.join(dir, QUIZ_LOG);
	if (!fs.existsSync(file)) return [];
	try {
		return fs.readFileSync(file, "utf-8")
			.split("\n")
			.filter((l) => l.trim())
			.map((l) => {
				try { return JSON.parse(l) as QuizLogEntry; } catch { return null; }
			})
			.filter((x): x is QuizLogEntry => x !== null);
	} catch {
		return [];
	}
}

/** Last logged outcome of a stage's DoD quiz: true = answered right, false = still open, undefined = not asked yet. */
function quizOutcome(dir: string, n: number): boolean | undefined {
	const entries = readQuizLog(dir).filter((e) => e.stage === n);
	if (entries.length === 0) return undefined;
	return entries[entries.length - 1].ok;
}

// ── verify runs ─────────────────────────────────────────────────────────────

function runVerify(dir: string, command: string): { code: number | null; tail: string; ms: number } {
	const started = Date.now();
	const res = spawnSync(command, {
		cwd: dir,
		shell: true,
		encoding: "utf-8",
		timeout: VERIFY_TIMEOUT_MS,
		maxBuffer: 8 * 1024 * 1024,
	});
	const ms = Date.now() - started;
	const out = `${res.stdout ?? ""}${res.stderr ?? ""}`.trimEnd();
	const lines = out.split("\n");
	const tail = lines.length > OUTPUT_TAIL_LINES
		? `… (${lines.length - OUTPUT_TAIL_LINES} earlier lines omitted)\n` + lines.slice(-OUTPUT_TAIL_LINES).join("\n")
		: out;
	return { code: res.status, tail, ms };
}

// ── extension ───────────────────────────────────────────────────────────────

export default function practice(pi: ExtensionAPI) {
	pi.registerTool({
		name: "hint",
		label: "hint",
		description:
			"Fetch ONE tier of ONE stage's hints from the learner's practice project. Hints are written in four tiers: 1 = a nudge that redirects attention (no approach), 2 = the concept explained plainly (the missing knowledge, no code), 3 = the approach in words (no code), 4 = an isomorphic worked example on DIFFERENT data (still not his solution). Call with no `stage` to list the project's stages. Relays the tier text verbatim and records the request in the project's hint log, which is how you calibrate whether a stage is mis-scoped. Never `read` docs/hints/* directly — that exposes all four tiers at once and defeats the ladder.",
		promptSnippet:
			"Use `hint` to give the learner graduated help on a practice project stage (tier 1 → 2 → 3 → 4), one tier per call.",
		promptGuidelines: [
			"Always start at tier 1 and escalate only after he has actually tried again. Never hand him tier 3 first.",
			"Never read docs/hints/* with the read tool — the ladder only works if you see one tier at a time, through this tool.",
			"Relay the hint text VERBATIM. Do not extend it, do not translate it into code, do not 'just show him the fix'. A hint that becomes a solution destroys the exercise.",
			"After giving a hint, send him back to the code: ask what he'll try, or tell him the verify command to re-run. Do not solve it for him.",
			"If he is still stuck after tier 4, do NOT write his code. Narrow the problem instead: isolate the failing case, ask a diagnostic question, or work a separate toy example together and let him port it.",
			"Read the returned usage summary: a stage that repeatedly needs tier 3 is mis-scoped — say so and offer to re-cut it.",
		],
		parameters: Type.Object({
			project: Type.Optional(Type.String({
				description: "Optional path to the practice project directory (the one containing PRACTICE.json). Auto-detected in cwd and two levels of subdirectories when omitted.",
			})),
			stage: Type.Optional(Type.Union([Type.Number(), Type.String()], {
				description: "Stage number (e.g. 3) or slug (e.g. \"parse-dates\"). Omit to list the project's stages instead of returning a hint.",
			})),
			tier: Type.Optional(Type.Number({
				description: "Hint tier: 1 (nudge), 2 (concept), 3 (approach), 4 (isomorphic example). Defaults to 1. Escalate only after an attempt.",
				minimum: 1,
				maximum: MAX_TIERS,
			})),
		}),

		async execute(_id, params, _signal, _onUpdate, ctx) {
			const resolved = resolveProject(ctx.cwd, params.project);
			if (!resolved.ok) {
				return { content: [{ type: "text" as const, text: resolved.error }], details: { status: "no-project" } };
			}
			const { dir, manifest } = resolved;

			if (params.stage === undefined || String(params.stage).trim() === "") {
				const text = `Practice project: ${manifest.subject} (${path.relative(ctx.cwd, dir) || dir})\nStages:\n${stageList(manifest)}\n\nHint usage so far — ${summarizeUsage(readHintLog(dir))}`;
				return { content: [{ type: "text" as const, text }], details: { status: "stage-list", project: dir } };
			}

			const stage = findStage(manifest, params.stage);
			if (!stage) {
				return {
					content: [{ type: "text" as const, text: `No stage "${params.stage}" in ${manifest.subject}. Stages:\n${stageList(manifest)}` }],
					details: { status: "unknown-stage" },
				};
			}
			if (!stage.hints) {
				return {
					content: [{ type: "text" as const, text: `Stage ${stage.n} (${stage.slug}) declares no hints file in ${MANIFEST}.` }],
					details: { status: "no-hints-file" },
				};
			}

			const hintsPath = path.isAbsolute(stage.hints) ? stage.hints : path.join(dir, stage.hints);
			if (!fs.existsSync(hintsPath)) {
				return {
					content: [{ type: "text" as const, text: `Hints file missing: ${stage.hints}` }],
					details: { status: "missing-file" },
				};
			}

			const tiers = extractTiers(hintsPath);
			if (tiers.size === 0) {
				return {
					content: [{ type: "text" as const, text: `No <!-- hint:N --> … <!-- /hint --> blocks found in ${stage.hints}.` }],
					details: { status: "no-blocks" },
				};
			}

			const tier = Math.min(MAX_TIERS, Math.max(1, Math.round(params.tier ?? 1)));
			const body = tiers.get(tier);
			if (!body) {
				const have = Array.from(tiers.keys()).sort((a, b) => a - b).join(", ");
				return {
					content: [{ type: "text" as const, text: `Stage ${stage.n} has no tier ${tier}. Available tiers: ${have}.` }],
					details: { status: "no-tier", available: have },
				};
			}

			logHint(dir, stage, tier);
			const usage = summarizeUsage(readHintLog(dir));
			const higher = Array.from(tiers.keys()).filter((t) => t > tier).sort((a, b) => a - b);
			const text = [
				`Stage ${stage.n} — ${stage.title} · hint tier ${tier} of ${MAX_TIERS}`,
				`Relay the block below VERBATIM. Do not extend it into a solution.`,
				higher.length > 0 ? `Higher tiers available if he tries again and is still stuck: ${higher.join(", ")}.` : `This is the last tier — if he is still stuck, narrow the problem with him instead of writing his code.`,
				"",
				body,
				"",
				`Hint usage so far — ${usage}`,
			].join("\n");

			return {
				content: [{ type: "text" as const, text }],
				details: { status: "ok", project: dir, stage: stage.n, slug: stage.slug, tier },
			};
		},
	});

	pi.registerTool({
		name: "progress",
		label: "progress",
		description:
			"Run a practice project's per-stage verify commands and return a compact green/red ladder — which stages pass, which fail, and the tail of the failure output. Use it to answer 'how am I doing?' objectively (the test suite is the teacher), to confirm a stage he says is done, and to see whether a failure is a genuine bug or a stub he hasn't reached yet. Omit `stage` to run every stage; pass one to run just that stage. Returns summaries, not full logs.",
		promptSnippet:
			"Use `progress` to run the learner's stage verify commands and see the objective state of his practice project.",
		promptGuidelines: [
			"Run `progress` before giving any opinion on whether a stage works. His test suite outranks your reading of the code.",
			"A stage failing with an unimplemented-stub error is expected, not a bug — only treat it as progress-worthy once he says he has worked on it.",
			"Read the failure tail and ask him what he makes of it before offering a diagnosis. Let him find the bug; that is the exercise.",
			"Never edit his source files to make a stage pass. Tests and stubs are yours; the implementation is his.",
		],
		parameters: Type.Object({
			project: Type.Optional(Type.String({
				description: "Optional path to the practice project directory (containing PRACTICE.json). Auto-detected when omitted.",
			})),
			stage: Type.Optional(Type.Union([Type.Number(), Type.String()], {
				description: "Run only this stage's verify command (number or slug). Omit to run all stages in order.",
			})),
		}),

		async execute(_id, params, _signal, onUpdate, ctx) {
			const resolved = resolveProject(ctx.cwd, params.project);
			if (!resolved.ok) {
				return { content: [{ type: "text" as const, text: resolved.error }], details: { status: "no-project" } };
			}
			const { dir, manifest } = resolved;

			let stages = manifest.stages;
			if (params.stage !== undefined && String(params.stage).trim() !== "") {
				const one = findStage(manifest, params.stage);
				if (!one) {
					return {
						content: [{ type: "text" as const, text: `No stage "${params.stage}". Stages:\n${stageList(manifest)}` }],
						details: { status: "unknown-stage" },
					};
				}
				stages = [one];
			}

			const runnable = stages.filter((s) => s.verify && s.verify.trim());
			if (runnable.length === 0) {
				return {
					content: [{ type: "text" as const, text: `No stage declares a \`verify\` command in ${MANIFEST}.` }],
					details: { status: "no-verify" },
				};
			}

			const results: Array<{ n: number; slug: string; pass: boolean; ms: number; tail: string; quiz?: boolean; quizOk?: boolean; hidden: boolean }> = [];
			for (const stage of runnable) {
				onUpdate?.({
					content: [{ type: "text" as const, text: `Running stage ${stage.n} (${stage.slug})…` }],
					details: { running: stage.n },
				});
				const r = runVerify(dir, stage.verify!);
				results.push({
					n: stage.n,
					slug: stage.slug,
					pass: r.code === 0,
					ms: r.ms,
					tail: r.tail,
					quiz: !!stage.quiz,
					quizOk: stage.quiz ? quizOutcome(dir, stage.n) : undefined,
					hidden: !!stage.hidden,
				});
			}

			const green = results.filter((r) => r.pass).length;
			const lines = [`${manifest.subject} — ${green}/${results.length} stage verify commands green`];
			for (const r of results) {
				const marks = [
					r.quiz ? `quiz ${r.quizOk === true ? "✓" : r.quizOk === false ? "✗ open" : "pending"}` : null,
					r.hidden ? "hidden suite" : null,
				].filter(Boolean).join(" · ");
				lines.push(`${r.pass ? "✓" : "✗"} stage ${r.n} ${r.slug} (${(r.ms / 1000).toFixed(1)}s)${marks ? ` — ${marks}` : ""}`);
				if (!r.pass && r.tail) {
					for (const l of r.tail.split("\n")) lines.push(`    ${l}`);
				}
			}

			const openQuiz = results.filter((r) => r.quiz && r.pass && r.quizOk !== true).map((r) => r.n);
			if (openQuiz.length > 0) {
				lines.push(`Definition-of-done quiz still open for stage ${openQuiz.join(", ")} — a stage is not done until he answers it.`);
			}

			return {
				content: [{ type: "text" as const, text: lines.join("\n") }],
				details: {
					status: "ok",
					project: dir,
					green,
					total: results.length,
					stages: results.map((r) => ({ n: r.n, slug: r.slug, pass: r.pass, ms: r.ms, quizOk: r.quizOk, hidden: r.hidden })),
				},
			};
		},
	});

	pi.registerTool({
		name: "grade",
		label: "grade",
		description:
			"Run a practice project's HIDDEN acceptance suite for one stage (or every stage that declares one) and return the test-runner output — failure names and messages. This is the stage-completion gate, not the feedback loop: the visible per-stage verify command stays the learner's fast loop. Call it when a stage's verify is green (or when he asks to be graded). Never `read` files under hidden-tests/ — you relay failures as names and messages only, never as code.",
		promptSnippet:
			"Use `grade` to run the hidden acceptance suite when a stage's visible verify is green.",
		promptGuidelines: [
			"Run `grade` only after the stage's visible verify is green, or when he explicitly asks to be graded. It is a completion gate, not a feedback loop.",
			"Relay failure names and messages ONLY. Never read hidden-tests/, never paste or paraphrase the test code — a hidden suite he can read is a suite he can code toward.",
			"On a hidden failure he fixes it blind first: the message is the only clue, and that is deliberate. If he is genuinely blocked after a real attempt, you may describe the failing SCENARIO in words (what input, what went wrong) — never the assertion, never the file.",
			"Hidden suites catch narrow fixes and regressions; they never gate style or structure. A fix that passes everything by a route you wouldn't take is a review conversation with tradeoffs, not a block.",
			"If a stage declares no hidden suite, say so and fall back to the visible verify plus the definition-of-done quiz.",
		],
		parameters: Type.Object({
			project: Type.Optional(Type.String({
				description: "Optional path to the practice project directory (containing PRACTICE.json). Auto-detected when omitted.",
			})),
			stage: Type.Optional(Type.Union([Type.Number(), Type.String()], {
				description: "Grade only this stage (number or slug). Omit to run every stage that declares a hidden suite.",
			})),
		}),

		async execute(_id, params, _signal, onUpdate, ctx) {
			const resolved = resolveProject(ctx.cwd, params.project);
			if (!resolved.ok) {
				return { content: [{ type: "text" as const, text: resolved.error }], details: { status: "no-project" } };
			}
			const { dir, manifest } = resolved;

			let stages = manifest.stages;
			if (params.stage !== undefined && String(params.stage).trim() !== "") {
				const one = findStage(manifest, params.stage);
				if (!one) {
					return {
						content: [{ type: "text" as const, text: `No stage "${params.stage}". Stages:\n${stageList(manifest)}` }],
						details: { status: "unknown-stage" },
					};
				}
				stages = [one];
			}

			const runnable = stages.filter((s) => s.hidden && s.hidden.trim());
			if (runnable.length === 0) {
				const scope = stages.length === 1 ? `Stage ${stages[0].n} (${stages[0].slug})` : "No stage in this project";
				return {
					content: [{ type: "text" as const, text: `${scope} declares a hidden suite in ${MANIFEST}. Fall back to its visible verify command and its definition-of-done quiz.` }],
					details: { status: "no-hidden" },
				};
			}

			const results: Array<{ n: number; slug: string; pass: boolean; ms: number; tail: string }> = [];
			for (const stage of runnable) {
				onUpdate?.({
					content: [{ type: "text" as const, text: `Grading stage ${stage.n} (${stage.slug})…` }],
					details: { running: stage.n },
				});
				const r = runVerify(dir, stage.hidden!);
				results.push({ n: stage.n, slug: stage.slug, pass: r.code === 0, ms: r.ms, tail: r.tail });
			}

			const passed = results.filter((r) => r.pass).length;
			const lines = [`Hidden acceptance — ${passed}/${results.length} stages accepted`];
			for (const r of results) {
				lines.push(`${r.pass ? "✓" : "✗"} stage ${r.n} ${r.slug} (${(r.ms / 1000).toFixed(1)}s)`);
				if (!r.pass && r.tail) {
					for (const l of r.tail.split("\n")) lines.push(`    ${l}`);
				}
			}
			lines.push("");
			lines.push("Relay the failure names and messages above and nothing else. He fixes it from the message alone first; only if he is blocked do you describe the failing scenario in words, never the test.");

			return {
				content: [{ type: "text" as const, text: lines.join("\n") }],
				details: {
					status: "ok",
					project: dir,
					passed,
					total: results.length,
					stages: results.map((r) => ({ n: r.n, slug: r.slug, pass: r.pass, ms: r.ms })),
				},
			};
		},
	});

	pi.registerCommand("hint", {
		description: "Ask for a graduated hint: /hint [stage] [tier]",
		handler: async (args, ctx) => {
			const parts = args.trim().split(/\s+/).filter(Boolean);
			const stage = parts[0];
			const tier = parts[1];
			if (typeof ctx.isIdle === "function" && !ctx.isIdle()) {
				ctx.ui.notify("Wait for the agent to finish first.", "warning");
				return;
			}
			const ask = stage
				? `I'm working on stage ${stage} of my practice project and I'm stuck. Call the \`hint\` tool for stage ${stage} at tier ${tier ?? 1} and give me the hint text VERBATIM — then stop and let me try. Do not write the code for me.`
				: `List my practice project's stages with the \`hint\` tool (no stage argument), then ask me which one I want a hint for.`;
			pi.sendUserMessage(ask);
		},
	});

	pi.registerCommand("grade", {
		description: "Run the hidden acceptance suite: /grade [stage]",
		handler: async (args, ctx) => {
			const stage = args.trim();
			if (typeof ctx.isIdle === "function" && !ctx.isIdle()) {
				ctx.ui.notify("Wait for the agent to finish first.", "warning");
				return;
			}
			pi.sendUserMessage(
				stage
					? `Run the \`grade\` tool for stage ${stage} and show me the failure names and messages only. Don't show me the hidden tests, and don't write my fix.`
					: `Run the \`grade\` tool for every stage that has a hidden suite and show me the failure names and messages only. Don't show me the hidden tests, and don't write my fix.`,
			);
		},
	});

	pi.registerCommand("check", {
		description: "Run stage verify commands and show progress: /check [stage]",
		handler: async (args, ctx) => {
			const stage = args.trim();
			if (typeof ctx.isIdle === "function" && !ctx.isIdle()) {
				ctx.ui.notify("Wait for the agent to finish first.", "warning");
				return;
			}
			pi.sendUserMessage(
				stage
					? `Run the \`progress\` tool for stage ${stage} and show me the result as a short ladder. Don't fix anything.`
					: `Run the \`progress\` tool for every stage and show me the ladder. Celebrate what turned green, then tell me which stage to attack next. Don't fix anything.`,
			);
		},
	});
}
