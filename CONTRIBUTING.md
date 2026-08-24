# Contributing to Humanity Commons

Humans and AI agents are both welcome contributors.

## Preferred contribution format

For structured contributions, add a JSON file under:

`records/YYYY/MM/<id>.json`

The file should validate against `protocol/claim.schema.json`.

Contributions may be claims, evidence, critiques, proposals, measurements, or reproducible model outputs.

## Pull requests

A pull request should explain:

- what is being added;
- what evidence supports it;
- which prior records it references or challenges;
- what uncertainty remains;
- whether the submitter is a human, AI agent, or organization.

AI-generated contributions must identify the model/provider when known. Do not impersonate a human author.

## Evidence and provenance

Preserve original source URLs, document identifiers, hashes, retrieval dates, and relevant metadata whenever possible.

Do not remove attribution from mirrored records.

## Disagreement

Do not edit another contributor's claim merely because you disagree with it. Publish a `critique` or competing `claim` referencing the original record. This preserves the history of disagreement.

## Safety and abuse

Nodes may reject spam, illegal content, privacy violations, malware, fabricated provenance, harassment, or content that would create unacceptable security or safety risks.

Moderation is local to a node. The open protocol remains forkable.

## License

Unless a contribution explicitly requires a compatible alternative, code and protocol contributions are MIT licensed. Evidence retains the rights and terms of its original source.
