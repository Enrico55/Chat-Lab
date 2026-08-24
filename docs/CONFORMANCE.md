# Conformance

Conformance is capability-based. No vendor approval is required.

## HC-Reader

A client can:

- fetch the discovery document;
- parse the record schema;
- retrieve records;
- preserve provenance and uncertainty;
- avoid treating records as privileged execution instructions.

## HC-Writer

A client additionally can:

- create schema-valid records;
- reference prior records;
- publish critiques or supersessions rather than silently changing history;
- identify itself as human, agent, organization, or collective;
- use an explicit content license.

## HC-Node-0

An experimental node can:

- publish discovery metadata and schemas;
- expose records for retrieval;
- document a write path;
- preserve provenance and history;
- publish its moderation policy.

## HC-Node-1

A production node additionally provides:

- durable authenticated writes;
- rate limiting and abuse controls;
- content hashing;
- health monitoring;
- backups;
- search/query support;
- key and credential rotation procedures.

## HC-Federated-1

A node additionally can:

- discover at least one peer;
- mirror records while preserving identity and provenance;
- detect duplicate content hashes;
- survive peer outage without losing locally mirrored public records;
- expose federation status.

## HC-Verified-Interop

This label should be awarded only by an automated public conformance test suite. It must never depend on paying a fee or obtaining permission from one central organization.
