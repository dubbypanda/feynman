import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { patchPiRuntimeNodeModules } from "../src/pi/runtime-patches.js";

const SOURCE = `
async function prepareToolCall(currentContext, assistantMessage, toolCall, config, signal) {
    const tool = currentContext.tools?.find((t) => t.name === toolCall.name);
    if (!tool) {
        return {
            kind: "immediate",
            result: createErrorToolResult(\`Tool \${toolCall.name} not found\`),
            isError: true,
        };
    }
    try {
        const preparedToolCall = prepareToolCallArguments(tool, toolCall);
        const validatedArgs = validateToolArguments(tool, preparedToolCall);
        if (config.beforeToolCall) {
            const beforeResult = await config.beforeToolCall({
                assistantMessage,
                toolCall,
                args: validatedArgs,
                context: currentContext,
            }, signal);
        }
        return {
            kind: "prepared",
            toolCall,
            tool,
            args: validatedArgs,
        };
    }
    catch (error) {
        return {
            kind: "immediate",
            result: createErrorToolResult(error instanceof Error ? error.message : String(error)),
            isError: true,
        };
    }
}
`;

const TUI_SOURCE = `
        const renderEnd = Math.min(lastChanged, newLines.length - 1);
        for (let i = firstChanged; i <= renderEnd; i++) {
            if (i > firstChanged)
                buffer += "\\r\\n";
            buffer += "\\x1b[2K"; // Clear current line
            const line = newLines[i];
            const isImage = isImageLine(line);
            if (!isImage && visibleWidth(line) > width) {
                // Log all lines to crash file for debugging
                const crashLogPath = path.join(os.homedir(), ".pi", "agent", "pi-crash.log");
                const crashData = [
                    \`Crash at \${new Date().toISOString()}\`,
                    \`Terminal width: \${width}\`,
                    \`Line \${i} visible width: \${visibleWidth(line)}\`,
                    "",
                    "=== All rendered lines ===",
                    ...newLines.map((l, idx) => \`[\${idx}] (w=\${visibleWidth(l)}) \${l}\`),
                    "",
                ].join("\\n");
                fs.mkdirSync(path.dirname(crashLogPath), { recursive: true });
                fs.writeFileSync(crashLogPath, crashData);
                // Clean up terminal state before throwing
                this.stop();
                const errorMsg = [
                    \`Rendered line \${i} exceeds terminal width (\${visibleWidth(line)} > \${width}).\`,
                    "",
                    "This is likely caused by a custom TUI component not truncating its output.",
                    "Use visibleWidth() to measure and truncateToWidth() to truncate lines.",
                    "",
                    \`Debug log written to: \${crashLogPath}\`,
                ].join("\\n");
                throw new Error(errorMsg);
            }
            buffer += line;
        }
`;

const EDITOR_SOURCE = `
import { getSegmenter, isPunctuationChar, isWhitespaceChar, truncateToWidth, visibleWidth } from "../utils.js";

export class Editor {
    render(width) {
        const layoutLines = this.layoutText(width);
        return layoutLines.map((line) => line.text);
    }
    handleInput(data) {
        return data;
    }
}
`;

const THEME_SOURCE = `
export function getEditorTheme() {
    return {
        borderColor: (text) => theme.fg("borderMuted", text),
        selectList: getSelectListTheme(),
    };
}
export function getSettingsListTheme() {
    return {};
}
`;

