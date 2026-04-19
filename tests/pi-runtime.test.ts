import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

import { applyFeynmanPackageManagerEnv, buildPiArgs, buildPiEnv, resolvePiPaths, toNodeImportSpecifier } from "../src/pi/runtime.js";

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
	process.env.NPM_CONFIG_PREFIX = "/tmp/global-prefix";
	process.env.npm_config_prefix = "/tmp/global-prefix-lower";

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

test("toNodeImportSpecifier converts absolute preload paths to file URLs", () => {
	assert.equal(
		toNodeImportSpecifier("/repo/feynman/dist/system/promise-polyfill.js"),
		pathToFileURL("/repo/feynman/dist/system/promise-polyfill.js").href,
	);
	assert.equal(toNodeImportSpecifier("tsx"), "tsx");
});
