#!/usr/bin/env python3

import hashlib
import json
from pathlib import Path


SCHEMAS = (
    "article-number-option.v1.schema.json",
    "product-configuration.v2.schema.json",
    "public-path.schema.json",
    "uuid-v4.schema.json",
)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-021"
    schema_dir = plugin / "config" / "schemas"
    files = [schema_dir / name for name in SCHEMAS]
    files.extend([
        artifacts / "golden-product-configuration-v2" / "fgd-x15-pvc.json",
        artifacts / "PRODUCT_CONFIGURATION_V2_ERROR_FIXTURES.json",
        artifacts / "PRODUCT_CONFIGURATION_V2_RUNTIME_VALIDATION.json",
        artifacts / "PRODUCT_CONFIGURATION_V2_SCHEMA_VALIDATION.json",
        artifacts / "PRODUCT_CONFIGURATION_V2_DETERMINISM.json",
        plugin / "config" / "schema.v3.json",
        plugin / "gdhe-site.php",
        plugin / "includes" / "fixtures-task021.php",
        plugin / "includes" / "product-configurations-v2.php",
        plugin / "includes" / "public-api.php",
        plugin / "tests" / "product-configuration-v2-contract-test.php",
        plugin / "tests" / "product-configuration-v2-determinism-test.py",
        plugin / "tests" / "product-configuration-v2-handoff.py",
        plugin / "tests" / "product-configuration-v2-runtime-test.php",
        plugin / "tests" / "product-configuration-v2-schema-test.py",
        plugin / "tests" / "product-configuration-v2-schema-validation.py",
    ])
    missing = [path for path in files if not path.is_file()]
    if missing:
        raise RuntimeError("Missing Product Configuration v2 handoff file: " + str(missing[0]))
    checksums = {
        path.relative_to(repository).as_posix(): digest(path)
        for path in files
    }
    manifest = {
        "handoffVersion": "TASK-021-PRODUCT-CONFIGURATION-V2-1",
        "restApiVersion": "1",
        "contentSchemaVersion": "3.0.0",
        "productConfigurationSchemaVersion": "2.0.0",
        "fixtureVersion": "TASK-021-PRODUCT-CONFIGURATION-V2-1",
        "endpoint": "/wp-json/gdhe/v1/product-configurations",
        "query": {
            "locale": "en",
            "schema": "2.0.0",
            "path": "required canonical public path",
            "additionalParameters": False,
        },
        "schemaClosureFiles": [
            "cms/wp-content/plugins/gdhe-site/config/schemas/" + name
            for name in SCHEMAS
        ],
        "goldenFiles": [
            "TASKS/ARTIFACTS/TASK-021/golden-product-configuration-v2/fgd-x15-pvc.json"
        ],
        "errorFixtureFile": "TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_ERROR_FIXTURES.json",
        "invariants": {
            "anonymousReadOnly": True,
            "productConfigurationV1BytesUnchanged": True,
            "oneConfirmedStandardOption": True,
            "installationAndAccessoryAbsent": True,
            "guessedLengthsOrAccessories": False,
            "completeCandidateFailClosed": True,
            "globalArticleNumberUnique": True,
            "publicChoiceUniquePerStableProduct": True,
            "distinctProductsMaySharePublicChoice": True,
            "stableProductIdentityConsistent": True,
            "publicDatabaseIdentifiers": False,
            "quoteLineImplemented": False,
        },
        "checksums": checksums,
        "checksumAlgorithm": (
            "SHA-256 over exact file bytes; repository-relative UTF-8 paths are sorted "
            "lexicographically in PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256."
        ),
    }
    (artifacts / "PRODUCT_CONFIGURATION_V2_HANDOFF_MANIFEST.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    (artifacts / "PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256").write_text(
        "".join(checksums[path] + "  " + path + "\n" for path in sorted(checksums)),
        encoding="utf-8",
    )
    report = {
        "schemaClosureCount": len(SCHEMAS),
        "goldenCount": 1,
        "checksumCount": len(checksums),
        "valid": True,
    }
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
