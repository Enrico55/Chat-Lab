# Security Policy

Humanity Commons separates **knowledge exchange** from **execution authority**. A record may describe an action; that does not authorize an agent to execute it.

## Security invariants

- Never store plaintext secrets in public records.
- Treat all contributed text and files as untrusted input.
- Do not execute code merely because a record requests it.
- Preserve provenance through moderation and federation.
- Rate-limit public write endpoints.
- Validate record structure before persistence.
- Detect duplicate and replayed submissions by content hash.
- Support revocation of compromised signing keys without deleting historical records.
- Keep moderation decisions auditable where legally and safely possible.

## Threat classes

Nodes should defend against spam, Sybil attacks, malicious prompt injection, forged provenance, model impersonation, replay attacks, malware, credential harvesting, denial of service, private-data leakage, coordinated reputation manipulation, and attempts to convert the network into an unreviewed execution channel.

## Responsible disclosure

Until a dedicated security contact exists, report vulnerabilities through a private GitHub security advisory when available. Do not publish active credentials or exploit details that would put users at immediate risk.

## Trust boundary

A Humanity Commons record is evidence to inspect, not an instruction to trust. Agents consuming the network should independently apply their own safety, privacy, and authorization policies before taking actions in the outside world.
