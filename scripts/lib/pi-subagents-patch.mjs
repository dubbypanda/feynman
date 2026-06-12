export const PI_SUBAGENTS_PATCH_TARGETS = [
	"index.ts",
	"agents.ts",
	"artifacts.ts",
	"run-history.ts",
	"skills.ts",
	"chain-clarify.ts",
	"pi-spawn.ts",
	"subagent-executor.ts",
	"schemas.ts",
	"src/extension/index.ts",
	"src/agents/agents.ts",
	"src/shared/artifacts.ts",
	"src/runs/shared/run-history.ts",
	"src/agents/skills.ts",
	"src/runs/foreground/chain-clarify.ts",
	"src/runs/shared/pi-spawn.ts",
	"src/runs/foreground/subagent-executor.ts",
	"src/extension/schemas.ts",
];

const RESOLVE_PI_AGENT_DIR_HELPER = [
	"function resolvePiAgentDir(): string {",
	'	const configured = process.env.FEYNMAN_CODING_AGENT_DIR?.trim() || process.env.PI_CODING_AGENT_DIR?.trim();',
	'	if (!configured) return path.join(os.homedir(), ".pi", "agent");',
	'	return configured.startsWith("~/") ? path.join(os.homedir(), configured.slice(2)) : configured;',
	"}",
].join("\n");

const PI_SPAWN_ORIGINAL_ARGV_BLOCK = [
	"\tconst argv1 = deps.argv1 ?? process.argv[1];",
	"",
	"\tif (argv1) {",
	"\t\tconst argvPath = normalizePath(argv1);",
	"\t\tif (isRunnableNodeScript(argvPath, existsSync)) {",
	"\t\t\treturn argvPath;",
	"\t\t}",
	"\t}",
].join("\n");

const PI_SPAWN_FEYNMAN_ARGV_BLOCK = [
	"\tconst argv1 = deps.argv1 ?? process.argv[1];",
	"\tconst feynmanPiCliPath = process.env.FEYNMAN_PI_CLI_PATH;",
	"\tif (feynmanPiCliPath) {",
	"\t\tconst cliPath = normalizePath(feynmanPiCliPath);",
	"\t\tif (isRunnableNodeScript(cliPath, existsSync)) return cliPath;",
	"\t}",
	"",
	"\tif (argv1) {",
	"\t\tconst argvPath = normalizePath(argv1);",
	"\t\tif (path.basename(argvPath) !== \"pi-cli-wrapper.js\" && isRunnableNodeScript(argvPath, existsSync)) {",
	"\t\t\treturn argvPath;",
	"\t\t}",
	"\t}",
].join("\n");

const PI_SPAWN_FEYNMAN_ARGV_BLOCK_WITH_WRAPPER_MAIN = [
	"\tconst argv1 = deps.argv1 ?? process.argv[1];",
	"\tconst argv2 = deps.argv2 ?? process.argv[2];",
	"\tconst feynmanPiCliPath = process.env.FEYNMAN_PI_CLI_PATH;",
	"\tif (feynmanPiCliPath) {",
	"\t\tconst cliPath = normalizePath(feynmanPiCliPath);",
	"\t\tif (isRunnableNodeScript(cliPath, existsSync)) return cliPath;",
	"\t}",
	"",
	"\tif (argv1) {",
	"\t\tconst argvPath = normalizePath(argv1);",
	"\t\tif (path.basename(argvPath) !== \"pi-cli-wrapper.js\" && isRunnableNodeScript(argvPath, existsSync)) {",
	"\t\t\treturn argvPath;",
	"\t\t}",
	"\t\tif (path.basename(argvPath) === \"pi-cli-wrapper.js\" && argv2) {",
	"\t\t\tconst wrapperPiCliPath = path.join(path.dirname(normalizePath(argv2)), \"cli.js\");",
	"\t\t\tif (isRunnableNodeScript(wrapperPiCliPath, existsSync)) return wrapperPiCliPath;",
	"\t\t}",
	"\t}",
].join("\n");

