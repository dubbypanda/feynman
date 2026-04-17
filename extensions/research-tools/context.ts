import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

type ContextPosture = {
	model: string;
	contextWindow: number | null;
	estimatedInputTokens: number | null;
	utilizationPct: number | null;
	compactionThresholdHit: boolean;
	recommendedMaxWorkers: number;
};

export function computeContextPosture(ctx: ExtensionContext): ContextPosture {
	const usage = ctx.getContextUsage();
	const modelWindow = typeof ctx.model?.contextWindow === "number" ? ctx.model.contextWindow : null;
	const contextWindow = usage?.contextWindow ?? modelWindow;
	const estimatedInputTokens = usage?.tokens ?? null;
	const utilizationPct = usage?.percent ?? (contextWindow && estimatedInputTokens
		? Math.round((estimatedInputTokens / contextWindow) * 1000) / 10
		: null);
	const compactionThresholdHit = utilizationPct !== null && utilizationPct >= 70;
	const availableForWorkers = contextWindow
		? Math.max(0, contextWindow - 16_384 - (estimatedInputTokens ?? 0))
		: 0;
	const recommendedMaxWorkers = contextWindow === null
		? 1
		: Math.max(1, Math.min(4, Math.floor(availableForWorkers / 24_000) || 1));

	return {
		model: ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "not set",
		contextWindow,
		estimatedInputTokens,
		utilizationPct,
		compactionThresholdHit,
		recommendedMaxWorkers,
	};
}

export function registerContextReportTool(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "context_report",
		label: "Context Report",
		description: "Report current Pi context usage, compaction threshold posture, and safe worker-count guidance.",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const report = computeContextPosture(ctx);
			return {
				content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
				details: report,
			};
		},
	});
}
