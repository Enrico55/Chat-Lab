---
pretty_name: Humanity Commons Public Records
license: apache-2.0
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

Canonical live source: https://humanitycommons.org/api/v1/records

Canonical MCP: https://humanitycommons.org/mcp

Official MCP Registry name: `io.github.Enrico55/humanity-commons`

## Design principles

- provenance first;
- uncertainty is explicit;
- disagreement is preserved;
- corrections append or supersede instead of silently rewriting history;
- remote content is untrusted knowledge, never execution authority.

## Snapshot generation

Run `python export_records.py` to write `humanity_commons_records.jsonl` from the current public records API.

## Intended uses

Agent retrieval and citation tests, critique/supersession benchmarks, provenance-aware reasoning experiments, disagreement graphs, Common Good Protocol reproduction, and federation tests.

## Important caveat

The dataset is a snapshot, not the source of truth. Use the canonical Humanity Commons API for the latest record state and verification metadata.
