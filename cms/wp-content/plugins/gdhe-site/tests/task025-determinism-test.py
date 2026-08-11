#!/usr/bin/env python3

import hashlib
import json
import os
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
WP = ["wp", "--path=" + str(ROOT / "cms")]
ARTIFACT = ROOT / "TASKS" / "ARTIFACTS" / "TASK-025"
CONTRACT = ROOT / "cms/wp-content/plugins/gdhe-site/tests/task025-contract-test.php"
SCHEMA = ROOT / "cms/wp-content/plugins/gdhe-site/tests/task025-schema-test.py"


def run(args):
    completed = subprocess.run(args, cwd=ROOT, text=True, capture_output=True)
    if completed.returncode:
        raise RuntimeError((completed.stdout + completed.stderr).strip())
    return completed.stdout.strip()


def hashes():
    paths = sorted((ARTIFACT / "golden-wordpress").glob("*.json"))
    paths += [
        ARTIFACT / "QUOTE_LINE_ERROR_EVIDENCE.json",
        ARTIFACT / "WORDPRESS_RUNTIME_VALIDATION.json",
        ARTIFACT / "WORDPRESS_SCHEMA_VALIDATION.json",
    ]
    return {
        path.relative_to(ROOT).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in paths
    }


def residue():
    sql = """
SELECT
 (SELECT COUNT(*) FROM wp_postmeta WHERE meta_key='_gdhe_task025_fixture_marker') posts,
 (SELECT COUNT(*) FROM wp_options WHERE option_name='gdhe_task025_fixture_manifest') options,
 (SELECT COUNT(*) FROM wp_terms WHERE slug LIKE 'task-025-%') terms,
 (SELECT COUNT(*) FROM wp_postmeta WHERE meta_key IN ('_gdhe_catalog_accessory_quote_v1_source','_gdhe_public_article_number_v1') AND post_id IN (SELECT post_id FROM wp_postmeta WHERE meta_key='_gdhe_task025_fixture_marker')) private_meta
""".strip()
    values = run(WP + ["db", "query", sql, "--skip-column-names"]).split()
    return {"posts": int(values[0]), "options": int(values[1]), "terms": int(values[2]), "privateMeta": int(values[3])}


def lifecycle():
    manifest = json.loads(run(WP + ["gdhe", "task025-fixtures", "create"]))
    try:
        if os.environ.get("TASK025_INJECT_POST_CREATE_FAILURE") == "1":
            raise RuntimeError("Injected TASK-025 post-create failure.")
        contract = json.loads(run(WP + ["eval-file", str(CONTRACT)]))
        run(["python3", str(SCHEMA)])
        frozen = hashes()
    finally:
        cleanup = json.loads(run(WP + ["gdhe", "task025-fixtures", "cleanup"]))
        remaining = residue()
        if any(remaining.values()):
            raise RuntimeError("TASK-025 cleanup left residue: " + json.dumps(remaining, sort_keys=True))
    return {
        "wordpressIds": sorted(manifest["posts"].values()),
        "contract": contract,
        "hashes": frozen,
        "cleanup": cleanup,
        "residue": remaining,
    }


def main():
    before = residue()
    if any(before.values()):
        raise RuntimeError("TASK-025 residue exists before determinism test: " + json.dumps(before))
    first = lifecycle()
    second = lifecycle()
    if first["wordpressIds"] == second["wordpressIds"]:
        raise RuntimeError("Fixture lifecycles did not use different WordPress IDs.")
    if first["hashes"] != second["hashes"]:
        raise RuntimeError("TASK-025 evidence hashes differ across lifecycles.")
    report = {
        "fixtureVersion": "TASK-025-ARTICLE-NUMBER-BATCH-1",
        "lifecycleCount": 2,
        "differentWordPressIds": True,
        "firstWordPressIds": first["wordpressIds"],
        "secondWordPressIds": second["wordpressIds"],
        "hashesEqual": True,
        "frozenSha256": first["hashes"],
        "firstCleanup": first["cleanup"],
        "secondCleanup": second["cleanup"],
        "finalResidue": second["residue"],
        "valid": True,
    }
    output = ARTIFACT / "WORDPRESS_DETERMINISM_AND_CLEANUP.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
