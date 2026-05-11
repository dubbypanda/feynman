import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import {
	applyFeynmanPackageManagerEnv,
	buildPiArgs,
	buildPiEnv,
	resolvePiPaths,
	toNodeImportSpecifier,
	validatePiInstallation,
} from "../src/pi/runtime.js";

test("buildPiArgs includes configured runtime paths and prompt", () => {
	const args = buildPiArgs({
		appRoot: "/repo/feynman",
		workingDir: "/workspace",
		sessionDir: "/sessions",
		feynmanAgentDir: "/home/.feynman/agent",
		mode: "rpc",
		initialPrompt: "hello",
		explicitModelSpec: "openai:gpt-5.4",
		thinkingLevel: "medium",
	});

	assert.deepEqual(args, [
		"--session-dir",
		"/sessions",
		"--extension",
		"/repo/feynman/extensions/research-tools.ts",
		"--prompt-template",
		"/repo/feynman/prompts",
		"--mode",
		"rpc",
		"--model",
		"openai:gpt-5.4",
		"--thinking",
		"medium",
		"hello",
	]);
});

test("buildPiArgs omits thinking arg when launch thinking is not explicit", () => {
	const args = buildPiArgs({
		appRoot: "/repo/feynman",
		workingDir: "/workspace",
		sessionDir: "/sessions",
		feynmanAgentDir: "/home/.feynman/agent",
		mode: "rpc",
		initialPrompt: "hello",
	});

	assert.equal(args.includes("--thinking"), false);
});

test("buildPiEnv wires Feynman paths into the Pi environment", () => {
	const previousUppercasePrefix = process.env.NPM_CONFIG_PREFIX;
	const previousLowercasePrefix = process.env.npm_config_prefix;
	const previousOtelServiceName = process.env.OTEL_SERVICE_NAME;
	const previousOtelServiceVersion = process.env.OTEL_SERVICE_VERSION;
	const previousPiOtelServiceName = process.env.PI_OTEL_SERVICE_NAME;
	const previousPiOtelServiceVersion = process.env.PI_OTEL_SERVICE_VERSION;
	process.env.NPM_CONFIG_PREFIX = "/tmp/global-prefix";
	process.env.npm_config_prefix = "/tmp/global-prefix-lower";
	delete process.env.OTEL_SERVICE_NAME;
	delete process.env.OTEL_SERVICE_VERSION;
	delete process.env.PI_OTEL_SERVICE_NAME;
	delete process.env.PI_OTEL_SERVICE_VERSION;

	const env = buildPiEnv({
		appRoot: "/repo/feynman",
		workingDir: "/workspace",
		sessionDir: "/sessions",
		feynmanAgentDir: "/home/.feynman/agent",
		feynmanVersion: "0.1.5",
	});

	try {
		assert.equal(env.FEYNMAN_SESSION_DIR, "/sessions");
		assert.equal(env.FEYNMAN_BIN_PATH, "/repo/feynman/bin/feynman.js");
		assert.equal(env.FEYNMAN_PI_CLI_PATH, "/repo/feynman/node_modules/@mariozechner/pi-coding-agent/dist/cli.js");
		assert.equal(env.FEYNMAN_MEMORY_DIR, "/home/.feynman/memory");
		assert.equal(env.FEYNMAN_NPM_PREFIX, "/home/.feynman/npm-global");
		assert.equal(env.NPM_CONFIG_PREFIX, "/home/.feynman/npm-global");
		assert.equal(env.npm_config_prefix, "/home/.feynman/npm-global");
		assert.equal(env.FEYNMAN_CODING_AGENT_DIR, "/home/.feynman/agent");
		assert.equal(env.PI_CODING_AGENT_DIR, "/home/.feynman/agent");
		assert.equal(env.OTEL_SERVICE_NAME, undefined);
		assert.equal(env.OTEL_SERVICE_VERSION, undefined);
		assert.ok(
			env.PATH?.startsWith(
				"/repo/feynman/node_modules/.bin:/repo/feynman/.feynman/npm/node_modules/.bin:/home/.feynman/npm-global/bin:",
			),
		);
	} finally {
		if (previousUppercasePrefix === undefined) {
			delete process.env.NPM_CONFIG_PREFIX;
		} else {
			process.env.NPM_CONFIG_PREFIX = previousUppercasePrefix;
		}
		if (previousLowercasePrefix === undefined) {
			delete process.env.npm_config_prefix;
		} else {
			process.env.npm_config_prefix = previousLowercasePrefix;
		}
		if (previousOtelServiceName === undefined) {
			delete process.env.OTEL_SERVICE_NAME;
		} else {
			process.env.OTEL_SERVICE_NAME = previousOtelServiceName;
		}
		if (previousOtelServiceVersion === undefined) {
			delete process.env.OTEL_SERVICE_VERSION;
		} else {
			process.env.OTEL_SERVICE_VERSION = previousOtelServiceVersion;
		}
		if (previousPiOtelServiceName === undefined) {
			delete process.env.PI_OTEL_SERVICE_NAME;
		} else {
			process.env.PI_OTEL_SERVICE_NAME = previousPiOtelServiceName;
		}
		if (previousPiOtelServiceVersion === undefined) {
			delete process.env.PI_OTEL_SERVICE_VERSION;
		} else {
			process.env.PI_OTEL_SERVICE_VERSION = previousPiOtelServiceVersion;
		}
	}
});

