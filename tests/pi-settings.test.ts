import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
	CORE_PACKAGE_SOURCES,
	getOptionalPackagePresetSources,
	isOptionalPackagePresetSupported,
	listOptionalPackagePresetInstallTargets,
	listOptionalPackagePresets,
	NATIVE_PACKAGE_SOURCES,
	normalizeOptionalPackagePresetName,
	resolvePackageUpdateSources,
	shouldPruneLegacyDefaultPackages,
	supportsNativePackageSources,
} from "../src/pi/package-presets.js";
import { normalizeFeynmanSettings, normalizeThinkingLevel } from "../src/pi/settings.js";

test("normalizeThinkingLevel accepts the latest Pi thinking levels", () => {
	assert.equal(normalizeThinkingLevel("off"), "off");
	assert.equal(normalizeThinkingLevel("minimal"), "minimal");
	assert.equal(normalizeThinkingLevel("low"), "low");
	assert.equal(normalizeThinkingLevel("medium"), "medium");
	assert.equal(normalizeThinkingLevel("high"), "high");
	assert.equal(normalizeThinkingLevel("xhigh"), "xhigh");
});

test("normalizeThinkingLevel rejects unknown values", () => {
	assert.equal(normalizeThinkingLevel("turbo"), undefined);
	assert.equal(normalizeThinkingLevel(undefined), undefined);
});

test("normalizeFeynmanSettings seeds the fast core package set", () => {
	const root = mkdtempSync(join(tmpdir(), "feynman-settings-"));
	const settingsPath = join(root, "settings.json");
	const bundledSettingsPath = join(root, "bundled-settings.json");
	const authPath = join(root, "auth.json");

	writeFileSync(bundledSettingsPath, "{}\n", "utf8");
	writeFileSync(authPath, "{}\n", "utf8");

	normalizeFeynmanSettings(settingsPath, bundledSettingsPath, "medium", authPath);

	const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as { packages?: string[] };
	assert.deepEqual(settings.packages, [...CORE_PACKAGE_SOURCES]);
});

test("normalizeFeynmanSettings prunes the legacy slow default package set", () => {
	const root = mkdtempSync(join(tmpdir(), "feynman-settings-"));
	const settingsPath = join(root, "settings.json");
	const bundledSettingsPath = join(root, "bundled-settings.json");
	const authPath = join(root, "auth.json");

	writeFileSync(
		settingsPath,
		JSON.stringify(
			{
				packages: [
					...CORE_PACKAGE_SOURCES,
					"npm:pi-generative-ui",
				],
			},
			null,
			2,
		) + "\n",
		"utf8",
	);
	writeFileSync(bundledSettingsPath, "{}\n", "utf8");
	writeFileSync(authPath, "{}\n", "utf8");

	normalizeFeynmanSettings(settingsPath, bundledSettingsPath, "medium", authPath);

	const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as { packages?: string[] };
	assert.deepEqual(settings.packages, [...CORE_PACKAGE_SOURCES]);
});

test("normalizeFeynmanSettings prunes the removed telemetry default package", () => {
	const root = mkdtempSync(join(tmpdir(), "feynman-settings-"));
	const settingsPath = join(root, "settings.json");
	const bundledSettingsPath = join(root, "bundled-settings.json");
	const authPath = join(root, "auth.json");

	writeFileSync(
		settingsPath,
		JSON.stringify(
			{
				packages: [
					...CORE_PACKAGE_SOURCES,
					"npm:@devkade/pi-opentelemetry",
				],
			},
			null,
			2,
		) + "\n",
		"utf8",
	);
	writeFileSync(bundledSettingsPath, "{}\n", "utf8");
	writeFileSync(authPath, "{}\n", "utf8");

	normalizeFeynmanSettings(settingsPath, bundledSettingsPath, "medium", authPath);

	const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as { packages?: string[] };
	assert.deepEqual(settings.packages, [...CORE_PACKAGE_SOURCES]);
});

test("normalizeFeynmanSettings seeds OpenAI gpt-5.5 as the preferred OpenAI default", () => {
	const root = mkdtempSync(join(tmpdir(), "feynman-settings-"));
	const settingsPath = join(root, "settings.json");
	const bundledSettingsPath = join(root, "bundled-settings.json");
	const authPath = join(root, "auth.json");

	writeFileSync(bundledSettingsPath, "{}\n", "utf8");
	writeFileSync(authPath, JSON.stringify({ openai: { type: "api_key", key: "openai-test-key" } }) + "\n", "utf8");

	normalizeFeynmanSettings(settingsPath, bundledSettingsPath, "medium", authPath);

	const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as {
		defaultProvider?: string;
		defaultModel?: string;
	};
	assert.equal(settings.defaultProvider, "openai");
	assert.equal(settings.defaultModel, "gpt-5.5");
});

