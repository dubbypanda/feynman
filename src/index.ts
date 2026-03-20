import "dotenv/config";

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import {
	getUserName as getAlphaUserName,
	isLoggedIn as isAlphaLoggedIn,
	login as loginAlpha,
	logout as logoutAlpha,
} from "@companion-ai/alpha-hub/lib";
import {
	ModelRegistry,
	AuthStorage,
} from "@mariozechner/pi-coding-agent";

import { FEYNMAN_SYSTEM_PROMPT } from "./feynman-prompt.js";

type ThinkingLevel = "off" | "low" | "medium" | "high";

function printHelp(): void {
	console.log(`Feynman commands:
	  /help                     Show this help
	  /alpha-login              Sign in to alphaXiv
	  /alpha-logout             Clear alphaXiv auth
	  /alpha-status             Show alphaXiv auth status
	  /new                      Start a fresh persisted session
	  /exit                     Quit the REPL
	  /lit-review <topic>       Expand the literature review prompt template
	  /replicate <paper>        Expand the replication prompt template
	  /reading-list <topic>     Expand the reading list prompt template
	  /research-memo <topic>    Expand the general research memo prompt template
	  /compare-sources <topic>  Expand the source comparison prompt template
	  /paper-code-audit <item>  Expand the paper/code audit prompt template
	  /paper-draft <topic>      Expand the paper-style writing prompt template

	CLI flags:
  --prompt "<text>"         Run one prompt and exit
  --alpha-login             Sign in to alphaXiv and exit
  --alpha-logout            Clear alphaXiv auth and exit
  --alpha-status            Show alphaXiv auth status and exit
  --model provider:model    Force a specific model
  --thinking level          off | low | medium | high
  --cwd /path/to/workdir    Working directory for tools
  --session-dir /path       Session storage directory`);
}

function parseModelSpec(spec: string, modelRegistry: ModelRegistry) {
	const trimmed = spec.trim();
	const separator = trimmed.includes(":") ? ":" : trimmed.includes("/") ? "/" : null;
	if (!separator) {
		return undefined;
	}

	const [provider, ...rest] = trimmed.split(separator);
	const id = rest.join(separator);
	if (!provider || !id) {
		return undefined;
	}

	return modelRegistry.find(provider, id);
}

function normalizeThinkingLevel(value: string | undefined): ThinkingLevel | undefined {
	if (!value) {
		return undefined;
	}

	const normalized = value.toLowerCase();
	if (normalized === "off" || normalized === "low" || normalized === "medium" || normalized === "high") {
		return normalized;
	}

	return undefined;
}

function patchEmbeddedPiBranding(piPackageRoot: string): void {
	const packageJsonPath = resolve(piPackageRoot, "package.json");
	const cliPath = resolve(piPackageRoot, "dist", "cli.js");

	if (existsSync(packageJsonPath)) {
		const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
			piConfig?: { name?: string; configDir?: string };
		};
		if (pkg.piConfig?.name !== "feynman") {
			pkg.piConfig = {
				...pkg.piConfig,
				name: "feynman",
			};
			writeFileSync(packageJsonPath, JSON.stringify(pkg, null, "\t") + "\n", "utf8");
		}
	}

	if (existsSync(cliPath)) {
		const cliSource = readFileSync(cliPath, "utf8");
		if (cliSource.includes('process.title = "pi";')) {
			writeFileSync(cliPath, cliSource.replace('process.title = "pi";', 'process.title = "feynman";'), "utf8");
		}
	}
}

function choosePreferredModel(
	availableModels: Array<{ provider: string; id: string }>,
): { provider: string; id: string } | undefined {
	const preferences = [
		{ provider: "anthropic", id: "claude-opus-4-6" },
		{ provider: "anthropic", id: "claude-opus-4-5" },
		{ provider: "anthropic", id: "claude-sonnet-4-5" },
		{ provider: "openai", id: "gpt-5.4" },
		{ provider: "openai", id: "gpt-5" },
	];

	for (const preferred of preferences) {
		const match = availableModels.find(
			(model) => model.provider === preferred.provider && model.id === preferred.id,
		);
		if (match) {
			return match;
		}
	}

	return availableModels[0];
}

function normalizeFeynmanSettings(
	settingsPath: string,
	bundledSettingsPath: string,
	defaultThinkingLevel: ThinkingLevel,
	authPath: string,
): void {
	let settings: Record<string, unknown> = {};

	if (existsSync(settingsPath)) {
		try {
			settings = JSON.parse(readFileSync(settingsPath, "utf8"));
		} catch {
			settings = {};
		}
	}
	else if (existsSync(bundledSettingsPath)) {
		try {
			settings = JSON.parse(readFileSync(bundledSettingsPath, "utf8"));
		} catch {
			settings = {};
		}
	}

	if (Array.isArray(settings.packages)) {
		settings.packages = settings.packages.filter(
			(entry) => entry !== "npm:@kaiserlich-dev/pi-session-search",
		);
	}

	if (!settings.defaultThinkingLevel) {
		settings.defaultThinkingLevel = defaultThinkingLevel;
	}
	settings.theme = "feynman";
	settings.quietStartup = true;
	settings.collapseChangelog = true;

	const authStorage = AuthStorage.create(authPath);
	const modelRegistry = new ModelRegistry(authStorage);
	const availableModels = modelRegistry.getAvailable().map((model) => ({
		provider: model.provider,
		id: model.id,
	}));

	if ((!settings.defaultProvider || !settings.defaultModel) && availableModels.length > 0) {
		const preferredModel = choosePreferredModel(availableModels);
		if (preferredModel) {
			settings.defaultProvider = preferredModel.provider;
			settings.defaultModel = preferredModel.id;
		}
	}

	writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf8");
}

