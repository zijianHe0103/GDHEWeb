#!/usr/bin/env python3

import hashlib
import json
import sys
from pathlib import Path


SCHEMA_FILES = (
    "card-action.v1.schema.json",
    "card-attribute.v1.schema.json",
    "product-card-collection.v1.schema.json",
    "product-card.v1.schema.json",
    "public-path.schema.json",
    "public-protected-media.v1.schema.json",
    "public-taxonomy-ref.v1.schema.json",
    "uuid-v4.schema.json",
)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-014"
    schema_dir = plugin / "config" / "schemas"
    files = []
    for name in SCHEMA_FILES:
        files.append(schema_dir / name)
    files.extend(sorted((artifacts / "golden-product-card").glob("*.json")))
    files.extend([
        artifacts / "PRODUCT_CARD_ERROR_FIXTURES.json",
        artifacts / "PRODUCT_CARD_RUNTIME_VALIDATION.json",
        artifacts / "PRODUCT_CARD_SCHEMA_VALIDATION.json",
        artifacts / "PRODUCT_CARD_DETERMINISM.json",
        plugin / "includes" / "product-cards.php",
        plugin / "includes" / "fixtures-task014.php",
        plugin / "tests" / "product-card-contract-test.php",
        plugin / "tests" / "product-card-schema-test.py",
        plugin / "tests" / "product-card-determinism-test.py",
    ])
    missing = [path for path in files if not path.is_file()]
    if missing:
        raise RuntimeError("Missing handoff file: " + str(missing[0]))

    checksums = {
        path.relative_to(repository).as_posix(): sha256(path)
        for path in files
    }
    manifest = {
        "handoffVersion": "TASK-014-PRODUCT-CARD-1",
        "restApiVersion": "1",
        "contentSchemaVersion": "3.0.0",
        "productCardSchemaVersion": "1.0.0",
        "fixtureVersion": "TASK-014-PRODUCT-CARD-1",
        "endpoint": "/wp-json/gdhe/v1/product-cards",
        "schemaClosureFiles": [
            "cms/wp-content/plugins/gdhe-site/config/schemas/" + name
            for name in SCHEMA_FILES
        ],
        "goldenFiles": [
            path.relative_to(repository).as_posix()
            for path in sorted((artifacts / "golden-product-card").glob("*.json"))
        ],
        "invariants": {
            "oneCollectionRequest": True,
            "perCardResolveRequests": 0,
            "anonymousReadOnly": True,
            "publicDatabaseIdentifiers": False,
            "eligibilityBeforeTotalPagination": True,
            "contentSchemaThreeUnchanged": True,
        },
        "checksums": checksums,
        "checksumAlgorithm": (
            "SHA-256 over exact file bytes; paths are repository-relative UTF-8 strings "
            "sorted lexicographically in PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256."
        ),
    }
    manifest_path = artifacts / "PRODUCT_CARD_HANDOFF_MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    checksum_path = artifacts / "PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256"
    checksum_path.write_text(
        "".join(
            checksums[path] + "  " + path + "\n"
            for path in sorted(checksums)
        ),
        encoding="utf-8",
    )
    print(json.dumps({
        "schemaClosureCount": len(SCHEMA_FILES),
        "goldenCount": len(manifest["goldenFiles"]),
        "checksumCount": len(checksums),
        "valid": True,
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
