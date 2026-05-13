import test from "node:test";
import assert from "node:assert/strict";

import { buildModelStatusSnapshotFromRecords } from "../src/model/catalog.js";

test("buildModelStatusSnapshotFromRecords returns empty guidance when model is set and valid", () => {
	const snapshot = buildModelStatusSnapshotFromRecords(
		[{ provider: "anthropic", id: "claude-opus-4-6" }],
		[{ provider: "anthropic", id: "claude-opus-4-6" }],
		"anthropic/claude-opus-4-6",
	);

	assert.equal(snapshot.currentValid, true);
	assert.equal(snapshot.current, "anthropic/claude-opus-4-6");
	assert.equal(snapshot.guidance.length, 0);
});

test("buildModelStatusSnapshotFromRecords emits guidance when no models are available", () => {
	const snapshot = buildModelStatusSnapshotFromRecords([], [], undefined);

	assert.equal(snapshot.currentValid, false);
	assert.equal(snapshot.current, undefined);
	assert.equal(snapshot.recommended, undefined);
	assert.ok(snapshot.guidance.some((line) => line.includes("No authenticated Pi models")));
});

test("buildModelStatusSnapshotFromRecords emits guidance when no default model is set", () => {
	const snapshot = buildModelStatusSnapshotFromRecords(
		[{ provider: "openai", id: "gpt-5.4" }],
		[{ provider: "openai", id: "gpt-5.4" }],
		undefined,
	);

	assert.equal(snapshot.currentValid, false);
	assert.equal(snapshot.current, undefined);
	assert.ok(snapshot.guidance.some((line) => line.includes("No default research model")));
});

test("buildModelStatusSnapshotFromRecords marks provider as configured only when it has available models", () => {
	const snapshot = buildModelStatusSnapshotFromRecords(
		[
			{ provider: "anthropic", id: "claude-opus-4-6" },
			{ provider: "openai", id: "gpt-5.4" },
		],
		[{ provider: "openai", id: "gpt-5.4" }],
		"openai/gpt-5.4",
	);

	const anthropicProvider = snapshot.providers.find((provider) => provider.id === "anthropic");
	const openaiProvider = snapshot.providers.find((provider) => provider.id === "openai");

	assert.ok(anthropicProvider);
	assert.equal(anthropicProvider!.configured, false);
	assert.equal(anthropicProvider!.supportedModels, 1);
	assert.equal(anthropicProvider!.availableModels, 0);

	assert.ok(openaiProvider);
	assert.equal(openaiProvider!.configured, true);
	assert.equal(openaiProvider!.supportedModels, 1);
	assert.equal(openaiProvider!.availableModels, 1);
});

test("buildModelStatusSnapshotFromRecords marks provider as current when selected model belongs to it", () => {
	const snapshot = buildModelStatusSnapshotFromRecords(
		[
			{ provider: "anthropic", id: "claude-opus-4-6" },
			{ provider: "openai", id: "gpt-5.4" },
		],
		[
			{ provider: "anthropic", id: "claude-opus-4-6" },
			{ provider: "openai", id: "gpt-5.4" },
		],
		"anthropic/claude-opus-4-6",
	);

	const anthropicProvider = snapshot.providers.find((provider) => provider.id === "anthropic");
	const openaiProvider = snapshot.providers.find((provider) => provider.id === "openai");

	assert.equal(anthropicProvider!.current, true);
	assert.equal(openaiProvider!.current, false);
});

test("buildModelStatusSnapshotFromRecords returns available models sorted by research preference", () => {
	const snapshot = buildModelStatusSnapshotFromRecords(
		[
			{ provider: "openai", id: "gpt-5.4" },
			{ provider: "openai", id: "gpt-5.5" },
			{ provider: "anthropic", id: "claude-opus-4-6" },
		],
		[
			{ provider: "openai", id: "gpt-5.4" },
			{ provider: "openai", id: "gpt-5.5" },
			{ provider: "anthropic", id: "claude-opus-4-6" },
		],
		undefined,
	);

	assert.equal(snapshot.availableModels[0], "anthropic/claude-opus-4-6");
	assert.equal(snapshot.availableModels[1], "openai/gpt-5.5");
	assert.equal(snapshot.availableModels[2], "openai/gpt-5.4");
	assert.equal(snapshot.recommended, "anthropic/claude-opus-4-6");
});

test("buildModelStatusSnapshotFromRecords sets currentValid false when current model is not in available list", () => {
	const snapshot = buildModelStatusSnapshotFromRecords(
		[{ provider: "anthropic", id: "claude-opus-4-6" }],
		[],
		"anthropic/claude-opus-4-6",
	);

	assert.equal(snapshot.currentValid, false);
	assert.equal(snapshot.current, "anthropic/claude-opus-4-6");
});
