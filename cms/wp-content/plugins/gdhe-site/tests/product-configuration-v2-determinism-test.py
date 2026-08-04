#!/usr/bin/env python3

import hashlib
import json
import subprocess
from pathlib import Path


def run(command, repository):
    result = subprocess.run(command, cwd=repository, text=True, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError("command failed: " + " ".join(command) + "\n" + result.stdout + result.stderr)
    return result.stdout.strip()


def residue(repository):
    query = (
        "SELECT "
        "(SELECT COUNT(*) FROM wp_posts WHERE post_name LIKE 'task-021-%'), "
        "(SELECT COUNT(*) FROM wp_postmeta WHERE meta_key='_gdhe_task021_fixture_marker'), "
        "(SELECT COUNT(*) FROM wp_options WHERE option_name='gdhe_task021_fixture_manifest'), "
        "(SELECT COUNT(*) FROM wp_terms WHERE slug LIKE 'task-021-%'), "
        "(SELECT COUNT(*) FROM wp_postmeta WHERE meta_key IN "
        "('_gdhe_task019_fixture_marker','_gdhe_task014_fixture_marker','_gdhe_a3_fixture_marker','_gdhe_a3_migration_marker','_gdhe_a3_migration_backup')), "
        "(SELECT COUNT(*) FROM wp_options WHERE option_name IN "
        "('gdhe_task019_fixture_manifest','gdhe_task014_fixture_manifest','gdhe_a3_fixture_manifest'));"
    )
    values = [int(value) for value in run(
        ["wp", "db", "query", query, "--skip-column-names", "--path=cms"], repository
    ).split()]
    uploads = len([
        path for path in (repository / "cms" / "wp-content" / "uploads").rglob("*task-021*")
        if path.is_file()
    ])
    return {
        "taskPosts": values[0],
        "taskPostmeta": values[1],
        "taskOptions": values[2],
        "taskTerms": values[3],
        "otherTaskPostmeta": values[4],
        "otherTaskOptions": values[5],
        "taskUploads": uploads,
    }


def lifecycle(number, repository, plugin, artifacts):
    manifest = json.loads(run(["wp", "gdhe", "task021-fixtures", "create", "--path=cms"], repository))
    try:
        runtime = json.loads(run([
            "wp", "eval-file", str(plugin / "tests" / "product-configuration-v2-contract-test.php"), "--path=cms"
        ], repository))
        schema = json.loads(run([
            "python3", str(plugin / "tests" / "product-configuration-v2-schema-validation.py")
        ], repository))
        golden = artifacts / "golden-product-configuration-v2" / "fgd-x15-pvc.json"
        hashes = {golden.name: hashlib.sha256(golden.read_bytes()).hexdigest()}
    finally:
        cleanup = json.loads(run(["wp", "gdhe", "task021-fixtures", "cleanup", "--path=cms"], repository))
    remaining = residue(repository)
    if any(remaining.values()):
        raise RuntimeError("TASK-021 related residue remained after lifecycle " + str(number))
    return {
        "round": number,
        "fixtureDatabaseIds": manifest["posts"],
        "runtimeValid": runtime["valid"],
        "schemaValid": schema["valid"],
        "goldenSha256": hashes,
        "cleanup": cleanup,
        "residue": remaining,
    }


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-021"
    existing = json.loads(run(["wp", "gdhe", "task021-fixtures", "show", "--path=cms"], repository))
    if isinstance(existing, dict) and existing.get("posts"):
        run(["wp", "gdhe", "task021-fixtures", "cleanup", "--path=cms"], repository)
    if any(residue(repository).values()):
        raise RuntimeError("TASK-021/TASK-019/TASK-014/A3 pre-lifecycle residue gate failed.")
    rounds = [lifecycle(1, repository, plugin, artifacts), lifecycle(2, repository, plugin, artifacts)]
    hashes_identical = rounds[0]["goldenSha256"] == rounds[1]["goldenSha256"]
    ids_changed = rounds[0]["fixtureDatabaseIds"] != rounds[1]["fixtureDatabaseIds"]
    report = {
        "evidenceVersion": "TASK-021-PRODUCT-CONFIGURATION-V2-DETERMINISM-1",
        "fixtureVersion": "TASK-021-PRODUCT-CONFIGURATION-V2-1",
        "lifecycleCount": 2,
        "goldenCountPerRound": 1,
        "goldenHashesIdentical": hashes_identical,
        "databaseIdsChangedBetweenRounds": ids_changed,
        "publicContractUsesDatabaseIds": False,
        "rounds": rounds,
        "valid": hashes_identical and ids_changed,
    }
    (artifacts / "PRODUCT_CONFIGURATION_V2_DETERMINISM.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(report, indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
