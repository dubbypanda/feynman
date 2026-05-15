import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { patchPiAgentCoreSource } from "./lib/pi-agent-core-patch.mjs";
import { patchPiExtensionLoaderSource } from "./lib/pi-extension-loader-patch.mjs";
import { patchPiEditorSource, patchPiInteractiveThemeSource, patchPiTuiSource } from "./lib/pi-tui-patch.mjs";
import { PI_WEB_ACCESS_PATCH_TARGETS, patchPiWebAccessSource } from "./lib/pi-web-access-patch.mjs";
import { PI_SUBAGENTS_PATCH_TARGETS, patchPiSubagentsSource, stripPiSubagentBuiltinModelSource } from "./lib/pi-subagents-patch.mjs";
import { patchAlphaHubSearchSource } from "./lib/alpha-hub-search-patch.mjs";

const appRoot = resolve(import.meta.dirname, "..");
const settingsPath = resolve(appRoot, ".feynman", "settings.json");
const packageJsonPath = resolve(appRoot, "package.json");
const packageLockPath = resolve(appRoot, "package-lock.json");
const feynmanDir = resolve(appRoot, ".feynman");
const workspaceDir = resolve(appRoot, ".feynman", "npm");
const workspaceNodeModulesDir = resolve(workspaceDir, "node_modules");
const manifestPath = resolve(workspaceDir, ".runtime-manifest.json");
const workspacePackageJsonPath = resolve(workspaceDir, "package.json");
const workspaceNpmConfigPath = resolve(workspaceDir, ".npmrc");
const workspaceArchivePath = resolve(feynmanDir, "runtime-workspace.tgz");
const PRUNE_VERSION = 6;
const PINNED_RUNTIME_PACKAGES = [
	"@mariozechner/pi-agent-core",
	"@mariozechner/pi-ai",
	"@mariozechner/pi-coding-agent",
	"@mariozechner/pi-tui",
	"typebox",
];
const PINNED_RUNTIME_PACKAGE_SPECS = [
	"@earendil-works/pi-agent-core@0.74.0",
	"@earendil-works/pi-ai@0.74.0",
	"@earendil-works/pi-coding-agent@0.74.0",
	"@earendil-works/pi-tui@0.74.0",
];
const NATIVE_PACKAGE_SPECS = new Set([
	"@kaiserlich-dev/pi-session-search",
]);

function supportsNativePackageSources(version = process.versions.node) {
	const [major = "0"] = version.replace(/^v/, "").split(".");
	return (Number.parseInt(major, 10) || 0) <= 22;
}

function parsePackageName(spec) {
	const match = spec.match(/^(@?[^@]+(?:\/[^@]+)?)(?:@.+)?$/);
	return match?.[1] ?? spec;
}

function filterUnsupportedPackageSpecs(packageSpecs) {
	if (supportsNativePackageSources()) return packageSpecs;
	return packageSpecs.filter((spec) => !NATIVE_PACKAGE_SPECS.has(parsePackageName(spec)));
}

function readPackageSpecs() {
	const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
	const packageSpecs = Array.isArray(settings.packages)
		? settings.packages
			.filter((value) => typeof value === "string" && value.startsWith("npm:"))
			.map((value) => value.slice(4))
		: [];

	for (const packageName of PINNED_RUNTIME_PACKAGES) {
		const version = readLockedPackageVersion(packageName);
		if (version) {
			packageSpecs.push(`${packageName}@${version}`);
		}
	}
	packageSpecs.push(...PINNED_RUNTIME_PACKAGE_SPECS);

	return filterUnsupportedPackageSpecs(Array.from(new Set(packageSpecs)));
}

function readLockedPackageVersion(packageName) {
	if (!existsSync(packageLockPath)) {
		return undefined;
	}
	try {
		const lockfile = JSON.parse(readFileSync(packageLockPath, "utf8"));
		const entry = lockfile.packages?.[`node_modules/${packageName}`];
		return typeof entry?.version === "string" ? entry.version : undefined;
	} catch {
		return undefined;
	}
}

function arraysMatch(left, right) {
	return left.length === right.length && left.every((value, index) => value === right[index]);
}

