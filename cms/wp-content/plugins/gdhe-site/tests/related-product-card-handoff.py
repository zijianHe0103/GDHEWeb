#!/usr/bin/env python3

import hashlib
import json
import sys
from pathlib import Path


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-023"
    files = [
        "cms/wp-content/mu-plugins/gdhe-task023-related-products.php",
        "cms/wp-content/plugins/gdhe-site/config/schema.v3.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/card-action.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/card-attribute.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/product-card.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/public-path.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/public-protected-media.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/public-taxonomy-ref.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-collection.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-item.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/uuid-v4.schema.json",
        "cms/wp-content/plugins/gdhe-site/includes/fixtures-task023.php",
        "cms/wp-content/plugins/gdhe-site/includes/related-product-cards.php",
        "cms/wp-content/plugins/gdhe-site/tests/related-product-card-contract-test.php",
        "cms/wp-content/plugins/gdhe-site/tests/related-product-card-determinism-test.py",
        "cms/wp-content/plugins/gdhe-site/tests/related-product-card-handoff.py",
        "cms/wp-content/plugins/gdhe-site/tests/related-product-card-runtime-test.php",
        "cms/wp-content/plugins/gdhe-site/tests/related-product-card-schema-test.py",
        "TASKS/ARCHIVE/TASK-023/EVIDENCE/integration/RELATED_PRODUCT_DETERMINISM.json",
        "frontend/src/lib/cms/related-product-card-contract/fixtures/RELATED_PRODUCT_ERROR_FIXTURES.json",
        "TASKS/ARCHIVE/TASK-023/EVIDENCE/integration/RELATED_PRODUCT_RUNTIME_VALIDATION.json",
        "TASKS/ARCHIVE/TASK-023/EVIDENCE/integration/RELATED_PRODUCT_SCHEMA_VALIDATION.json",
        "frontend/src/lib/cms/related-product-card-contract/fixtures/golden-related-product-card/four-plus.json",
        "frontend/src/lib/cms/related-product-card-contract/fixtures/golden-related-product-card/one.json",
        "frontend/src/lib/cms/related-product-card-contract/fixtures/golden-related-product-card/three.json",
        "frontend/src/lib/cms/related-product-card-contract/fixtures/golden-related-product-card/zero.json",
    ]
    missing = [relative for relative in files if not repository.joinpath(relative).is_file()]
    if missing:
        raise RuntimeError("Missing RelatedProductCard handoff files: " + ", ".join(missing))
    checksums = {relative: sha256(repository / relative) for relative in files}
    manifest = {
        "taskId": "TASK-023",
        "contract": "RelatedProductCardCollection",
        "apiVersion": "1",
        "schemaVersion": "1.0.0",
        "endpoint": "/wp-json/gdhe/v1/related-product-cards",
        "query": {
            "locale": "en",
            "schema": "1.0.0",
            "source_path": "canonical English Product path",
        },
        "responseType": "related_product_card",
        "productCardVersion": "1.0.0",
        "maximumSourceRelations": 20,
        "ordering": "Schema 3 relationships.products stored order",
        "publicIdentityCollision": "all distinct eligible posts sharing one public UUID are omitted",
        "directQuote": {
            "detailProduct": None,
            "catalogAccessory": {"kind": "catalog_accessory", "quantityUnit": "piece"},
            "guessingAllowed": False,
        },
        "errorMatrix": {
            "invalid_parameter": 400,
            "invalid_locale": 400,
            "invalid_schema": 400,
            "invalid_path": 400,
            "not_found": 404,
            "route_conflict": 409,
            "contract_invariant": 500,
        },
        "successCache": "public, max-age=60 with strong ETag and conditional 304",
        "errorCache": "no-store",
        "fixture": "TASK-023-RELATED-PRODUCT-CARD-P1-R1",
        "goldenCount": 4,
        "schemaClosureCount": 9,
        "handoffFileCount": len(files),
        "files": files,
        "checksums": checksums,
    }
    manifest_path = artifacts / "RELATED_PRODUCT_CARD_HANDOFF_MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    checksum_path = artifacts / "RELATED_PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256"
    checksum_path.write_text(
        "".join(checksums[relative] + "  " + relative + "\n" for relative in files),
        encoding="utf-8",
    )
    verified = all(sha256(repository / relative) == expected for relative, expected in checksums.items())
    report = {
        "manifest": manifest_path.relative_to(repository).as_posix(),
        "manifestSha256": sha256(manifest_path),
        "checksumStream": checksum_path.relative_to(repository).as_posix(),
        "checksumStreamSha256": sha256(checksum_path),
        "verifiedFileCount": len(files),
        "valid": verified,
    }
    print(json.dumps(report, indent=2))
    return 0 if verified else 1


if __name__ == "__main__":
    sys.exit(main())
