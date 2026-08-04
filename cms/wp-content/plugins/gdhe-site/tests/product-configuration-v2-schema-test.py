#!/usr/bin/env python3

import json
from pathlib import Path


def main():
    plugin = Path(__file__).resolve().parents[1]
    root = plugin / "config" / "schemas" / "product-configuration.v2.schema.json"
    if not root.is_file():
        raise RuntimeError("Expected Product Configuration v2 root Schema is missing.")
    schema = json.loads(root.read_text(encoding="utf-8"))
    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        raise RuntimeError("Product Configuration v2 is not Draft 2020-12.")
    if schema.get("properties", {}).get("schemaVersion", {}).get("const") != "2.0.0":
        raise RuntimeError("Product Configuration v2 Schema version is missing.")
    print(json.dumps({"schemaVersion": "2.0.0", "valid": True}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