function hashFile(path) {
	if (!existsSync(path)) {
		return null;
	}
	return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function getRuntimeInputHash() {
	const hash = createHash("sha256");
	for (const path of [
		packageJsonPath,
		packageLockPath,
		settingsPath,
		resolve(appRoot, "scripts", "lib", "pi-agent-core-patch.mjs"),
		resolve(appRoot, "scripts", "lib", "pi-extension-loader-patch.mjs"),
		resolve(appRoot, "scripts", "lib", "pi-package-manager-patch.mjs"),
		resolve(appRoot, "scripts", "lib", "pi-tui-patch.mjs"),
		resolve(appRoot, "scripts", "lib", "pi-web-access-patch.mjs"),
		resolve(appRoot, "scripts", "lib", "pi-subagents-patch.mjs"),
		resolve(appRoot, "scripts", "lib", "alpha-hub-search-patch.mjs"),
	]) {
		hash.update(path);
		hash.update("\0");
		hash.update(hashFile(path) ?? "missing");
		hash.update("\0");
	}
	return hash.digest("hex");
}

function workspaceIsCurrent(packageSpecs) {
	if (!existsSync(manifestPath) || !existsSync(workspaceNodeModulesDir)) {
		return false;
	}

	try {
		const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
		if (!Array.isArray(manifest.packageSpecs) || !arraysMatch(manifest.packageSpecs, packageSpecs)) {
			return false;
		}
		if (manifest.runtimeInputHash !== getRuntimeInputHash()) {
			return false;
		}
		if (
			manifest.nodeAbi !== process.versions.modules ||
			manifest.platform !== process.platform ||
			manifest.arch !== process.arch ||
			manifest.pruneVersion !== PRUNE_VERSION
		) {
			return false;
		}

		return packageSpecs.every((spec) => existsSync(resolve(workspaceNodeModulesDir, parsePackageName(spec))));
	} catch {
		return false;
	}
}

function writeWorkspacePackageJson() {
	writeFileSync(
		workspacePackageJsonPath,
		JSON.stringify(
			{
				name: "feynman-runtime",
				private: true,
			},
			null,
			2,
		) + "\n",
		"utf8",
	);
	writeFileSync(workspaceNpmConfigPath, "", "utf8");
}

function childNpmInstallEnv() {
	return {
		...process.env,
		// `npm pack --dry-run` exports dry-run config to lifecycle scripts. The
		// vendored runtime workspace must still install real node_modules so the
		// publish artifact can be validated without poisoning the archive.
		npm_config_dry_run: "false",
		NPM_CONFIG_DRY_RUN: "false",
		npm_config_userconfig: workspaceNpmConfigPath,
		NPM_CONFIG_USERCONFIG: workspaceNpmConfigPath,
	};
}

function prepareWorkspace(packageSpecs) {
	rmSync(workspaceDir, { recursive: true, force: true });
	mkdirSync(workspaceDir, { recursive: true });
	writeWorkspacePackageJson();

	if (packageSpecs.length === 0) {
		return;
	}

	const result = spawnSync(
		process.env.npm_execpath ? process.execPath : "npm",
		process.env.npm_execpath
			? [process.env.npm_execpath, "install", "--prefer-online", "--no-audit", "--no-fund", "--no-dry-run", "--legacy-peer-deps", "--loglevel", "error", "--prefix", workspaceDir, ...packageSpecs]
			: ["install", "--prefer-online", "--no-audit", "--no-fund", "--no-dry-run", "--legacy-peer-deps", "--loglevel", "error", "--prefix", workspaceDir, ...packageSpecs],
		{ stdio: "inherit", env: childNpmInstallEnv() },
	);
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function writeManifest(packageSpecs) {
	writeFileSync(
		manifestPath,
		JSON.stringify(
			{
				packageSpecs,
				runtimeInputHash: getRuntimeInputHash(),
				generatedAt: new Date().toISOString(),
				nodeAbi: process.versions.modules,
				nodeVersion: process.version,
				platform: process.platform,
				arch: process.arch,
				pruneVersion: PRUNE_VERSION,
			},
			null,
			2,
		) + "\n",
		"utf8",
	);
}

function pruneWorkspace() {
	const result = spawnSync(process.execPath, [resolve(appRoot, "scripts", "prune-runtime-deps.mjs"), workspaceDir], {
		stdio: "inherit",
	});
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function patchBundledPiSubagents() {
	const piSubagentsRoot = resolve(workspaceNodeModulesDir, "pi-subagents");
	if (!existsSync(piSubagentsRoot)) {
		return false;
	}

	let changed = false;
	for (const relativePath of PI_SUBAGENTS_PATCH_TARGETS) {
		const entryPath = resolve(piSubagentsRoot, relativePath);
		if (!existsSync(entryPath)) continue;

		const source = readFileSync(entryPath, "utf8");
		const patched = patchPiSubagentsSource(relativePath, source);
		if (patched === source) continue;
		writeFileSync(entryPath, patched, "utf8");
		changed = true;
	}

	const agentsRoot = resolve(piSubagentsRoot, "agents");
	if (!existsSync(agentsRoot)) {
		return changed;
	}

	for (const entry of readdirSync(agentsRoot, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
		const entryPath = resolve(agentsRoot, entry.name);
		const source = readFileSync(entryPath, "utf8");
		const patched = stripPiSubagentBuiltinModelSource(source);
		if (patched === source) continue;
		writeFileSync(entryPath, patched, "utf8");
		changed = true;
	}
	return changed;
}

function patchBundledPiAgentCore() {
	const agentLoopPath = resolve(workspaceNodeModulesDir, "@mariozechner", "pi-agent-core", "dist", "agent-loop.js");
	if (!existsSync(agentLoopPath)) {
		return false;
	}

	const source = readFileSync(agentLoopPath, "utf8");
	const patched = patchPiAgentCoreSource(source);
	if (patched === source) {
		return false;
	}
	writeFileSync(agentLoopPath, patched, "utf8");
	return true;
}

function patchBundledPiTui() {
	const tuiPath = resolve(workspaceNodeModulesDir, "@mariozechner", "pi-tui", "dist", "tui.js");
	const editorPath = resolve(workspaceNodeModulesDir, "@mariozechner", "pi-tui", "dist", "components", "editor.js");
	let changed = false;

	if (existsSync(tuiPath)) {
		const source = readFileSync(tuiPath, "utf8");
		const patched = patchPiTuiSource(source);
		if (patched !== source) {
			writeFileSync(tuiPath, patched, "utf8");
			changed = true;
		}
	}

	if (existsSync(editorPath)) {
		const source = readFileSync(editorPath, "utf8");
		const patched = patchPiEditorSource(source);
		if (patched !== source) {
			writeFileSync(editorPath, patched, "utf8");
			changed = true;
		}
	}

	return changed;
}

function patchBundledPiExtensionLoader() {
	const loaderPath = resolve(
		workspaceNodeModulesDir,
		"@mariozechner",
		"pi-coding-agent",
		"dist",
		"core",
		"extensions",
		"loader.js",
	);
	if (!existsSync(loaderPath)) {
		return false;
	}

	const source = readFileSync(loaderPath, "utf8");
	const patched = patchPiExtensionLoaderSource(source);
	if (patched === source) {
		return false;
	}
	writeFileSync(loaderPath, patched, "utf8");
	return true;
}

function patchBundledPiInteractiveTheme() {
	const themePath = resolve(
		workspaceNodeModulesDir,
		"@mariozechner",
		"pi-coding-agent",
		"dist",
		"modes",
		"interactive",
		"theme",
		"theme.js",
	);
	if (!existsSync(themePath)) {
		return false;
	}

	const source = readFileSync(themePath, "utf8");
	const patched = patchPiInteractiveThemeSource(source);
	if (patched === source) {
		return false;
	}
	writeFileSync(themePath, patched, "utf8");
	return true;
}

function patchBundledPiWebAccess() {
	const piWebAccessRoot = resolve(workspaceNodeModulesDir, "pi-web-access");
	if (!existsSync(piWebAccessRoot)) {
		return false;
	}

	let changed = false;
	for (const relativePath of PI_WEB_ACCESS_PATCH_TARGETS) {
		const entryPath = resolve(piWebAccessRoot, relativePath);
		if (!existsSync(entryPath)) continue;

		const source = readFileSync(entryPath, "utf8");
		const patched = patchPiWebAccessSource(relativePath, source);
		if (patched === source) continue;
		writeFileSync(entryPath, patched, "utf8");
		changed = true;
	}
	return changed;
}

function patchBundledAlphaHub() {
	const alphaxivPath = resolve(workspaceNodeModulesDir, "@companion-ai", "alpha-hub", "src", "lib", "alphaxiv.js");
	if (!existsSync(alphaxivPath)) {
		return false;
	}

	const source = readFileSync(alphaxivPath, "utf8");
	const patched = patchAlphaHubSearchSource(source);
	if (patched === source) {
		return false;
	}
	writeFileSync(alphaxivPath, patched, "utf8");
	return true;
}

function archiveIsCurrent() {
	if (!existsSync(workspaceArchivePath) || !existsSync(manifestPath)) {
		return false;
	}

	return statSync(workspaceArchivePath).mtimeMs >= statSync(manifestPath).mtimeMs;
}

function createWorkspaceArchive() {
	rmSync(workspaceArchivePath, { force: true });

	const result = spawnSync("tar", ["-czf", workspaceArchivePath, "-C", feynmanDir, "npm"], {
		stdio: "inherit",
	});
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

const packageSpecs = readPackageSpecs();

if (workspaceIsCurrent(packageSpecs)) {
	console.log("[feynman] vendored runtime workspace already up to date");
	if (
		patchBundledPiAgentCore() ||
		patchBundledPiExtensionLoader() ||
		patchBundledPiInteractiveTheme() ||
		patchBundledPiTui() ||
		patchBundledPiWebAccess() ||
		patchBundledPiSubagents() ||
		patchBundledAlphaHub()
	) {
		writeManifest(packageSpecs);
		console.log("[feynman] patched bundled Pi runtime");
	}
	if (archiveIsCurrent()) {
		process.exit(0);
	}
	console.log("[feynman] refreshing runtime workspace archive...");
	createWorkspaceArchive();
	console.log("[feynman] runtime workspace archive ready");
	process.exit(0);
}

console.log("[feynman] preparing vendored runtime workspace...");
prepareWorkspace(packageSpecs);
pruneWorkspace();
patchBundledPiAgentCore();
patchBundledPiExtensionLoader();
patchBundledPiInteractiveTheme();
patchBundledPiTui();
patchBundledPiWebAccess();
patchBundledPiSubagents();
patchBundledAlphaHub();
writeManifest(packageSpecs);
createWorkspaceArchive();
console.log("[feynman] vendored runtime workspace ready");
