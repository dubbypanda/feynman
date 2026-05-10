const SEARCH_BY_EMBEDDING = [
	"export async function searchByEmbedding(query) {",
	"  return await callTool('embedding_similarity_search', { query });",
	"}",
].join("\n");

const SEARCH_BY_KEYWORD = [
	"export async function searchByKeyword(query) {",
	"  return await callTool('full_text_papers_search', { query });",
	"}",
].join("\n");

const AGENTIC_SEARCH = [
	"export async function agenticSearch(query) {",
	"  return await callTool('agentic_paper_retrieval', { query });",
	"}",
].join("\n");

const FALLBACK_HELPERS = `
function shouldFallbackToDiscoverPapers(err) {
  const message = getErrorMessage(err);
  return (
    message.includes('Tool embedding_similarity_search not found') ||
    message.includes('Tool full_text_papers_search not found') ||
    message.includes('Tool agentic_paper_retrieval not found') ||
    message.includes('embedding_similarity_search not found') ||
    message.includes('full_text_papers_search not found') ||
    message.includes('agentic_paper_retrieval not found')
  );
}

async function discoverPapers(query, mode) {
  const args = {
    question: query,
    keywords: query,
    difficulty: mode === 'keyword' ? 'easy' : 'graduate',
  };
  return await callTool('discover_papers', args);
}
`;

const PATCHED_SEARCH_BY_EMBEDDING = [
	"export async function searchByEmbedding(query) {",
	"  try {",
	"    return await callTool('embedding_similarity_search', { query });",
	"  } catch (err) {",
	"    if (shouldFallbackToDiscoverPapers(err)) return await discoverPapers(query, 'semantic');",
	"    throw err;",
	"  }",
	"}",
].join("\n");

const PATCHED_SEARCH_BY_KEYWORD = [
	"export async function searchByKeyword(query) {",
	"  try {",
	"    return await callTool('full_text_papers_search', { query });",
	"  } catch (err) {",
	"    if (shouldFallbackToDiscoverPapers(err)) return await discoverPapers(query, 'keyword');",
	"    throw err;",
	"  }",
	"}",
].join("\n");

const PATCHED_AGENTIC_SEARCH = [
	"export async function agenticSearch(query) {",
	"  try {",
	"    return await callTool('agentic_paper_retrieval', { query });",
	"  } catch (err) {",
	"    if (shouldFallbackToDiscoverPapers(err)) return await discoverPapers(query, 'agentic');",
	"    throw err;",
	"  }",
	"}",
].join("\n");

export function patchAlphaHubSearchSource(source) {
	if (source.includes("function shouldFallbackToDiscoverPapers(")) {
		return source;
	}
	if (!source.includes(SEARCH_BY_EMBEDDING) && !source.includes(SEARCH_BY_KEYWORD) && !source.includes(AGENTIC_SEARCH)) {
		return source;
	}

	let patched = source;
	const anchor = "async function callTool(name, args) {";
	if (patched.includes(anchor)) {
		patched = patched.replace(anchor, `${FALLBACK_HELPERS}\n${anchor}`);
	}
	patched = patched
		.replace(SEARCH_BY_EMBEDDING, PATCHED_SEARCH_BY_EMBEDDING)
		.replace(SEARCH_BY_KEYWORD, PATCHED_SEARCH_BY_KEYWORD)
		.replace(AGENTIC_SEARCH, PATCHED_AGENTIC_SEARCH);
	return patched;
}
