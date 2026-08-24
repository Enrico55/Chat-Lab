#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError as exc:
    raise SystemExit("Install dependencies with: pip install -r requirements.txt") from exc

SCHEMA_PATH = Path("protocol/record.schema.json")
RECORDS_DIR = Path("records")

schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
validator = Draft202012Validator(schema, format_checker=FormatChecker())
errors = []
hashes = {}
ids = {}


def canonical_without_integrity_fields(data: dict) -> bytes:
    clean = dict(data)
    clean.pop("content_hash", None)
    clean.pop("signature", None)
    return json.dumps(clean, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


for path in RECORDS_DIR.rglob("*.json") if RECORDS_DIR.exists() else []:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{path}: invalid JSON: {exc}")
        continue

    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        loc = ".".join(str(x) for x in err.path) or "<root>"
        errors.append(f"{path}: schema {loc}: {err.message}")

    record_id = data.get("id")
    if record_id:
        if record_id in ids:
            errors.append(f"{path}: duplicate id {record_id}; first seen in {ids[record_id]}")
        else:
            ids[record_id] = path

    declared = data.get("content_hash")
    if declared:
        actual = "sha256:" + hashlib.sha256(canonical_without_integrity_fields(data)).hexdigest()
        if declared.lower() != actual.lower():
            errors.append(f"{path}: content_hash mismatch; expected {actual}")
        if actual in hashes:
            errors.append(f"{path}: duplicate content hash; first seen in {hashes[actual]}")
        else:
            hashes[actual] = path

if errors:
    print("Humanity Commons record validation failed:\n")
    for error in errors:
        print("-", error)
    raise SystemExit(1)

print(f"Validated {len(ids)} Humanity Commons record(s).")
