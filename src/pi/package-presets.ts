import type { PackageSource } from "@mariozechner/pi-coding-agent";

export const CORE_PACKAGE_SOURCES = [
	"npm:@companion-ai/alpha-hub",
	"npm:pi-subagents",
	"npm:pi-btw",
	"npm:pi-docparser",
	"npm:pi-web-access",
	"npm:pi-markdown-preview",
	"npm:@walterra/pi-charts",
	"npm:pi-mermaid",
	"npm:@aliou/pi-processes",
	"npm:pi-zotero",
	"npm:@kaiserlich-dev/pi-session-search",
	"npm:pi-schedule-prompt",
	"npm:@samfp/pi-memory",
	"npm:@tmustier/pi-ralph-wiggum",
] as const;

const LEGACY_CORE_PACKAGE_SOURCES = [
	"npm:@companion-ai/alpha-hub",
	"npm:pi-subagents",
	"npm:pi-btw",
	"npm:pi-docparser",
	"npm:pi-web-access",
	"npm:pi-markdown-preview",
	"npm:@walterra/pi-charts",
	"npm:pi-mermaid",
	"npm:@aliou/pi-processes",
	"npm:pi-zotero",
	"npm:@kaiserlich-dev/pi-session-search",
	"npm:pi-schedule-prompt",
	"npm:@samfp/pi-memory",
	"npm:@tmustier/pi-ralph-wiggum",
] as const;

const LEGACY_TELEMETRY_CORE_PACKAGE_SOURCES = [
	...CORE_PACKAGE_SOURCES,
	"npm:@devkade/pi-opentelemetry",
] as const;

export const NATIVE_PACKAGE_SOURCES = [
	"npm:@kaiserlich-dev/pi-session-search",
	"npm:@samfp/pi-memory",
] as const;

const CORE_PACKAGE_UPDATE_ALIASES: Record<string, (typeof CORE_PACKAGE_SOURCES)[number]> = {
	memory: "npm:@samfp/pi-memory",
	"pi-memory": "npm:@samfp/pi-memory",
	"session-search": "npm:@kaiserlich-dev/pi-session-search",
	"pi-session-search": "npm:@kaiserlich-dev/pi-session-search",
};

export const MAX_NATIVE_PACKAGE_NODE_MAJOR = 24;

export const OPTIONAL_PACKAGE_PRESETS = {
	"generative-ui": {
		description: "Interactive Glimpse UI widgets.",
		sources: ["npm:pi-generative-ui"],
		platforms: ["darwin"],
	},
} as const;

export type OptionalPackagePresetName = keyof typeof OPTIONAL_PACKAGE_PRESETS;
export type OptionalPackagePresetAlias = OptionalPackagePresetName | "ui" | "all-extras";

const LEGACY_DEFAULT_PACKAGE_SETS = [
	[
		...CORE_PACKAGE_SOURCES,
		"npm:pi-generative-ui",
	],
	[
		...LEGACY_TELEMETRY_CORE_PACKAGE_SOURCES,
	],
	[
		...LEGACY_TELEMETRY_CORE_PACKAGE_SOURCES,
		"npm:pi-generative-ui",
	],
	[
		...LEGACY_CORE_PACKAGE_SOURCES,
	],
	[
		...LEGACY_CORE_PACKAGE_SOURCES,
		"npm:pi-generative-ui",
	],
] as const;

const LEGACY_DEFAULT_PACKAGE_SOURCES = [
	...CORE_PACKAGE_SOURCES,
	"npm:pi-generative-ui",
] as const;

function arraysMatchAsSets(left: readonly string[], right: readonly string[]): boolean {
	if (left.length !== right.length) {
		return false;
	}

	const rightSet = new Set(right);
	return left.every((entry) => rightSet.has(entry));
}

export function shouldPruneLegacyDefaultPackages(packages: PackageSource[] | undefined): boolean {
	if (!Array.isArray(packages)) {
		return false;
	}
	if (packages.some((entry) => typeof entry !== "string")) {
		return false;
	}
	return LEGACY_DEFAULT_PACKAGE_SETS.some((legacySources) =>
		arraysMatchAsSets(packages as string[], legacySources),
	) || arraysMatchAsSets(packages as string[], LEGACY_DEFAULT_PACKAGE_SOURCES);
}

function parseNodeMajor(version: string): number {
	const [major = "0"] = version.replace(/^v/, "").split(".");
	return Number.parseInt(major, 10) || 0;
}

export function supportsNativePackageSources(version = process.versions.node): boolean {
	return parseNodeMajor(version) <= MAX_NATIVE_PACKAGE_NODE_MAJOR;
}

export function filterPackageSourcesForCurrentNode<T extends string>(sources: readonly T[], version = process.versions.node): T[] {
	if (supportsNativePackageSources(version)) {
		return [...sources];
	}

	const blocked = new Set<string>(NATIVE_PACKAGE_SOURCES);
	return sources.filter((source) => !blocked.has(source));
}

export function normalizeOptionalPackagePresetName(name: string): OptionalPackagePresetName | "all-extras" | undefined {
	const normalized = name.trim().toLowerCase();
	if (normalized === "ui") {
		return "generative-ui";
	}
	if (normalized === "all-extras") {
		return "all-extras";
	}
	return normalized in OPTIONAL_PACKAGE_PRESETS ? (normalized as OptionalPackagePresetName) : undefined;
}

export function isOptionalPackagePresetSupported(name: OptionalPackagePresetName, platform: NodeJS.Platform = process.platform): boolean {
	const platforms = OPTIONAL_PACKAGE_PRESETS[name].platforms as readonly NodeJS.Platform[] | undefined;
	return !platforms || platforms.includes(platform);
}

export function getOptionalPackagePresetSources(name: string, platform: NodeJS.Platform = process.platform): string[] | undefined {
	const normalized = normalizeOptionalPackagePresetName(name);
	if (!normalized) return undefined;

	if (normalized === "all-extras") {
		const sources = listOptionalPackagePresets(platform).flatMap((preset) => preset.sources);
		return sources.length > 0 ? sources : undefined;
	}

	if (!isOptionalPackagePresetSupported(normalized, platform)) return undefined;
	return [...OPTIONAL_PACKAGE_PRESETS[normalized].sources];
}

export function listOptionalPackagePresets(platform?: NodeJS.Platform): Array<{
	name: OptionalPackagePresetName;
	description: string;
	sources: string[];
}> {
	const currentPlatform = platform ?? process.platform;
	return Object.entries(OPTIONAL_PACKAGE_PRESETS).filter(([name]) =>
		isOptionalPackagePresetSupported(name as OptionalPackagePresetName, currentPlatform),
	).map(([name, preset]) => ({
		name: name as OptionalPackagePresetName,
		description: preset.description,
		sources: [...preset.sources],
	}));
}

export function listOptionalPackagePresetInstallTargets(platform?: NodeJS.Platform): string[] {
	const names = listOptionalPackagePresets(platform).map((preset) => preset.name);
	return names.length > 0 ? [...names, "all-extras"] : [];
}

export function resolvePackageUpdateSources(name: string, platform: NodeJS.Platform = process.platform): string[] {
	const trimmed = name.trim();
	if (!trimmed) return [];
	if (trimmed.startsWith("npm:") || trimmed.startsWith("github:") || trimmed.startsWith("file:")) {
		return [trimmed];
	}

	const normalized = trimmed.toLowerCase();
	const coreSource = CORE_PACKAGE_UPDATE_ALIASES[normalized];
	if (coreSource) return [coreSource];

	const optionalSources = getOptionalPackagePresetSources(normalized, platform);
	return optionalSources ?? [trimmed];
}
