import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { stripPiSubagentBuiltinModelSource } from "./lib/pi-subagents-patch.mjs";

const appRoot = resolve(import.meta.dirname, "..");
const settingsPath = resolve(appRoot, ".feynman", "settings.json");
const feynmanDir = resolve(appRoot, ".feynman");
const workspaceDir = resolve(appRoot, ".feynman", "npm");
const workspaceNodeModulesDir = resolve(workspaceDir, "node_modules");
const manifestPath = resolve(workspaceDir, ".runtime-manifest.json");
const workspacePackageJsonPath = resolve(workspaceDir, "package.json");
const workspaceArchivePath = resolve(feynmanDir, "runtime-workspace.tgz");
const PRUNE_VERSION = 4;

function readPackageSpecs() {
	const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
	if (!Array.isArray(settings.packages)) {
		return [];
	}

	return settings.packages
		.filter((value) => typeof value === "string" && value.startsWith("npm:"))
		.map((value) => value.slice(4));
}

function parsePackageName(spec) {
	const match = spec.match(/^(@?[^@]+(?:\/[^@]+)?)(?:@.+)?$/);
	return match?.[1] ?? spec;
}

function arraysMatch(left, right) {
	return left.length === right.length && left.every((value, index) => value === right[index]);
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
}

function childNpmInstallEnv() {
	return {
		...process.env,
		// `npm pack --dry-run` exports dry-run config to lifecycle scripts. The
		// vendored runtime workspace must still install real node_modules so the
		// publish artifact can be validated without poisoning the archive.
		npm_config_dry_run: "false",
		NPM_CONFIG_DRY_RUN: "false",
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
			? [process.env.npm_execpath, "install", "--prefer-offline", "--no-audit", "--no-fund", "--no-dry-run", "--loglevel", "error", "--prefix", workspaceDir, ...packageSpecs]
			: ["install", "--prefer-offline", "--no-audit", "--no-fund", "--no-dry-run", "--loglevel", "error", "--prefix", workspaceDir, ...packageSpecs],
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

function stripBundledPiSubagentModelPins() {
	const agentsRoot = resolve(workspaceNodeModulesDir, "pi-subagents", "agents");
	if (!existsSync(agentsRoot)) {
		return false;
	}

	let changed = false;
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
	if (stripBundledPiSubagentModelPins()) {
		writeManifest(packageSpecs);
		console.log("[feynman] stripped bundled pi-subagents model pins");
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
stripBundledPiSubagentModelPins();
writeManifest(packageSpecs);
createWorkspaceArchive();
console.log("[feynman] vendored runtime workspace ready");
