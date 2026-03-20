# Feynman

`feynman` is a research-first CLI built on `@mariozechner/pi-coding-agent`.

It keeps the useful parts of a coding agent:
- file access
- shell execution
- persistent sessions
- skills
- custom extensions

But it biases the runtime toward research work:
- literature review
- paper lookup
- source comparison
- research memo writing
- paper and report drafting
- replication planning when relevant

The primary paper backend is `@companion-ai/alpha-hub` and your alphaXiv account.
The rest of the workflow is augmented through a curated `.pi/settings.json` package stack.

## Install

```bash
npm install -g @companion-ai/feynman
```

Then authenticate alphaXiv and start the CLI:

```bash
feynman --alpha-login
feynman
```

For local development:

```bash
cd /Users/advaitpaliwal/Companion/Code/feynman
npm install
cp .env.example .env
npm run start
```

Feynman uses Pi under the hood, but the user-facing entrypoint is `feynman`, not `pi`.
When you run `feynman`, it launches the real Pi interactive TUI with Feynman's research extensions, skills, prompts, and package stack preloaded.

## Commands

Inside the REPL:

- `/help` shows local commands
- `/new` starts a new persisted session
- `/exit` quits
- `/lit-review <topic>` expands the literature-review prompt template
- `/replicate <paper or claim>` expands the replication prompt template
- `/reading-list <topic>` expands the reading-list prompt template
- `/research-memo <topic>` expands the general research memo prompt template
- `/compare-sources <topic>` expands the source comparison prompt template
- `/paper-code-audit <item>` expands the paper/code audit prompt template
- `/paper-draft <topic>` expands the paper-style writing prompt template
- `/research-memo <topic>` expands the general research memo prompt template

## Custom Tools

The starter extension adds:

- `alpha_search` for alphaXiv-backed paper discovery
- `alpha_get_paper` for fetching paper reports or raw text
- `alpha_ask_paper` for targeted paper Q&A
- `alpha_annotate_paper` for persistent local notes
- `alpha_list_annotations` for recall across sessions
- `alpha_read_code` for reading a paper repository

Feynman uses `@companion-ai/alpha-hub` directly in-process rather than shelling out to the CLI.

## Curated Pi Stack

Feynman loads a lean research stack from [.pi/settings.json](/Users/advaitpaliwal/Companion/Code/feynman/.pi/settings.json):

- `pi-subagents` for parallel literature gathering and decomposition
- `pi-docparser` for PDFs, Office docs, spreadsheets, and images
- `pi-web-access` for broader web, GitHub, PDF, and media access
- `pi-markdown-preview` for polished Markdown and LaTeX-heavy research writeups
- `@aliou/pi-processes` for long-running experiments and log tails
- `pi-zotero` for citation-library workflows

The default expectation is source-grounded outputs with explicit `Sources` sections containing direct URLs.

## Layout

```text
feynman/
├── extensions/   # Custom research tools
├── papers/       # Polished paper-style drafts and writeups
├── prompts/      # Slash-style prompt templates
├── skills/       # Research workflows
└── src/          # Minimal REPL wrapper around pi-coding-agent
```
