---
title: Session Search
description: Search prior Feynman session transcripts to recall past research.
section: Tools
order: 4
---

The session search tool recovers prior Feynman work from stored session transcripts. Every Feynman session is persisted to disk, and session search lets you find and reference past research, findings, and generated artifacts without starting over.

## Installation

Session search is an optional package. Install it with:

```bash
feynman packages install session-search
```

It is available through Node.js 22.x while the upstream sqlite dependency remains native-bound. On newer Node majors, Feynman skips it instead of making first launch depend on a local C++ build toolchain.

Once installed, the `/search` slash command and automatic session recall become available in all future sessions.

## Usage

Inside the REPL, invoke session search directly:

```
/search transformer scaling laws
```

You can also reference prior work naturally in conversation. Feynman invokes session search automatically when you mention previous research or ask to continue earlier work. For example, saying "pick up where I left off on protein folding" triggers a session search behind the scenes.

## What it searches

Session search indexes the full contents of your session history:

- Full session transcripts including your prompts and Feynman's responses
- Tool outputs and agent results from workflows like deep research and literature review
- Generated artifacts such as drafts, reports, and comparison matrices
- Metadata like timestamps, topics, and workflow types

The search uses both keyword matching and semantic similarity to find relevant past work. Results include the session ID, timestamp, and relevant excerpts so you can quickly identify which session contains the information you need.

## When to use it

Session search is valuable when you want to pick up a previous research thread without rerunning an expensive workflow, find specific findings or citations from a past deep research session, reference prior analysis in a new research context, or check what you have already investigated on a topic before launching a new round.

## How it works

The `@kaiserlich-dev/pi-session-search` package provides the underlying search and indexing. Sessions are stored in `~/.feynman/sessions/` by default (configurable with `--session-dir`). The index is built incrementally as new sessions complete, so search stays fast even with hundreds of past sessions.