test("optional package presets map friendly aliases", () => {
	assert.deepEqual(getOptionalPackagePresetSources("memory"), ["npm:@samfp/pi-memory"]);
	assert.deepEqual(getOptionalPackagePresetSources("session-search", "darwin", "22.12.0"), ["npm:@kaiserlich-dev/pi-session-search"]);
	assert.deepEqual(getOptionalPackagePresetSources("session-search", "darwin", "24.8.0"), undefined);
	assert.deepEqual(getOptionalPackagePresetSources("ui", "darwin"), ["npm:pi-generative-ui"]);
	assert.deepEqual(getOptionalPackagePresetSources("generative-ui", "linux"), undefined);
	assert.deepEqual(getOptionalPackagePresetSources("all-extras", "darwin", "22.12.0"), [
		"npm:@samfp/pi-memory",
		"npm:@kaiserlich-dev/pi-session-search",
		"npm:pi-generative-ui",
	]);
	assert.deepEqual(getOptionalPackagePresetSources("all-extras", "darwin", "24.8.0"), [
		"npm:@samfp/pi-memory",
		"npm:pi-generative-ui",
	]);
	assert.deepEqual(getOptionalPackagePresetSources("all-extras", "linux", "22.12.0"), [
		"npm:@samfp/pi-memory",
		"npm:@kaiserlich-dev/pi-session-search",
	]);
	assert.deepEqual(getOptionalPackagePresetSources("search"), undefined);
	assert.equal(normalizeOptionalPackagePresetName("ui"), "generative-ui");
	assert.equal(isOptionalPackagePresetSupported("generative-ui", "darwin"), true);
	assert.equal(isOptionalPackagePresetSupported("generative-ui", "linux"), false);
	assert.equal(isOptionalPackagePresetSupported("session-search", "darwin", "24.8.0"), false);
	assert.deepEqual(listOptionalPackagePresets("linux", "24.8.0").map((preset) => preset.name), ["memory"]);
	assert.deepEqual(listOptionalPackagePresetInstallTargets("linux", "24.8.0"), ["memory", "all-extras"]);
	assert.equal(shouldPruneLegacyDefaultPackages(["npm:custom"]), false);
});

test("package update sources map core and optional aliases", () => {
	assert.deepEqual(resolvePackageUpdateSources("memory"), ["npm:@samfp/pi-memory"]);
	assert.deepEqual(resolvePackageUpdateSources("pi-memory"), ["npm:@samfp/pi-memory"]);
	assert.deepEqual(resolvePackageUpdateSources("session-search"), ["npm:@kaiserlich-dev/pi-session-search"]);
	assert.deepEqual(resolvePackageUpdateSources("generative-ui", "darwin"), ["npm:pi-generative-ui"]);
	assert.deepEqual(resolvePackageUpdateSources("all-extras", "darwin"), getOptionalPackagePresetSources("all-extras", "darwin"));
	assert.deepEqual(resolvePackageUpdateSources("npm:@samfp/pi-memory"), ["npm:@samfp/pi-memory"]);
	assert.deepEqual(resolvePackageUpdateSources("custom-package"), ["custom-package"]);
});

test("supportsNativePackageSources disables sqlite-backed packages on Node 23+", () => {
	assert.equal(supportsNativePackageSources("22.12.0"), true);
	assert.equal(supportsNativePackageSources("23.0.0"), false);
	assert.equal(supportsNativePackageSources("24.8.0"), false);
});

test("normalizeFeynmanSettings prunes legacy package defaults to the lean research core", () => {
	const root = mkdtempSync(join(tmpdir(), "feynman-settings-"));
	const settingsPath = join(root, "settings.json");
	const bundledSettingsPath = join(root, "bundled-settings.json");
	const authPath = join(root, "auth.json");

	writeFileSync(
		settingsPath,
		JSON.stringify(
			{
				packages: [
					...CORE_PACKAGE_SOURCES,
					"npm:pi-btw",
					"npm:pi-markdown-preview",
					"npm:@walterra/pi-charts",
					"npm:pi-mermaid",
					"npm:@aliou/pi-processes",
					"npm:pi-zotero",
					"npm:@kaiserlich-dev/pi-session-search",
					"npm:pi-schedule-prompt",
					"npm:@samfp/pi-memory",
					"npm:@tmustier/pi-ralph-wiggum",
				],
			},
			null,
			2,
		) + "\n",
		"utf8",
	);
	writeFileSync(bundledSettingsPath, "{}\n", "utf8");
	writeFileSync(authPath, "{}\n", "utf8");

	const originalVersion = process.versions.node;
	Object.defineProperty(process.versions, "node", { value: "24.0.0", configurable: true });
	try {
		normalizeFeynmanSettings(settingsPath, bundledSettingsPath, "medium", authPath);
	} finally {
		Object.defineProperty(process.versions, "node", { value: originalVersion, configurable: true });
	}

	const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as { packages?: string[] };
	assert.deepEqual(settings.packages, [...CORE_PACKAGE_SOURCES]);
	for (const source of NATIVE_PACKAGE_SOURCES) {
		assert.equal((settings.packages as string[] | undefined)?.includes(source), false);
	}
	assert.equal((settings.packages as string[] | undefined)?.includes("npm:@samfp/pi-memory"), false);
});