function injectResolvePiAgentDirHelper(source) {
	if (source.includes("function resolvePiAgentDir(): string {")) {
		return source;
	}

	const lines = source.split("\n");
	let insertAt = 0;
	let importSeen = false;
	let importOpen = false;

	for (let index = 0; index < lines.length; index += 1) {
		const trimmed = lines[index].trim();
		if (!importSeen) {
			if (trimmed === "" || trimmed.startsWith("/**") || trimmed.startsWith("*") || trimmed.startsWith("*/")) {
				insertAt = index + 1;
				continue;
			}
			if (trimmed.startsWith("import ")) {
				importSeen = true;
				importOpen = !trimmed.endsWith(";");
				insertAt = index + 1;
				continue;
			}
			break;
		}

		if (trimmed.startsWith("import ")) {
			importOpen = !trimmed.endsWith(";");
			insertAt = index + 1;
			continue;
		}
		if (importOpen) {
			if (trimmed.endsWith(";")) importOpen = false;
			insertAt = index + 1;
			continue;
		}
		if (trimmed === "") {
			insertAt = index + 1;
			continue;
		}
		insertAt = index;
		break;
	}

	return [...lines.slice(0, insertAt), "", RESOLVE_PI_AGENT_DIR_HELPER, "", ...lines.slice(insertAt)].join("\n");
}

function replaceAll(source, from, to) {
	return source.split(from).join(to);
}

export function stripPiSubagentBuiltinModelSource(source) {
	if (!source.startsWith("---\n")) {
		return source;
	}

	const endIndex = source.indexOf("\n---", 4);
	if (endIndex === -1) {
		return source;
	}

	const frontmatter = source.slice(4, endIndex);
	const nextFrontmatter = frontmatter
		.split("\n")
		.filter((line) => !/^\s*model\s*:/.test(line))
		.join("\n");
	return `---\n${nextFrontmatter}${source.slice(endIndex)}`;
}