function syncFeynmanTheme(appRoot: string, agentDir: string): void {
	const sourceThemePath = resolve(appRoot, ".pi", "themes", "feynman.json");
	const targetThemeDir = resolve(agentDir, "themes");
	const targetThemePath = resolve(targetThemeDir, "feynman.json");

	if (!existsSync(sourceThemePath)) {
		return;
	}

	mkdirSync(targetThemeDir, { recursive: true });
	writeFileSync(targetThemePath, readFileSync(sourceThemePath, "utf8"), "utf8");
}

async function main(): Promise<void> {
	const here = dirname(fileURLToPath(import.meta.url));
	const appRoot = resolve(here, "..");
	const piPackageRoot = resolve(appRoot, "node_modules", "@mariozechner", "pi-coding-agent");
	const piCliPath = resolve(appRoot, "node_modules", "@mariozechner", "pi-coding-agent", "dist", "cli.js");
	const feynmanAgentDir = resolve(homedir(), ".feynman", "agent");
	const bundledSettingsPath = resolve(appRoot, ".pi", "settings.json");
	patchEmbeddedPiBranding(piPackageRoot);

	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			cwd: { type: "string" },
			help: { type: "boolean" },
			"alpha-login": { type: "boolean" },
			"alpha-logout": { type: "boolean" },
			"alpha-status": { type: "boolean" },
			model: { type: "string" },
			"new-session": { type: "boolean" },
			prompt: { type: "string" },
			"session-dir": { type: "string" },
			thinking: { type: "string" },
		},
	});

	if (values.help) {
		printHelp();
		return;
	}

	const workingDir = resolve(values.cwd ?? process.cwd());
	const sessionDir = resolve(values["session-dir"] ?? resolve(homedir(), ".feynman", "sessions"));
	mkdirSync(sessionDir, { recursive: true });
	mkdirSync(feynmanAgentDir, { recursive: true });
	syncFeynmanTheme(appRoot, feynmanAgentDir);
	const feynmanSettingsPath = resolve(feynmanAgentDir, "settings.json");
	const feynmanAuthPath = resolve(feynmanAgentDir, "auth.json");
	const thinkingLevel = normalizeThinkingLevel(values.thinking ?? process.env.FEYNMAN_THINKING) ?? "medium";
	normalizeFeynmanSettings(feynmanSettingsPath, bundledSettingsPath, thinkingLevel, feynmanAuthPath);

	if (values["alpha-login"]) {
		const result = await loginAlpha();
		normalizeFeynmanSettings(feynmanSettingsPath, bundledSettingsPath, thinkingLevel, feynmanAuthPath);
		const name =
			(result.userInfo &&
			typeof result.userInfo === "object" &&
			"name" in result.userInfo &&
			typeof result.userInfo.name === "string")
				? result.userInfo.name
				: getAlphaUserName();
		console.log(name ? `alphaXiv login complete: ${name}` : "alphaXiv login complete");
		return;
	}

	if (values["alpha-logout"]) {
		logoutAlpha();
		console.log("alphaXiv auth cleared");
		return;
	}

	if (values["alpha-status"]) {
		if (isAlphaLoggedIn()) {
			const name = getAlphaUserName();
			console.log(name ? `alphaXiv logged in as ${name}` : "alphaXiv logged in");
		} else {
			console.log("alphaXiv not logged in");
		}
		return;
	}

	const explicitModelSpec = values.model ?? process.env.FEYNMAN_MODEL;
	if (explicitModelSpec) {
		const modelRegistry = new ModelRegistry(AuthStorage.create(feynmanAuthPath));
		const explicitModel = parseModelSpec(explicitModelSpec, modelRegistry);
		if (!explicitModel) {
			throw new Error(`Unknown model: ${explicitModelSpec}`);
		}
	}
	const oneShotPrompt = values.prompt;
	const initialPrompt = oneShotPrompt ?? (positionals.length > 0 ? positionals.join(" ") : undefined);

	const piArgs = [
		"--session-dir",
		sessionDir,
		"--extension",
		resolve(appRoot, "extensions", "research-tools.ts"),
		"--skill",
		resolve(appRoot, "skills"),
		"--prompt-template",
		resolve(appRoot, "prompts"),
		"--system-prompt",
		FEYNMAN_SYSTEM_PROMPT,
	];

	if (explicitModelSpec) {
		piArgs.push("--model", explicitModelSpec);
	}
	if (thinkingLevel) {
		piArgs.push("--thinking", thinkingLevel);
	}
	if (oneShotPrompt) {
		piArgs.push("-p", oneShotPrompt);
	}
	else if (initialPrompt) {
		piArgs.push(initialPrompt);
	}

	const child = spawn(process.execPath, [piCliPath, ...piArgs], {
		cwd: workingDir,
		stdio: "inherit",
		env: {
			...process.env,
			PI_CODING_AGENT_DIR: feynmanAgentDir,
			FEYNMAN_CODING_AGENT_DIR: feynmanAgentDir,
		},
	});

	await new Promise<void>((resolvePromise, reject) => {
		child.on("error", reject);
		child.on("exit", (code, signal) => {
			if (signal) {
				process.kill(process.pid, signal);
				return;
			}
			process.exitCode = code ?? 0;
			resolvePromise();
		});
	});
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
