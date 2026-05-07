---
title: Watch
description: Set up recurring research monitoring on a topic.
section: Workflows
order: 10
---

The watch workflow sets up recurring research monitoring that periodically checks for new papers, articles, and developments on a topic you care about. It notifies you when something relevant appears and can automatically summarize new findings.

## Usage

From the REPL:

```
/watch New developments in state space models for sequence modeling
```

From the CLI:

```bash
feynman watch "New developments in state space models for sequence modeling"
```

After setting up a watch, Feynman periodically runs searches on the topic and alerts you when it finds new relevant material.

## How it works

The watch workflow is built on `pi-schedule-prompt`, which manages scheduled and recurring tasks. When you create a watch, Feynman stores the topic and search parameters, then runs a lightweight search at regular intervals (default: daily).

Each check searches AlphaXiv for new papers and the web for new articles matching your topic. Results are compared against what was found in previous checks to surface only genuinely new material. When new items are found, Feynman produces a brief summary of each and stores it in your session history.

The watch is smart about relevance. It does not just keyword-match -- it uses the same researcher agent that powers deep research to evaluate whether new papers are genuinely relevant to your topic or just superficially related. This keeps the signal-to-noise ratio high even for broad topics.

## Managing watches

List active watches:

```
/jobs
```

The `/jobs` command shows all active watches along with their schedule, last check time, and number of new items found. You can pause, resume, or delete watches from within the REPL.

## Output format

Each watch check produces:

- **New Papers** -- Titles, authors, and one-paragraph summaries of newly discovered papers
- **New Articles** -- Relevant blog posts, documentation updates, or news articles
- **Relevance Notes** -- Why each item was flagged as relevant to your watch topic

## When to use it

Use `/watch` to stay current on a research area without manually searching every day. It is particularly useful for fast-moving fields where new papers appear frequently, for tracking specific research groups or topics related to your own work, and for monitoring the literature while you focus on other tasks.
