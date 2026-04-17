import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

type ResumeArtifact = {
	path: string;
	mtimeMs: number;
};

function collectFiles(root: string, predicate: (path: string) => boolean): ResumeArtifact[] {
	if (!existsSync(root)) return [];
	const files: ResumeArtifact[] = [];
	for (const entry of readdirSync(root, { withFileTypes: true })) {
		const path = join(root, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectFiles(path, predicate));
			continue;
		}
		if (!entry.isFile() || !predicate(path)) continue;
		try {
			files.push({ path, mtimeMs: statSync(path).mtimeMs });
		} catch {}
	}
	return files;
}

function tail(text: string, maxChars: number): string {
	return text.length <= maxChars ? text : text.slice(text.length - maxChars);
}

export function buildResumePacket(cwd: string, maxChars = 4_000): string | undefined {
	const plans = collectFiles(resolve(cwd, "outputs", ".plans"), (path) => path.endsWith(".md"))
		.sort((a, b) => b.mtimeMs - a.mtimeMs)
		.slice(0, 3);
	const stateFiles = collectFiles(resolve(cwd, "outputs", ".state"), (path) => /\.(json|jsonl|md)$/i.test(path))
		.sort((a, b) => b.mtimeMs - a.mtimeMs)
		.slice(0, 5);
	const changelogPath = resolve(cwd, "CHANGELOG.md");

	if (plans.length === 0 && stateFiles.length === 0 && !existsSync(changelogPath)) {
		return undefined;
	}

	const lines: string[] = [
		"[feynman resume packet]",
		"This is a bounded project-state summary from disk. Prefer these paths over guessing prior workflow state.",
	];

	if (plans.length > 0) {
		lines.push("", "Recent plans:");
		for (const plan of plans) {
			lines.push(`- ${plan.path}`);
		}
		const newestPlan = plans[0]!;
		try {
			lines.push("", `Newest plan tail (${newestPlan.path}):`, tail(readFileSync(newestPlan.path, "utf8"), 1_500));
		} catch {}
	}

	if (stateFiles.length > 0) {
		lines.push("", "Recent state files:");
		for (const file of stateFiles) {
			lines.push(`- ${file.path}`);
		}
	}

	if (existsSync(changelogPath)) {
		try {
			lines.push("", "CHANGELOG tail:", tail(readFileSync(changelogPath, "utf8"), 1_200));
		} catch {}
	}

	return tail(lines.join("\n"), maxChars);
}

export function registerResumePacket(pi: ExtensionAPI): void {
	pi.on("session_start", async (_event, ctx: ExtensionContext) => {
		if (process.env.FEYNMAN_RESUME_PACKET === "off") return;
		const packet = buildResumePacket(ctx.cwd);
		if (!packet) return;
		pi.sendMessage(
			{
				customType: "feynman_resume_packet",
				content: packet,
				display: false,
				details: { source: "outputs/.plans outputs/.state CHANGELOG.md" },
			},
			{ triggerTurn: false, deliverAs: "nextTurn" },
		);
	});
}
