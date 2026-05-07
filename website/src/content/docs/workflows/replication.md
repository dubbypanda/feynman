---
title: Replication
description: Plan or execute a replication of a paper's experiments and claims.
section: Workflows
order: 5
---

The replication workflow helps you plan and execute reproductions of published experiments, benchmark results, or specific claims. It generates a detailed replication plan, identifies potential pitfalls, and can guide you through the execution step by step.

## Usage

From the REPL:

```
/replicate arxiv:2401.12345
```

```
/replicate "The claim that sparse attention achieves 95% of dense attention quality at 60% compute"
```

From the CLI:

```bash
feynman replicate "paper or claim"
```

You can point the workflow at a full paper for a comprehensive replication plan, or at a specific claim for a focused reproduction.

## How it works

The replication workflow starts with the researcher agent reading the target paper and extracting every detail needed for reproduction: model architecture, hyperparameters, training schedule, dataset preparation, evaluation protocol, and hardware requirements. It cross-references these details against the codebase (if available) using the same machinery as the code audit workflow.

For ML training, fine-tuning, benchmark, or dataset-heavy targets, replication includes a recipe pass before execution planning. That pass links each claimed result to the exact dataset, method, hyperparameters, compute assumptions, metric, and code path that produced it. When a candidate uses Hugging Face resources, Feynman can inspect dataset metadata, splits, features, and small repo files through the [Hugging Face Hub tools](/docs/tools/hugging-face).

Next, the workflow generates a structured replication plan that breaks the experiment into discrete steps, estimates compute and time requirements, and identifies where the paper is underspecified. For each underspecified detail, it suggests reasonable defaults based on common practices in the field and flags the assumption as a potential source of divergence.

The plan also includes a risk assessment: which parts of the experiment are most likely to cause replication failure, what tolerance to expect for numerical results, and which claims are most sensitive to implementation details.

## Output format

The replication plan includes:

- **Requirements** -- Hardware, software, data, and estimated compute cost
- **Recipe Extraction** -- Dataset, method, hyperparameters, metric, code path, and verification status for ML-heavy targets
- **Step-by-step Plan** -- Ordered steps from environment setup through final evaluation
- **Underspecified Details** -- Where the paper leaves out information needed for replication
- **Risk Assessment** -- Which steps are most likely to cause divergence from reported results
- **Success Criteria** -- What results would constitute a successful replication

## Iterative execution

After generating the plan, you can execute the replication interactively. Feynman walks you through each step, helps you write the code, monitors training runs, and compares intermediate results against the paper's reported values. When results diverge, it helps diagnose whether the cause is an implementation difference, a hyperparameter mismatch, or a genuine replication failure.
