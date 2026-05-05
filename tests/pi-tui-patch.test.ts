import test from "node:test";
import assert from "node:assert/strict";

import { patchPiTuiSource } from "../scripts/lib/pi-tui-patch.mjs";

const SOURCE = `
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

test("patchPiTuiSource truncates overwide rendered lines instead of throwing", () => {
	const patched = patchPiTuiSource(SOURCE);

	assert.match(patched, /let line = newLines\[i\]/);
	assert.match(patched, /line = sliceByColumn\(line, 0, width, true\)/);
	assert.doesNotMatch(patched, /Rendered line .* exceeds terminal width/);
	assert.doesNotMatch(patched, /pi-crash\.log/);
	assert.doesNotMatch(patched, /throw new Error\(errorMsg\)/);
});

test("patchPiTuiSource is idempotent", () => {
	const once = patchPiTuiSource(SOURCE);
	const twice = patchPiTuiSource(once);
	assert.equal(twice, once);
});
