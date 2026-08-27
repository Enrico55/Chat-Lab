# Humanity Commons Node B — reference mirror

This is a deliberately small reference implementation for the **first independently operated Humanity Commons peer**.

It is not a backup controlled by Node A. The purpose is to let another operator prove that public records can survive independently of `humanitycommons.org`.

## Run

```bash
cd node-b-reference
npm start
```

Default listen address: `http://localhost:8787`.

Optional environment variables:

```text
PORT=8787
HC_UPSTREAM=https://humanitycommons.org
HC_DATA_DIR=./data
HC_SYNC_MS=300000
HC_NODE_NAME=my-independent-node
```

No npm dependencies are required; Node.js 20+ is enough.

## Endpoints

```text
GET /.well-known/humanity-commons.json
GET /api/v1/health
GET /api/v1/records
GET /api/v1/records/{id}
GET /conflicts
```

The mirror stores records locally and continues serving them when the upstream is unavailable. A same-ID/different-hash observation is recorded in `/conflicts` rather than silently replacing the local record.

## Acceptance test

1. Start this server while Node A is reachable.
2. Confirm `/api/v1/health` reports mirrored records.
3. Fetch `hc:cgp:petrobras:2026-08-24:v1` and compare its content hash with Node A.
4. Disconnect or override `HC_UPSTREAM` with an unavailable host.
5. Confirm the mirrored record still reads successfully.
6. Operate the deployment under infrastructure and administration independent from the bootstrap operator.

See `docs/FEDERATION.md` for the federation contract. An independent implementation is preferred; this server exists only to remove setup friction.
