#!/usr/bin/env python3

import hashlib
import json
from pathlib import Path


SCHEMA_FILES = (
    "article-number-option.v1.schema.json",
    "product-configuration.v1.schema.json",
    "public-path.schema.json",
    "uuid-v4.schema.json",
)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-019"
    schema_dir = plugin / "config" / "schemas"
    files = [schema_dir / name for name in SCHEMA_FILES]
    files.extend(sorted((artifacts / "golden-product-configuration").glob("*.json")))
    files.extend(
        [
            artifacts / "PRODUCT_CONFIGURATION_ERROR_FIXTURES.json",
            artifacts / "PRODUCT_CONFIGURATION_RUNTIME_VALIDATION.json",
            artifacts / "PRODUCT_CONFIGURATION_SCHEMA_VALIDATION.json",
            artifacts / "PRODUCT_CONFIGURATION_DETERMINISM.json",
            plugin / "includes" / "product-configurations.php",
            plugin / "includes" / "fixtures-task019.php",
            plugin / "tests" / "product-configuration-contract-test.php",
            plugin / "tests" / "product-configuration-determinism-test.py",
            plugin / "tests" / "product-configuration-handoff.py",
            plugin / "tests" / "product-configuration-request-test.php",
            plugin / "tests" / "product-configuration-runtime-test.php",
            plugin / "tests" / "product-configuration-schema-test.py",
        ]
    )
    missing = [path for path in files if not path.is_file()]
    if missing:
        raise RuntimeError("Missing Product Configuration handoff file: " + str(missing[0]))
    checksums = {
        path.relative_to(repository).as_posix(): sha256(path)
        for path in files
    }
    manifest = {
        "handoffVersion": "TASK-019-PRODUCT-CONFIGURATION-1",
        "restApiVersion": "1",
        "contentSchemaVersion": "3.0.0",
        "productConfigurationSchemaVersion": "1.0.0",
        "fixtureVersion": "TASK-019-PRODUCT-CONFIGURATION-1",
        "endpoint": "/wp-json/gdhe/v1/product-configurations",
        "query": {
            "locale": "en",
            "schema": "1.0.0",
            "path": "required canonical public path",
            "additionalParameters": False,
        },
        "schemaClosureFiles": [
            "cms/wp-content/plugins/gdhe-site/config/schemas/" + name
            for name in SCHEMA_FILES
        ],
        "goldenFiles": [
            path.relative_to(repository).as_posix()
            for path in sorted(
                (artifacts / "golden-product-configuration").glob("*.json")
            )
        ],
        "errorFixtureFile": (
            "TASKS/ARTIFACTS/TASK-019/PRODUCT_CONFIGURATION_ERROR_FIXTURES.json"
        ),
        "invariants": {
            "anonymousReadOnly": True,
            "quoteLineAcceptedOrStored": False,
            "publicDatabaseIdentifiers": False,
            "oneConfirmedStandardOption": True,
            "guessedOptionsOrAccessories": False,
            "completeCandidateFailClosed": True,
            "globalArticleNumberUnique": True,
            "publicChoiceUniquePerStableProduct": True,
            "distinctProductsMaySharePublicChoice": True,
            "stableProductIdentityConsistent": True,
            "contentSchemaThreeUnchanged": True,
            "productCardOneUnchanged": True,
        },
        "checksums": checksums,
        "checksumAlgorithm": (
            "SHA-256 over exact file bytes; paths are repository-relative UTF-8 strings "
            "sorted lexicographically in PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256."
        ),
    }
    manifest_path = artifacts / "PRODUCT_CONFIGURATION_HANDOFF_MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    checksum_path = artifacts / "PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256"
    checksum_path.write_text(
        "".join(
            checksums[path] + "  " + path + "\n"
            for path in sorted(checksums)
        ),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "schemaClosureCount": len(SCHEMA_FILES),
                "goldenCount": len(manifest["goldenFiles"]),
                "checksumCount": len(checksums),
                "valid": True,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
