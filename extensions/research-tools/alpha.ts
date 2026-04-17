import {
	askPaper,
	annotatePaper,
	clearPaperAnnotation,
	getPaper,
	listPaperAnnotations,
	readPaperCode,
	searchPapers,
} from "@companion-ai/alpha-hub/lib";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

function formatText(value: unknown): string {
	if (typeof value === "string") return value;
	return JSON.stringify(value, null, 2);
}

function toolOutputCapChars(): number {
	const raw = Number(process.env.FEYNMAN_TOOL_OUTPUT_CAP_CHARS);
	return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 32_000;
}

function spillPath(ctx: ExtensionContext, toolName: string, text: string): string {
	const hash = createHash("sha256").update(text).digest("hex").slice(0, 12);
	return resolve(ctx.cwd, "outputs", ".cache", `${toolName}-${hash}.md`);
}

export function formatToolResultWithSpillover(
	ctx: ExtensionContext,
	toolName: string,
	result: unknown,
): { text: string; details: unknown } {
	const text = formatText(result);
	const cap = toolOutputCapChars();
	if (text.length <= cap) {
		return { text, details: result };
	}

	const path = spillPath(ctx, toolName, text);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, text, "utf8");

	const head = text.slice(0, Math.min(cap, 4_000));
	const pointer = {
		feynman_spillover: true,
		tool: toolName,
		path,
		bytes: Buffer.byteLength(text, "utf8"),
		sha256: createHash("sha256").update(text).digest("hex"),
		note: "Full tool output was written to disk. Read the path in bounded chunks instead of asking the tool to return everything again.",
		head,
	};
	return { text: JSON.stringify(pointer, null, 2), details: pointer };
}

export function registerAlphaTools(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "alpha_search",
		label: "Alpha Search",
		description:
			"Search research papers through alphaXiv. Modes: semantic (default, use 2-3 sentence queries), keyword (exact terms), agentic (broad multi-turn retrieval), both, or all.",
		parameters: Type.Object({
			query: Type.String({ description: "Search query." }),
			mode: Type.Optional(
				Type.String({ description: "Search mode: semantic, keyword, both, agentic, or all." }),
			),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await searchPapers(params.query, params.mode?.trim() || "semantic");
			const formatted = formatToolResultWithSpillover(ctx, "alpha_search", result);
			return { content: [{ type: "text", text: formatted.text }], details: formatted.details };
		},
	});

	pi.registerTool({
		name: "alpha_get_paper",
		label: "Alpha Get Paper",
		description: "Fetch a paper's AI-generated report (or raw full text) plus any local annotation.",
		parameters: Type.Object({
			paper: Type.String({ description: "arXiv ID, arXiv URL, or alphaXiv URL." }),
			fullText: Type.Optional(Type.Boolean({ description: "Return raw full text instead of AI report." })),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await getPaper(params.paper, { fullText: params.fullText });
			const formatted = formatToolResultWithSpillover(ctx, "alpha_get_paper", result);
			return { content: [{ type: "text", text: formatted.text }], details: formatted.details };
		},
	});

	pi.registerTool({
		name: "alpha_ask_paper",
		label: "Alpha Ask Paper",
		description: "Ask a targeted question about a paper. Uses AI to analyze the PDF and answer.",
		parameters: Type.Object({
			paper: Type.String({ description: "arXiv ID, arXiv URL, or alphaXiv URL." }),
			question: Type.String({ description: "Question about the paper." }),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await askPaper(params.paper, params.question);
			const formatted = formatToolResultWithSpillover(ctx, "alpha_ask_paper", result);
			return { content: [{ type: "text", text: formatted.text }], details: formatted.details };
		},
	});

	pi.registerTool({
		name: "alpha_annotate_paper",
		label: "Alpha Annotate Paper",
		description: "Write or clear a persistent local annotation for a paper.",
		parameters: Type.Object({
			paper: Type.String({ description: "Paper ID (arXiv ID or URL)." }),
			note: Type.Optional(Type.String({ description: "Annotation text. Omit when clear=true." })),
			clear: Type.Optional(Type.Boolean({ description: "Clear the existing annotation." })),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = params.clear
				? await clearPaperAnnotation(params.paper)
				: params.note
					? await annotatePaper(params.paper, params.note)
					: (() => { throw new Error("Provide either note or clear=true."); })();
			const formatted = formatToolResultWithSpillover(ctx, "alpha_annotate_paper", result);
			return { content: [{ type: "text", text: formatted.text }], details: formatted.details };
		},
	});

	pi.registerTool({
		name: "alpha_list_annotations",
		label: "Alpha List Annotations",
		description: "List all persistent local paper annotations.",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const result = await listPaperAnnotations();
			const formatted = formatToolResultWithSpillover(ctx, "alpha_list_annotations", result);
			return { content: [{ type: "text", text: formatted.text }], details: formatted.details };
		},
	});

	pi.registerTool({
		name: "alpha_read_code",
		label: "Alpha Read Code",
		description: "Read files from a paper's GitHub repository. Use '/' for repo overview.",
		parameters: Type.Object({
			githubUrl: Type.String({ description: "GitHub repository URL." }),
			path: Type.Optional(Type.String({ description: "File or directory path. Default: '/'" })),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await readPaperCode(params.githubUrl, params.path?.trim() || "/");
			const formatted = formatToolResultWithSpillover(ctx, "alpha_read_code", result);
			return { content: [{ type: "text", text: formatted.text }], details: formatted.details };
		},
	});
}
