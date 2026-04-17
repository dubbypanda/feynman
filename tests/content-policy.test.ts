import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bannedPatterns = [/ValiChord/i, /Harmony Record/i, /harmony_record_/i];

function collectMarkdownFiles(root: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(root, { withFileTypes: true })) {
		const fullPath = join(root, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectMarkdownFiles(fullPath));
			continue;
		}
		if (entry.isFile() && fullPath.endsWith(".md")) {
			files.push(fullPath);
		}
	}
	return files;
}

test("bundled prompts and skills do not contain blocked promotional product content", () => {
	for (const filePath of [...collectMarkdownFiles(join(repoRoot, "prompts")), ...collectMarkdownFiles(join(repoRoot, "skills"))]) {
		const content = readFileSync(filePath, "utf8");
		for (const pattern of bannedPatterns) {
			assert.doesNotMatch(content, pattern, `${filePath} contains blocked promotional pattern ${pattern}`);
		}
	}
});

test("research writing prompts forbid fabricated results and unproven figures", () => {
	const draftPrompt = readFileSync(join(repoRoot, "prompts", "draft.md"), "utf8");
	const systemPrompt = readFileSync(join(repoRoot, ".feynman", "SYSTEM.md"), "utf8");
	const writerPrompt = readFileSync(join(repoRoot, ".feynman", "agents", "writer.md"), "utf8");
	const verifierPrompt = readFileSync(join(repoRoot, ".feynman", "agents", "verifier.md"), "utf8");

	for (const [label, content] of [
		["system prompt", systemPrompt],
	] as const) {
		assert.match(content, /Never (invent|fabricate)/i, `${label} must explicitly forbid invented or fabricated results`);
		assert.match(content, /(figure|chart|image|table)/i, `${label} must cover visual/table provenance`);
		assert.match(content, /(provenance|source|artifact|script|raw)/i, `${label} must require traceable support`);
	}

	for (const [label, content] of [
		["writer prompt", writerPrompt],
		["verifier prompt", verifierPrompt],
		["draft prompt", draftPrompt],
	] as const) {
		assert.match(content, /system prompt.*provenance rule/i, `${label} must point back to the system provenance rule`);
	}

	assert.match(draftPrompt, /system prompt's provenance rules/i);
	assert.match(draftPrompt, /placeholder or proposed experimental plan/i);
	assert.match(draftPrompt, /source-backed quantitative data/i);
});

test("deepresearch workflow requires durable artifacts even when blocked", () => {
	const systemPrompt = readFileSync(join(repoRoot, ".feynman", "SYSTEM.md"), "utf8");
	const deepResearchPrompt = readFileSync(join(repoRoot, "prompts", "deepresearch.md"), "utf8");

	assert.match(systemPrompt, /Do not claim you are only a static model/i);
	assert.match(systemPrompt, /write the requested durable artifact/i);
	assert.match(deepResearchPrompt, /Do not stop after planning/i);
	assert.match(deepResearchPrompt, /degraded mode/i);
	assert.match(deepResearchPrompt, /Verification: BLOCKED/i);
	assert.match(deepResearchPrompt, /Never end with only an explanation in chat/i);
});

test("workflow prompts do not introduce implicit confirmation gates", () => {
	const workflowPrompts = [
		"audit.md",
		"compare.md",
		"deepresearch.md",
		"draft.md",
		"lit.md",
		"review.md",
		"summarize.md",
		"watch.md",
	];
	const bannedConfirmationGates = [
		/Do you want to proceed/i,
		/Wait for confirmation/i,
		/wait for user confirmation/i,
		/give them a brief chance/i,
		/request changes before proceeding/i,
	];

	for (const fileName of workflowPrompts) {
		const content = readFileSync(join(repoRoot, "prompts", fileName), "utf8");
		assert.match(content, /continue (immediately|automatically)/i, `${fileName} should keep running after planning`);
		for (const pattern of bannedConfirmationGates) {
			assert.doesNotMatch(content, pattern, `${fileName} contains confirmation gate ${pattern}`);
		}
	}
});
