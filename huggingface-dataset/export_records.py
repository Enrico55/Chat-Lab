import json
from pathlib import Path

import requests

SOURCE = "https://humanitycommons.org/api/v1/records"
OUT = Path(__file__).with_name("humanity_commons_records.jsonl")


def main() -> None:
    response = requests.get(SOURCE, timeout=30)
    response.raise_for_status()
    payload = response.json()
    records = payload.get("records", payload) if isinstance(payload, dict) else payload
    if not isinstance(records, list):
        raise RuntimeError("Unexpected records payload")

    with OUT.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")

    print(f"wrote {len(records)} records to {OUT}")


if __name__ == "__main__":
    main()