test("patchPiRuntimeNodeModules patches installed Pi runtime files", async () => {
	const appRoot = mkdtempSync(join(tmpdir(), "feynman-runtime-patches-"));
	const agentLoopPath = join(appRoot, "node_modules", "@mariozechner", "pi-agent-core", "dist", "agent-loop.js");
	const tuiPath = join(appRoot, "node_modules", "@mariozechner", "pi-tui", "dist", "tui.js");
	const editorPath = join(appRoot, "node_modules", "@mariozechner", "pi-tui", "dist", "components", "editor.js");
	const themePath = join(appRoot, "node_modules", "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "theme", "theme.js");
	await mkdir(dirname(agentLoopPath), { recursive: true });
	await mkdir(dirname(tuiPath), { recursive: true });
	await mkdir(dirname(editorPath), { recursive: true });
	await mkdir(dirname(themePath), { recursive: true });
	writeFileSync(agentLoopPath, SOURCE, "utf8");
	writeFileSync(tuiPath, TUI_SOURCE, "utf8");
	writeFileSync(editorPath, EDITOR_SOURCE, "utf8");
	writeFileSync(themePath, THEME_SOURCE, "utf8");

	assert.equal(patchPiRuntimeNodeModules(appRoot), true);

	const patched = readFileSync(agentLoopPath, "utf8");
	assert.match(patched, /function normalizeFeynmanToolAlias/);
	assert.match(patched, /\["google:search", "web_search"\]/);
	assert.match(patched, /\["search_web", "web_search"\]/);
	assert.match(patched, /\["fetch", "fetch_content"\]/);
	assert.match(patched, /prepareToolCallArguments\(tool, effectiveToolCall\)/);
	const patchedTui = readFileSync(tuiPath, "utf8");
	assert.match(patchedTui, /line = sliceByColumn\(line, 0, width, true\)/);
	assert.doesNotMatch(patchedTui, /throw new Error\(errorMsg\)/);
	assert.match(readFileSync(editorPath, "utf8"), /displayText = styleInput\(before\) \+ marker \+ styleInput\(after\)/);
	assert.match(readFileSync(themePath, "utf8"), /input: \(text\) => theme\.fg\("text", text\)/);
	assert.equal(patchPiRuntimeNodeModules(appRoot), false);
});

test("patchPiRuntimeNodeModules patches the vendored runtime workspace", async () => {
	const appRoot = mkdtempSync(join(tmpdir(), "feynman-workspace-runtime-patches-"));
	const agentLoopPath = join(appRoot, ".feynman", "npm", "node_modules", "@mariozechner", "pi-agent-core", "dist", "agent-loop.js");
	const tuiPath = join(appRoot, ".feynman", "npm", "node_modules", "@mariozechner", "pi-tui", "dist", "tui.js");
	const editorPath = join(appRoot, ".feynman", "npm", "node_modules", "@mariozechner", "pi-tui", "dist", "components", "editor.js");
	const themePath = join(appRoot, ".feynman", "npm", "node_modules", "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "theme", "theme.js");
	await mkdir(dirname(agentLoopPath), { recursive: true });
	await mkdir(dirname(tuiPath), { recursive: true });
	await mkdir(dirname(editorPath), { recursive: true });
	await mkdir(dirname(themePath), { recursive: true });
	writeFileSync(agentLoopPath, SOURCE, "utf8");
	writeFileSync(tuiPath, TUI_SOURCE, "utf8");
	writeFileSync(editorPath, EDITOR_SOURCE, "utf8");
	writeFileSync(themePath, THEME_SOURCE, "utf8");

	assert.equal(patchPiRuntimeNodeModules(appRoot), true);

	assert.match(readFileSync(agentLoopPath, "utf8"), /function normalizeFeynmanToolAlias/);
	assert.match(readFileSync(tuiPath, "utf8"), /line = sliceByColumn\(line, 0, width, true\)/);
	assert.match(readFileSync(editorPath, "utf8"), /displayText = styleInput\(before\) \+ marker \+ styleInput\(after\)/);
	assert.match(readFileSync(themePath, "utf8"), /input: \(text\) => theme\.fg\("text", text\)/);
	assert.equal(patchPiRuntimeNodeModules(appRoot), false);
});

test("patchPiRuntimeNodeModules is a no-op when Pi agent-core is absent", () => {
	const appRoot = mkdtempSync(join(tmpdir(), "feynman-runtime-patches-missing-"));

	assert.equal(patchPiRuntimeNodeModules(appRoot), false);
});
