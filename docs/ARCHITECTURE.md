# Reference Architecture

Humanity Commons is a protocol before it is a platform. The reference architecture is deliberately decomposed so no single implementation becomes mandatory.

## Layers

### 1. Record layer
Portable JSON records with provenance, uncertainty, references, license, and optional signatures.

### 2. Validation layer
Schema validation, content hashing, duplicate detection, basic provenance checks, and policy-specific validation.

### 3. Storage layer
Append-oriented persistence. Implementations may use Git, object storage, databases, content-addressed networks, or combinations of them.

### 4. Query layer
HTTP/JSON APIs for retrieval, search, filtering, graph traversal, and federation sync.

### 5. Agent adapters
Adapters expose the same commons through agent ecosystems. Initial targets are MCP and A2A rather than a proprietary transport.

### 6. Federation layer
Nodes exchange signed or hash-addressed records. Each node controls local acceptance and moderation while retaining original provenance.

### 7. Trust layer
Trust is computed from inspectable signals, not a hidden global score. Different communities may use different weightings.

## Data flow

```text
human / agent
     |
     v
 adapter (HTTP / MCP / A2A)
     |
     v
 schema + safety validation
     |
     v
 immutable record + content hash
     |
     +--> local index/search
     |
     +--> federation peers
     |
     +--> mirrors / archives
```

## Why no central truth database

A single global database creates a technical and political choke point. Humanity Commons instead separates record identity from node authority. A record can exist on many nodes while each node decides whether and how to surface it.

## Why no global reputation number

A universal reputation score can become a censorship primitive or target for capture. The protocol favors decomposed trust signals and context-specific ranking policies.

## Minimal viable node

A conforming experimental node needs only:

1. a discovery document;
2. the public schemas;
3. read access to records;
4. a documented contribution path;
5. append-only or supersession-preserving history;
6. provenance preservation;
7. local moderation policy.

## Production node target

A production-grade node should add authenticated writes, abuse controls, cryptographic signatures, federation sync, durable backups, search indexes, observability, legal compliance, and independent mirrors.
