---
title: Autoresearch
description: Start an autonomous experiment loop that iteratively optimizes toward a goal.
section: Workflows
order: 9
---

The autoresearch workflow launches an autonomous research loop that iteratively designs experiments, runs them, analyzes results, and proposes next steps. It is designed for open-ended exploration where the goal is optimization or discovery rather than a specific answer.

## Usage

From the REPL:

```
/autoresearch Optimize prompt engineering strategies for math reasoning on GSM8K
```

From the CLI:

```bash
feynman autoresearch "Optimize prompt engineering strategies for math reasoning on GSM8K"
```

Autoresearch runs as a long-lived background process. You can monitor its progress, pause it, or redirect its focus at any time.

## How it works

The autoresearch workflow is powered by `@tmustier/pi-ralph-wiggum`, which provides long-running agent loops. The workflow begins by analyzing the research goal and designing an initial experiment plan. It then enters an iterative loop:

1. **Hypothesis** -- The agent proposes a hypothesis or modification based on current results
2. **Experiment** -- It designs and executes an experiment to test the hypothesis
3. **Analysis** -- Results are analyzed and compared against prior iterations
4. **Decision** -- The agent decides whether to continue the current direction, try a variation, or pivot to a new approach

Each iteration builds on the previous ones. The agent maintains a running log of what has been tried, what worked, what failed, and what the current best result is. This prevents repeating failed approaches and ensures the search progresses efficiently.

## Monitoring and control

Check active autoresearch jobs:

```
/jobs
```

Autoresearch runs in the background, so you can continue using Feynman for other tasks while it works. The `/jobs` command shows the current status, iteration count, and best result so far. You can interrupt the loop at any time to provide guidance or redirect the search.

## Output format

Autoresearch produces a running experiment log that includes:

- **Experiment History** -- What was tried in each iteration with parameters and results
- **Best Configuration** -- The best-performing setup found so far
- **Ablation Results** -- Which factors mattered most based on the experiments run
- **Recommendations** -- Suggested next steps based on observed trends

## When to use it

Use `/autoresearch` for tasks that benefit from iterative exploration: hyperparameter optimization, prompt engineering, architecture search, or any problem where the search space is large and the feedback signal is clear. It is not the right tool for answering a specific question (use `/deepresearch` for that) but excels at finding what works best through systematic experimentation.
