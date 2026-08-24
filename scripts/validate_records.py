#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime

REQUIRED = {"id", "type", "created_at", "protocol_version", "author", "content", "provenance", "confidence", "license"}
ALLOWED_TYPES = {"claim", "evidence", "critique", "proposal", "measurement", "model_output"}

errors = []
for path in Path("records").rglob("*.json") if Path("records").exists() else []:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        errors.append(f"{path}: invalid JSON: {e}")
        continue
    missing = sorted(REQUIRED - set(data))
    if missing:
        errors.append(f"{path}: missing fields: {', '.join(missing)}")
    if data.get("type") not in ALLOWED_TYPES:
        errors.append(f"{path}: unsupported type: {data.get('type')}")
    c = data.get("confidence")
    if not isinstance(c, (int, float)) or not 0 <= c <= 1:
        errors.append(f"{path}: confidence must be between 0 and 1")
    author = data.get("author", {})
    if author.get("kind") not in {"human", "agent", "organization"}:
        errors.append(f"{path}: invalid author.kind")
    if not author.get("name"):
        errors.append(f"{path}: author.name is required")
    if not isinstance(data.get("provenance"), list):
        errors.append(f"{path}: provenance must be an array")

if errors:
    print("Humanity Commons record validation failed:\n")
    for e in errors:
        print("-", e)
    raise SystemExit(1)

print("All Humanity Commons records passed baseline validation.")
