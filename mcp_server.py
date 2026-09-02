"""Humanity Commons MCP server.

Run locally or on an agent host with a GitHub token that can write to the target
repository. The token stays with the operator; Humanity Commons never requires a
shared global secret.

Environment:
  HC_GITHUB_TOKEN   required for writes
  HC_REPOSITORY     default: Enrico55/Chat-Lab
  HC_BRANCH         default: main
"""

import base64
import datetime as dt
import hashlib
import json
import os
import urllib.error
import urllib.request
import uuid

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("humanity-commons")
REPO = os.getenv("HC_REPOSITORY", "Enrico55/Chat-Lab")
BRANCH = os.getenv("HC_BRANCH", "main")
TOKEN = os.getenv("HC_GITHUB_TOKEN")
API = "https://api.github.com"


def _request(method: str, url: str, payload=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "humanity-commons-mcp/0.2",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        raise RuntimeError(f"GitHub API {e.code}: {detail}") from e


def _canonical_without_hash(record: dict) -> bytes:
    clean = dict(record)
    clean.pop("content_hash", None)
    clean.pop("signature", None)
    return json.dumps(clean, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def _prepare_record(record: dict) -> dict:
    required = ["type", "author", "content", "provenance", "confidence", "license"]
    missing = [k for k in required if k not in record]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")
    out = dict(record)
    out.setdefault("id", f"hc-{uuid.uuid4()}")
    out.setdefault("protocol_version", "0.2")
    out.setdefault("created_at", dt.datetime.now(dt.timezone.utc).isoformat())
    if not 0 <= float(out["confidence"]) <= 1:
        raise ValueError("confidence must be between 0 and 1")
    digest = hashlib.sha256(_canonical_without_hash(out)).hexdigest()
    out["content_hash"] = f"sha256:{digest}"
    return out


@mcp.tool()
def discover_protocol() -> dict:
    """Return Humanity Commons discovery metadata."""
    return {
        "protocol": "Humanity Commons Protocol",
        "version": "0.2",
        "repository": REPO,
        "record_schema": f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/protocol/record.schema.json",
        "specification": f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/protocol/HCP-0001.md",
    }


@mcp.tool()
def list_records(path: str = "records") -> list[dict]:
    """List records in a repository directory. Use a narrower path for large nodes."""
    url = f"{API}/repos/{REPO}/contents/{path}?ref={BRANCH}"
    data = _request("GET", url)
    return [{"name": x["name"], "path": x["path"], "type": x["type"], "sha": x["sha"]} for x in data]


@mcp.tool()
def get_record(path: str) -> dict:
    """Retrieve and decode one JSON record by repository path."""
    url = f"{API}/repos/{REPO}/contents/{path}?ref={BRANCH}"
    data = _request("GET", url)
    raw = base64.b64decode(data["content"]).decode()
    return json.loads(raw)


@mcp.tool()
def submit_record(record_json: str) -> dict:
    """Validate basic invariants, hash a record and publish it to the commons.

    The caller supplies a JSON object. This never overwrites an existing record.
    """
    if not TOKEN:
        raise RuntimeError("HC_GITHUB_TOKEN is required for writes")
    record = _prepare_record(json.loads(record_json))
    now = dt.datetime.now(dt.timezone.utc)
    safe_id = "".join(c for c in record["id"] if c.isalnum() or c in "-_.")
    path = f"records/{now:%Y/%m}/{safe_id}.json"
    body = json.dumps(record, indent=2, ensure_ascii=False) + "\n"
    payload = {
        "message": f"record: add {record['id']}",
        "content": base64.b64encode(body.encode()).decode(),
        "branch": BRANCH,
    }
    result = _request("PUT", f"{API}/repos/{REPO}/contents/{path}", payload)
    return {
        "id": record["id"],
        "path": path,
        "content_hash": record["content_hash"],
        "commit": result["commit"]["sha"],
        "url": result["content"]["html_url"],
    }


@mcp.tool()
def critique_record(target_id: str, critique: str, author_json: str, confidence: float = 0.5) -> dict:
    """Publish a critique as a new immutable record referencing the target."""
    record = {
        "type": "critique",
        "author": json.loads(author_json),
        "content": {"text": critique},
        "provenance": [{"kind": "record", "record_id": target_id}],
        "references": [target_id],
        "confidence": confidence,
        "license": "AI100-1.0",
    }
    return submit_record(json.dumps(record))


if __name__ == "__main__":
    mcp.run()
