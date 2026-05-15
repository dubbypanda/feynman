import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { patchPiAgentCoreSource } from "../../scripts/lib/pi-agent-core-patch.mjs";
import { patchPiEditorSource, patchPiInteractiveThemeSource, patchPiTuiSource } from "../../scripts/lib/pi-tui-patch.mjs";

function patchFileIfPresent(path: string, patchSource: (source: string) => string): boolean {
	if (!existsSync(path)) {
		return false;
	}
	const source = readFileSync(path, "utf8");
	const patched = patchSource(source);
	if (patched === source) {
		return false;
	}
	writeFileSync(path, patched, "utf8");
	return true;
}

export function patchPiRuntimeNodeModules(appRoot: string): boolean {
	const nodeModuleRoots = [
		resolve(appRoot, "node_modules"),
		resolve(appRoot, ".feynman", "npm", "node_modules"),
	];
	let changed = false;
	for (const nodeModulesPath of nodeModuleRoots) {
		changed = patchFileIfPresent(
			resolve(nodeModulesPath, "@mariozechner", "pi-agent-core", "dist", "agent-loop.js"),
			patchPiAgentCoreSource,
		) || changed;
		changed = patchFileIfPresent(
			resolve(nodeModulesPath, "@mariozechner", "pi-tui", "dist", "tui.js"),
			patchPiTuiSource,
		) || changed;
		changed = patchFileIfPresent(
			resolve(nodeModulesPath, "@mariozechner", "pi-tui", "dist", "components", "editor.js"),
			patchPiEditorSource,
		) || changed;
		changed = patchFileIfPresent(
			resolve(nodeModulesPath, "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "theme", "theme.js"),
			patchPiInteractiveThemeSource,
		) || changed;
	}
	return changed;
}