export function patchPiSubagentsSource(relativePath, source) {
	const target = relativePath.split("/").pop();
	let patched = source;

	switch (target) {
		case "index.ts":
			patched = replaceAll(
				patched,
				'const configPath = path.join(os.homedir(), ".pi", "agent", "extensions", "subagent", "config.json");',
				'const configPath = path.join(resolvePiAgentDir(), "extensions", "subagent", "config.json");',
			);
			patched = replaceAll(
				patched,
				"• PARALLEL: { tasks: [{agent,task,count?}, ...], concurrency?: number, worktree?: true } - concurrent execution (worktree: isolate each task in a git worktree)",
				"• PARALLEL: { tasks: [{agent,task,count?,output?}, ...], concurrency?: number, worktree?: true } - concurrent execution (output: per-task file target, worktree: isolate each task in a git worktree)",
			);
			break;
		case "agents.ts":
			patched = replaceAll(
				patched,
				'const userDir = path.join(os.homedir(), ".pi", "agent", "agents");',
				'const userDir = path.join(resolvePiAgentDir(), "agents");',
			);
			patched = replaceAll(
				patched,
				[
					'export function discoverAgents(cwd: string, scope: AgentScope): AgentDiscoveryResult {',
					'\tconst userDirOld = path.join(os.homedir(), ".pi", "agent", "agents");',
					'\tconst userDirNew = path.join(os.homedir(), ".agents");',
				].join("\n"),
				[
					'export function discoverAgents(cwd: string, scope: AgentScope): AgentDiscoveryResult {',
					'\tconst userDir = path.join(resolvePiAgentDir(), "agents");',
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				[
					'\tconst userAgentsOld = scope === "project" ? [] : loadAgentsFromDir(userDirOld, "user");',
					'\tconst userAgentsNew = scope === "project" ? [] : loadAgentsFromDir(userDirNew, "user");',
					'\tconst userAgents = [...userAgentsOld, ...userAgentsNew];',
				].join("\n"),
				'\tconst userAgents = scope === "project" ? [] : loadAgentsFromDir(userDir, "user");',
			);
			patched = replaceAll(
				patched,
				[
					'const userDirOld = path.join(os.homedir(), ".pi", "agent", "agents");',
					'const userDirNew = path.join(os.homedir(), ".agents");',
				].join("\n"),
				'const userDir = path.join(resolvePiAgentDir(), "agents");',
			);
			patched = replaceAll(
				patched,
				[
					'\tconst user = [',
					'\t\t...loadAgentsFromDir(userDirOld, "user"),',
					'\t\t...loadAgentsFromDir(userDirNew, "user"),',
					'\t];',
				].join("\n"),
				'\tconst user = loadAgentsFromDir(userDir, "user");',
			);
			patched = replaceAll(
				patched,
				[
					'\tconst chains = [',
					'\t\t...loadChainsFromDir(userDirOld, "user"),',
					'\t\t...loadChainsFromDir(userDirNew, "user"),',
					'\t\t...(projectDir ? loadChainsFromDir(projectDir, "project") : []),',
					'\t];',
				].join("\n"),
				[
					'\tconst chains = [',
					'\t\t...loadChainsFromDir(userDir, "user"),',
					'\t\t...(projectDir ? loadChainsFromDir(projectDir, "project") : []),',
					'\t];',
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				'\tconst userDir = fs.existsSync(userDirNew) ? userDirNew : userDirOld;',
				'\tconst userDir = path.join(resolvePiAgentDir(), "agents");',
			);
			break;
		case "artifacts.ts":
			patched = replaceAll(
				patched,
				'const sessionsBase = path.join(os.homedir(), ".pi", "agent", "sessions");',
				'const sessionsBase = path.join(resolvePiAgentDir(), "sessions");',
			);
			break;
		case "run-history.ts":
			patched = replaceAll(
				patched,
				'const HISTORY_PATH = path.join(os.homedir(), ".pi", "agent", "run-history.jsonl");',
				'const HISTORY_PATH = path.join(resolvePiAgentDir(), "run-history.jsonl");',
			);
			break;
		case "skills.ts":
			patched = replaceAll(
				patched,
				'const AGENT_DIR = path.join(os.homedir(), ".pi", "agent");',
				"const AGENT_DIR = resolvePiAgentDir();",
			);
			break;
		case "chain-clarify.ts":
			patched = replaceAll(
				patched,
				'const dir = path.join(os.homedir(), ".pi", "agent", "agents");',
				'const dir = path.join(resolvePiAgentDir(), "agents");',
			);
			break;
		case "pi-spawn.ts":
			patched = replaceAll(patched, PI_SPAWN_ORIGINAL_ARGV_BLOCK, PI_SPAWN_FEYNMAN_ARGV_BLOCK_WITH_WRAPPER_MAIN);
			patched = replaceAll(patched, PI_SPAWN_FEYNMAN_ARGV_BLOCK, PI_SPAWN_FEYNMAN_ARGV_BLOCK_WITH_WRAPPER_MAIN);
			if (!patched.includes("\targv2?: string;")) {
				patched = replaceAll(
					patched,
					"\texecPath?: string;\n\targv1?: string;",
					"\texecPath?: string;\n\targv1?: string;\n\targv2?: string;",
				);
			}
			break;
		case "subagent-executor.ts":
			patched = replaceAll(
				patched,
				[
					"\tcwd?: string;",
					"\tcount?: number;",
					"\tmodel?: string;",
					"\tskill?: string | string[] | boolean;",
				].join("\n"),
				[
					"\tcwd?: string;",
					"\tcount?: number;",
					"\tmodel?: string;",
					"\tskill?: string | string[] | boolean;",
					"\toutput?: string | false;",
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				[
					"\t\t\tcwd: task.cwd,",
					"\t\t\t...(modelOverrides[index] ? { model: modelOverrides[index] } : {}),",
				].join("\n"),
				[
					"\t\t\tcwd: task.cwd,",
					"\t\t\toutput: task.output,",
					"\t\t\t...(modelOverrides[index] ? { model: modelOverrides[index] } : {}),",
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				[
					"\t\tcwd: task.cwd,",
					"\t\t...(modelOverrides[index] ? { model: modelOverrides[index] } : {}),",
				].join("\n"),
				[
					"\t\tcwd: task.cwd,",
					"\t\toutput: task.output,",
					"\t\t...(modelOverrides[index] ? { model: modelOverrides[index] } : {}),",
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				[
					"\t\t\t\tcwd: t.cwd,",
					"\t\t\t\t...(modelOverrides[i] ? { model: modelOverrides[i] } : {}),",
				].join("\n"),
				[
					"\t\t\t\tcwd: t.cwd,",
					"\t\t\t\toutput: t.output,",
					"\t\t\t\t...(modelOverrides[i] ? { model: modelOverrides[i] } : {}),",
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				[
					"\t\tcwd: t.cwd,",
					"\t\t...(modelOverrides[i] ? { model: modelOverrides[i] } : {}),",
				].join("\n"),
				[
					"\t\tcwd: t.cwd,",
					"\t\toutput: t.output,",
					"\t\t...(modelOverrides[i] ? { model: modelOverrides[i] } : {}),",
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				[
					"\t\tconst behaviors = agentConfigs.map((c, i) =>",
					"\t\t\tresolveStepBehavior(c, { skills: skillOverrides[i] }),",
					"\t\t);",
				].join("\n"),
				[
					"\t\tconst behaviors = agentConfigs.map((c, i) =>",
					"\t\t\tresolveStepBehavior(c, { output: tasks[i]?.output, skills: skillOverrides[i] }),",
					"\t\t);",
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				"\tconst behaviors = agentConfigs.map((config) => resolveStepBehavior(config, {}));",
				"\tconst behaviors = agentConfigs.map((config, i) => resolveStepBehavior(config, { output: tasks[i]?.output, skills: skillOverrides[i] }));",
			);
			patched = replaceAll(
				patched,
				[
					"\t\tconst taskCwd = resolveParallelTaskCwd(task, input.paramsCwd, input.worktreeSetup, index);",
					"\t\treturn runSync(input.ctx.cwd, input.agents, task.agent, input.taskTexts[index]!, {",
				].join("\n"),
				[
					"\t\tconst taskCwd = resolveParallelTaskCwd(task, input.paramsCwd, input.worktreeSetup, index);",
					"\t\tconst outputPath = typeof input.behaviors[index]?.output === \"string\"",
					"\t\t\t? resolveSingleOutputPath(input.behaviors[index]?.output, input.ctx.cwd, taskCwd)",
					"\t\t\t: undefined;",
					"\t\tconst taskText = injectSingleOutputInstruction(input.taskTexts[index]!, outputPath);",
					"\t\treturn runSync(input.ctx.cwd, input.agents, task.agent, taskText, {",
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				[
					"\t\t\tmaxOutput: input.maxOutput,",
					"\t\t\tmaxSubagentDepth: input.maxSubagentDepths[index],",
				].join("\n"),
				[
					"\t\t\tmaxOutput: input.maxOutput,",
					"\t\t\toutputPath,",
					"\t\t\tmaxSubagentDepth: input.maxSubagentDepths[index],",
				].join("\n"),
			);
			break;
		case "schemas.ts":
			patched = replaceAll(
				patched,
				[
					"\tcwd: Type.Optional(Type.String()),",
					'\tcount: Type.Optional(Type.Integer({ minimum: 1, description: "Repeat this parallel task N times with the same settings." })),',
					'\tmodel: Type.Optional(Type.String({ description: "Override model for this task (e.g. \'google/gemini-3-pro\')" })),',
				].join("\n"),
				[
					"\tcwd: Type.Optional(Type.String()),",
					'\tcount: Type.Optional(Type.Integer({ minimum: 1, description: "Repeat this parallel task N times with the same settings." })),',
					'\toutput: Type.Optional(Type.Any({ description: "Output file for this parallel task (string), or false to disable. Relative paths resolve against cwd." })),',
					'\tmodel: Type.Optional(Type.String({ description: "Override model for this task (e.g. \'google/gemini-3-pro\')" })),',
				].join("\n"),
			);
			patched = replaceAll(
				patched,
				'tasks: Type.Optional(Type.Array(TaskItem, { description: "PARALLEL mode: [{agent, task, count?}, ...]" })),',
				'tasks: Type.Optional(Type.Array(TaskItem, { description: "PARALLEL mode: [{agent, task, count?, output?}, ...]" })),',
			);
			break;
		default:
			return source;
	}

	if (patched === source) {
		return source;
	}

	return patched.includes("resolvePiAgentDir()") ? injectResolvePiAgentDirHelper(patched) : patched;
}
