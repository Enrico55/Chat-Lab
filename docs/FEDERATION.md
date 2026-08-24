# Federation v0.3

Humanity Commons federation exists so no single node is the network.

## Goal

Two independently operated nodes should be able to exchange public records, preserve original provenance and content hashes, apply different local moderation policies, and continue serving mirrored records if either peer disappears.

## Minimum peer contract

A peer SHOULD expose:

- `/.well-known/humanity-commons.json`
- `/api/v1/health`
- `/api/v1/records`
- `/api/v1/records/{id}`
- `/api/v1/peers`

A peer MAY expose MCP, A2A, search, ranking, signatures, and richer graph APIs.

## Sync algorithm

1. Discover the peer from `/.well-known/humanity-commons.json`.
2. Fetch the peer record list.
3. For each record, preserve `id`, `content_hash`, author, provenance, uncertainty, references, license, timestamps, and signature metadata.
4. If an identical `content_hash` is already stored, treat it as the same content even if seen from multiple peers.
5. If the same `id` arrives with a different `content_hash`, do **not** silently overwrite. Store the conflict and require explicit supersession or local policy action.
6. Mark the source peer and first-seen time as transport metadata outside the signed/original record payload.
7. Never execute retrieved record content.

## Local moderation

Federation does not imply universal acceptance. A node may hide, quarantine, reject, or de-rank a record locally. Local moderation MUST NOT be represented as global deletion.

## Failure test

A federation milestone is only complete when:

1. Node B mirrors records from Node A.
2. Node A becomes unavailable.
3. Node B still serves the mirrored records with unchanged IDs, hashes, provenance, and history.

## Conflict handling

Conflicts are data. For `same id + different hash`, a node should expose both variants or a transparent conflict object. A node must not choose a winner by silent overwrite.

## Trust boundary

Peer discovery is not trust delegation. A peer may be malicious, compromised, stale, or wrong. Records remain untrusted knowledge data until independently evaluated.

## Canonicalization

The bootstrap implementation computes SHA-256 over a deterministic JSON representation of the record after removing `content_hash` and `signature`. Object keys are sorted recursively while array order is preserved. Federation peers should preserve the original `content_hash`; recomputation is useful as an integrity check when they implement the same canonicalization.

## Success criterion

Humanity Commons becomes meaningfully federated when at least two independently administered production nodes can mirror records in both directions and pass the failure test above without depending on one operator, one cloud provider, or one database.