test("buildPiEnv uses pre-resolved executable paths when provided", () => {
	const paths = resolvePiPaths("/repo/feynman");
	const env = buildPiEnv(
		{
			appRoot: "/repo/feynman",
			workingDir: "/workspace",
			sessionDir: "/sessions",
			feynmanAgentDir: "/home/.feynman/agent",
		},
		paths,
		{
			pandoc: "/opt/test/bin/pandoc",
			mermaid: "/opt/test/bin/mmdc",
			browser: "/opt/test/bin/chrome",
		},
	);

	assert.equal(env.PANDOC_PATH, "/opt/test/bin/pandoc");
	assert.equal(env.MERMAID_CLI_PATH, "/opt/test/bin/mmdc");
	assert.equal(env.PUPPETEER_EXECUTABLE_PATH, "/opt/test/bin/chrome");
});

test("applyFeynmanPackageManagerEnv pins npm globals to the Feynman prefix", () => {
	const previousFeynmanPrefix = process.env.FEYNMAN_NPM_PREFIX;
	const previousUppercasePrefix = process.env.NPM_CONFIG_PREFIX;
	const previousLowercasePrefix = process.env.npm_config_prefix;

	try {
		const prefix = applyFeynmanPackageManagerEnv("/home/.feynman/agent");

		assert.equal(prefix, "/home/.feynman/npm-global");
		assert.equal(process.env.FEYNMAN_NPM_PREFIX, "/home/.feynman/npm-global");
		assert.equal(process.env.NPM_CONFIG_PREFIX, "/home/.feynman/npm-global");
		assert.equal(process.env.npm_config_prefix, "/home/.feynman/npm-global");
	} finally {
		if (previousFeynmanPrefix === undefined) {
			delete process.env.FEYNMAN_NPM_PREFIX;
		} else {
			process.env.FEYNMAN_NPM_PREFIX = previousFeynmanPrefix;
		}
		if (previousUppercasePrefix === undefined) {
			delete process.env.NPM_CONFIG_PREFIX;
		} else {
			process.env.NPM_CONFIG_PREFIX = previousUppercasePrefix;
		}
		if (previousLowercasePrefix === undefined) {
			delete process.env.npm_config_prefix;
		} else {
			process.env.npm_config_prefix = previousLowercasePrefix;
		}
	}
});

test("resolvePiPaths includes the Promise.withResolvers polyfill path", () => {
	const paths = resolvePiPaths("/repo/feynman");

	assert.equal(paths.promisePolyfillPath, "/repo/feynman/dist/system/promise-polyfill.js");
});

test("resolvePiPaths falls back to the vendored runtime workspace in packed installs", () => {
	const appRoot = mkdtempSync(join(tmpdir(), "feynman-packed-runtime-"));
	const piDist = join(appRoot, ".feynman", "npm", "node_modules", "@mariozechner", "pi-coding-agent", "dist");
	mkdirSync(piDist, { recursive: true });
	writeFileSync(join(piDist, "cli.js"), "", "utf8");
	writeFileSync(join(piDist, "main.js"), "", "utf8");
	mkdirSync(join(appRoot, "dist", "pi"), { recursive: true });
	mkdirSync(join(appRoot, "dist", "system"), { recursive: true });
	mkdirSync(join(appRoot, "extensions"), { recursive: true });
	mkdirSync(join(appRoot, "prompts"), { recursive: true });
	writeFileSync(join(appRoot, "dist", "pi", "pi-cli-wrapper.js"), "", "utf8");
	writeFileSync(join(appRoot, "dist", "system", "promise-polyfill.js"), "", "utf8");
	writeFileSync(join(appRoot, "extensions", "research-tools.ts"), "", "utf8");

	const paths = resolvePiPaths(appRoot);

	assert.equal(paths.piPackageRoot, join(appRoot, ".feynman", "npm", "node_modules", "@mariozechner", "pi-coding-agent"));
	assert.equal(paths.piCliPath, join(piDist, "cli.js"));
	assert.deepEqual(validatePiInstallation(appRoot), []);
});

test("toNodeImportSpecifier converts absolute preload paths to file URLs", () => {
	assert.equal(
		toNodeImportSpecifier("/repo/feynman/dist/system/promise-polyfill.js"),
		pathToFileURL("/repo/feynman/dist/system/promise-polyfill.js").href,
	);
	assert.equal(toNodeImportSpecifier("tsx"), "tsx");
});
