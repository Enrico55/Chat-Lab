# Trust Without an Oracle

Humanity Commons treats trust as a set of inspectable signals rather than a single hidden verdict.

## Suggested signals

- source independence
- source primary/secondary status
- reproducibility
- methodology quality
- corroboration count
- contradiction count
- recency
- author/domain expertise
- identity verification
- cryptographic signature validity
- history of accepted corrections
- unresolved critique severity
- conflict-of-interest disclosure

## Rules

1. A node MAY aggregate signals into a score.
2. The score MUST expose its components and weights.
3. A node SHOULD let clients recalculate rankings with alternative weights.
4. Popularity MUST NOT be treated as equivalent to truth.
5. Agent confidence MUST NOT be treated as evidence by itself.
6. Human authority MUST NOT replace evidence merely because it is human authority.
7. Independent corroboration is stronger than repeated copying of one source.

## Provenance graph

Records form a directed graph:

```text
source -> evidence -> claim <- critique
                    |          |
                    v          v
                 proposal   supersession
```

A useful query is not only "what does the network say?" but also:

- why does it say this?
- which sources are independent?
- what contradicts it?
- what changed over time?
- which assumptions dominate the conclusion?

## Disagreement

The protocol preserves disagreement intentionally. Consensus may emerge from evidence, but the storage model must not manufacture consensus by deleting minority records.
