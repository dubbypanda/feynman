import test from "node:test";
import assert from "node:assert/strict";

import { patchAlphaHubSearchSource } from "../scripts/lib/alpha-hub-search-patch.mjs";

const SOURCE = `
function getErrorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

async function callTool(name, args) {
  return { name, args };
}

export async function searchByEmbedding(query) {
  return await callTool('embedding_similarity_search', { query });
}

export async function searchByKeyword(query) {
  return await callTool('full_text_papers_search', { query });
}

export async function agenticSearch(query) {
  return await callTool('agentic_paper_retrieval', { query });
}
`;

test("patchAlphaHubSearchSource falls back to discover_papers for removed alphaXiv search tools", () => {
	const patched = patchAlphaHubSearchSource(SOURCE);

	assert.match(patched, /function shouldFallbackToDiscoverPapers/);
	assert.match(patched, /callTool\('discover_papers', args\)/);
	assert.match(patched, /question: query/);
	assert.match(patched, /keywords: query/);
	assert.match(patched, /difficulty: mode === 'keyword' \? 'easy' : 'graduate'/);
	assert.match(patched, /Tool embedding_similarity_search not found/);
	assert.match(patched, /return await callTool\('embedding_similarity_search', \{ query \}\)/);
	assert.match(patched, /return await discoverPapers\(query, 'semantic'\)/);
	assert.match(patched, /return await discoverPapers\(query, 'keyword'\)/);
	assert.match(patched, /return await discoverPapers\(query, 'agentic'\)/);
});

test("patchAlphaHubSearchSource is idempotent", () => {
	const once = patchAlphaHubSearchSource(SOURCE);
	const twice = patchAlphaHubSearchSource(once);
	assert.equal(twice, once);
});
