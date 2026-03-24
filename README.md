# Feynman

The open source AI research agent

```bash
curl -fsSL https://raw.githubusercontent.com/getcompanion-ai/feynman/main/scripts/install/install.sh | bash
```

```powershell
irm https://raw.githubusercontent.com/getcompanion-ai/feynman/main/scripts/install/install.ps1 | iex
```

Or install the npm fallback:

```bash
npm install -g @companion-ai/feynman
```

```bash
feynman setup
feynman
```

---

## What you type → what happens

| Prompt | Result |
| --- | --- |
| `feynman "what do we know about scaling laws"` | Searches papers and web, produces a cited research brief |
| `feynman deepresearch "mechanistic interpretability"` | Multi-agent investigation with parallel researchers, synthesis, verification |
| `feynman lit "RLHF alternatives"` | Literature review with consensus, disagreements, open questions |
| `feynman audit 2401.12345` | Compares paper claims against the public codebase |
| `feynman replicate "chain-of-thought improves math"` | Asks where to run, then builds a replication plan |
| `feynman "summarize this PDF" --prompt paper.pdf` | One-shot mode, no REPL |

---

## Workflows

Ask naturally or use slash commands as shortcuts.

| Command | What it does |
| --- | --- |
| `/deepresearch <topic>` | Source-heavy multi-agent investigation |
| `/lit <topic>` | Literature review from paper search and primary sources |
| `/review <artifact>` | Simulated peer review with severity and revision plan |
| `/audit <item>` | Paper vs. codebase mismatch audit |
| `/replicate <paper>` | Replication plan with environment selection |
| `/compare <topic>` | Source comparison matrix |
| `/draft <topic>` | Paper-style draft from research findings |
| `/autoresearch <idea>` | Autonomous experiment loop |
| `/watch <topic>` | Recurring research watch |

---

## Agents

Four bundled research agents, dispatched automatically or via subagent commands.

- **Researcher** — gather evidence across papers, web, repos, docs
- **Reviewer** — simulated peer review with severity-graded feedback
- **Writer** — structured drafts from research notes
- **Verifier** — inline citations, source URL verification, dead link cleanup

---

## Tools

- **[AlphaXiv](https://www.alphaxiv.org/)** — paper search, Q&A, code reading, persistent annotations
- **Docker** — isolated container execution for safe experiments on your machine
- **[Agent Computer](https://agentcomputer.ai)** — secure cloud execution for long-running research and GPU workloads
- **Web search** — Gemini or Perplexity, zero-config default via signed-in Chromium
- **Session search** — optional indexed recall across prior research sessions
- **Preview** — browser and PDF export of generated artifacts

---

## CLI

```bash
feynman                             # REPL
feynman setup                       # guided setup
feynman doctor                      # diagnose everything
feynman status                      # current config summary
feynman model login [provider]      # model auth
feynman model set <provider/model>  # set default model
feynman alpha login                 # alphaXiv auth
feynman packages list               # core vs optional packages
feynman packages install memory     # opt into heavier packages on demand
feynman search status               # web search config
```

---

## How it works

Built on [Pi](https://github.com/badlogic/pi-mono) for the agent runtime, [alphaXiv](https://www.alphaxiv.org/) for paper search and analysis, [Docker](https://www.docker.com/) for isolated local execution, and [Agent Computer](https://agentcomputer.ai) for secure cloud workloads

Every output is source-grounded — claims link to papers, docs, or repos with direct URLs

---

## Contributing

```bash
git clone https://github.com/getcompanion-ai/feynman.git
cd feynman && npm install && npm run start
```

[Docs](https://feynman.companion.ai/docs) · [MIT License](LICENSE)
