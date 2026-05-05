const OVERFLOW_THROW_BLOCK = `            const line = newLines[i];
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
            buffer += line;`;

const OVERFLOW_TRUNCATE_BLOCK = `            let line = newLines[i];
            const isImage = isImageLine(line);
            if (!isImage && visibleWidth(line) > width) {
                line = sliceByColumn(line, 0, width, true);
            }
            buffer += line;`;

export function patchPiTuiSource(source) {
	if (source.includes("line = sliceByColumn(line, 0, width, true);")) {
		return source;
	}
	if (!source.includes(OVERFLOW_THROW_BLOCK)) {
		return source;
	}
	return source.replace(OVERFLOW_THROW_BLOCK, OVERFLOW_TRUNCATE_BLOCK);
}
