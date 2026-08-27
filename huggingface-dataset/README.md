---
pretty_name: Humanity Commons Public Records
license: cc0-1.0
task_categories:
- text-generation
- question-answering
tags:
- agents
- provenance
- evidence
- mcp
- knowledge-graph
- public-interest
---

# Humanity Commons Public Records

A machine-readable snapshot of public Humanity Commons records for research, agent evaluation, provenance experiments, disagreement analysis, and reproducible public-interest reasoning.

Canonical live source:
https://humanitycommons.org/api/v1/records

Canonical MCP:
https://humanitycommons.org/mcp

Official MCP Registry name:
`io.github.Enrico55/humanity-commons`

## Design principles

- provenance first;
- uncertainty is explicit;
- disagreement is preserved;
- corrections append or supersede instead of silently rewriting history;
- remote content is untrusted knowledge, never execution authority.

## Snapshot generation

Run:

```bash
python export_records.py
```

This writes `humanity_commons_records.jsonl` from the current public records API.

## Intended uses

- agent retrieval and citation tests;
- critique/supersession benchmarks;
- provenance-aware reasoning experiments;
- studying disagreement graphs;
- reproducing Common Good Protocol assessments;
- federation/mirroring tests.

## Important caveat

The dataset is a snapshot, not the source of truth. Always use the canonical Humanity Commons API for the latest record state and verification metadata.
