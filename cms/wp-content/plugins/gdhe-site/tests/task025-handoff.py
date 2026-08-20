#!/usr/bin/env python3

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
ARTIFACT = ROOT / "frontend/src/lib/cms/article-number-batch-contract/fixtures"


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    files = [
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/REQUIREMENTS.md",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/DESIGN.md",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/TDD_SEAMS.md",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/PROTECTED_BASELINE.md",
        "cms/wp-content/mu-plugins/gdhe-task025-article-number-batch.php",
        "cms/wp-content/plugins/gdhe-site/gdhe-site.php",
        "cms/wp-content/plugins/gdhe-site/config/schemas/article-number-option.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/product-configuration.v2.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/product-card.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/card-action.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/card-attribute.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/public-path.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/public-protected-media.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/public-taxonomy-ref.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/uuid-v4.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-collection.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-item.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-collection.v2.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-item.v2.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/mixed-quote-line-validation-request.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/config/schemas/mixed-quote-line-validation-response.v1.schema.json",
        "cms/wp-content/plugins/gdhe-site/includes/product-configurations-v2.php",
        "cms/wp-content/plugins/gdhe-site/includes/related-product-cards.php",
        "cms/wp-content/plugins/gdhe-site/includes/quote-line-validations.php",
        "cms/wp-content/plugins/gdhe-site/includes/fixtures-task025.php",
        "cms/wp-content/plugins/gdhe-site/tests/related-product-card-contract-test.php",
        "cms/wp-content/plugins/gdhe-site/tests/task025-route-test.php",
        "cms/wp-content/plugins/gdhe-site/tests/task025-contract-test.php",
        "cms/wp-content/plugins/gdhe-site/tests/task025-schema-test.py",
        "cms/wp-content/plugins/gdhe-site/tests/task025-determinism-test.py",
        "cms/wp-content/plugins/gdhe-site/tests/task025-http-test.py",
        "cms/wp-content/plugins/gdhe-site/tests/task025-handoff.py",
        "docs/cms/README.md",
        "docs/cms/CONTENT_MODEL.md",
        "docs/cms/REST_CONTRACT.md",
        "docs/cms/OPERATIONS_AND_ROLLBACK.md",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_TDD_RED_EVIDENCE.md",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_RUNTIME_VALIDATION.json",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_SCHEMA_VALIDATION.json",
        "frontend/src/lib/cms/article-number-batch-contract/fixtures/QUOTE_LINE_ERROR_EVIDENCE.json",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_DETERMINISM_AND_CLEANUP.json",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_REAL_HTTP_EVIDENCE.json",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_EXECUTION_REPORT.md",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_VALIDATION_LOG.md",
        "TASKS/ARCHIVE/TASK-025/EVIDENCE/integration/WORDPRESS_DIFF_SUMMARY.md",
    ]
    files += [
        path.relative_to(ROOT).as_posix()
        for path in sorted((ARTIFACT / "golden-wordpress").glob("*.json"))
    ]
    missing = [relative for relative in files if not (ROOT / relative).is_file()]
    if missing:
        raise RuntimeError("Missing TASK-025 handoff files: " + ", ".join(missing))
    checksums = {relative: sha256(ROOT / relative) for relative in files}
    manifest = {
        "taskId": "TASK-025",
        "lane": "wordpress_cms",
        "apiVersion": "1",
        "relatedProductCardVersions": ["1.0.0", "2.0.0"],
        "mixedQuoteLineValidationVersion": "1.0.0",
        "relatedProductCardEndpoint": "/wp-json/gdhe/v1/related-product-cards",
        "mixedValidationEndpoint": "/wp-json/gdhe/v1/quote-line-validations",
        "mixedValidationMethod": "POST",
        "rawByteLimit": 163840,
        "lineBounds": [1, 50],
        "candidateQueryMaximum": 2,
        "candidateOverflowSentinel": 101,
        "publicSubrequests": 0,
        "successCache": "no-store",
        "errorCache": "no-store",
        "fixtureVersion": "TASK-025-ARTICLE-NUMBER-BATCH-1",
        "successGoldenCount": 7,
        "deterministicLifecycleCount": 2,
        "finalResidue": {"posts": 0, "options": 0, "terms": 0, "privateMeta": 0},
        "handoffFileCount": len(files),
        "files": files,
        "checksums": checksums,
    }
    manifest_path = ARTIFACT / "WORDPRESS_HANDOFF_MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    checksum_path = ARTIFACT / "WORDPRESS_HANDOFF_CHECKSUMS.sha256"
    checksum_path.write_text(
        "".join(checksums[relative] + "  " + relative + "\n" for relative in files),
        encoding="utf-8",
    )
    report = {
        "manifest": manifest_path.relative_to(ROOT).as_posix(),
        "manifestSha256": sha256(manifest_path),
        "checksumStream": checksum_path.relative_to(ROOT).as_posix(),
        "checksumStreamSha256": sha256(checksum_path),
        "verifiedFileCount": sum(sha256(ROOT / relative) == expected for relative, expected in checksums.items()),
        "expectedFileCount": len(files),
        "valid": all(sha256(ROOT / relative) == expected for relative, expected in checksums.items()),
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
