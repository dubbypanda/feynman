import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

type AutoLogMode = "off" | "events" | "full";

function readAgentSettings(): Record<string, unknown> {
	const agentDir = process.env.PI_CODING_AGENT_DIR;
	if (!agentDir) return {};
	try {
		return JSON.parse(readFileSync(resolve(agentDir, "settings.json"), "utf8")) as Record<string, unknown>;
	} catch {
		return {};
	}
}

function normalizeMode(value: unknown): AutoLogMode | undefined {
	if (typeof value !== "string") return undefined;
	const normalized = value.trim().toLowerCase();
	if (normalized === "off" || normalized === "events" || normalized === "full") return normalized;
	return undefined;
}

export function getAutoLogMode(): AutoLogMode {
	return normalizeMode(process.env.FEYNMAN_AUTO_LOG) ??
		normalizeMode(readAgentSettings().autoLog) ??
		"events";
}

function extractMessageText(message: unknown): string {
	if (!message || typeof message !== "object") return "";
	const content = (message as { content?: unknown }).content;
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.map((item) => {
			if (!item || typeof item !== "object") return "";
			const record = item as { type?: string; text?: unknown; thinking?: unknown; name?: unknown };
			if (record.type === "text" && typeof record.text === "string") return record.text;
			if (record.type === "thinking" && typeof record.thinking === "string") return "[thinking omitted]";
			if (record.type === "toolCall") return `[tool:${typeof record.name === "string" ? record.name : "unknown"}]`;
			return "";
		})
		.filter(Boolean)
		.join("\n");
}

function clip(text: string, maxChars: number): string {
	return text.length > maxChars ? `${text.slice(0, maxChars)}\n...[truncated ${text.length - maxChars} chars]` : text;
}

export function autoLogPath(cwd: string, date = new Date()): string {
	const day = date.toISOString().slice(0, 10);
	return resolve(cwd, "notes", "feynman-autolog", `${day}.jsonl`);
}

export function writeAutoLogEntry(cwd: string, entry: Record<string, unknown>): void {
	const path = autoLogPath(cwd);
	mkdirSync(dirname(path), { recursive: true });
	appendFileSync(path, `${JSON.stringify(entry)}\n`, "utf8");
}

export function registerAutoLog(pi: ExtensionAPI): void {
	pi.on("message_end", async (event, ctx: ExtensionContext) => {
		const mode = getAutoLogMode();
		if (mode === "off") return;

		const message = event.message as any;
		if (message.role !== "user" && message.role !== "assistant") return;

		const text = extractMessageText(message).replace(/\s+/g, " ").trim();
		if (!text) return;

		writeAutoLogEntry(ctx.cwd, {
			timestamp: new Date(message.timestamp ?? Date.now()).toISOString(),
			session: ctx.sessionManager.getSessionId(),
			role: message.role,
			model: message.role === "assistant" ? `${message.provider}/${message.model}` : undefined,
			mode,
			text: mode === "full" ? text : clip(text, 500),
		});
	});
}
