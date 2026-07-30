#!/usr/bin/env python3

import hashlib
import json
import subprocess
import sys
from pathlib import Path


def run(command, repository):
    result = subprocess.run(
        command,
        cwd=repository,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "command failed: "
            + " ".join(command)
            + "\n"
            + result.stdout
            + result.stderr
        )
    return result.stdout.strip()


def golden_hashes(golden_dir):
    paths = sorted(golden_dir.glob("*.json"))
    if len(paths) != 8:
        raise RuntimeError("Expected exactly eight TASK-014 Golden files.")
    return {
        path.name: hashlib.sha256(path.read_bytes()).hexdigest()
        for path in paths
    }


def residue(repository):
    query = (
        "SELECT "
        "(SELECT COUNT(*) FROM wp_posts WHERE post_name LIKE 'task-014-%'), "
        "(SELECT COUNT(*) FROM wp_postmeta WHERE meta_key IN "
        "('_gdhe_task014_fixture_marker','_gdhe_product_card_v1_source')), "
        "(SELECT COUNT(*) FROM wp_terms WHERE slug IN "
        "('task-014-card-products','task-014-series','task-014-installation')), "
        "(SELECT COUNT(*) FROM wp_options "
        "WHERE option_name='gdhe_task014_fixture_manifest'), "
        "(SELECT COUNT(*) FROM wp_termmeta WHERE meta_value LIKE '%TASK-014%'), "
        "(SELECT COUNT(*) FROM wp_postmeta WHERE meta_key IN "
        "('_gdhe_a3_fixture_marker','_gdhe_a3_migration_marker','_gdhe_a3_migration_backup')), "
        "(SELECT COUNT(*) FROM wp_options "
        "WHERE option_name='gdhe_a3_fixture_manifest');"
    )
    output = run(
        ["wp", "db", "query", query, "--skip-column-names", "--path=cms"],
        repository,
    )
    counts = [int(value) for value in output.split()]
    uploads = [
        path for path in (repository / "cms" / "wp-content" / "uploads").rglob("*task-014*")
        if path.is_file()
    ]
    return {
        "taskPosts": counts[0],
        "taskPostmeta": counts[1],
        "taskTerms": counts[2],
        "taskOptions": counts[3],
        "taskTermmeta": counts[4],
        "a3Postmeta": counts[5],
        "a3Options": counts[6],
        "taskUploads": len(uploads),
    }


def cleanup(repository):
    return json.loads(
        run(["wp", "gdhe", "task014-fixtures", "cleanup", "--path=cms"], repository)
    )


def lifecycle(round_number, repository, plugin, artifacts):
    manifest = json.loads(
        run(["wp", "gdhe", "task014-fixtures", "create", "--path=cms"], repository)
    )
    try:
        runtime = json.loads(
            run(
                [
                    "wp",
                    "eval-file",
                    str(plugin / "tests" / "product-card-contract-test.php"),
                    "--path=cms",
                ],
                repository,
            )
        )
        schema = json.loads(
            run(
                ["python3", str(plugin / "tests" / "product-card-schema-test.py")],
                repository,
            )
        )
        hashes = golden_hashes(artifacts / "golden-product-card")
    finally:
        cleanup_result = cleanup(repository)
    final_residue = residue(repository)
    if any(final_residue.values()):
        raise RuntimeError("TASK-014 residue remained after round " + str(round_number))
    return {
        "round": round_number,
        "fixtureDatabaseIds": manifest,
        "runtimeValid": runtime["valid"],
        "schemaValid": schema["valid"],
        "goldenSha256": hashes,
        "cleanup": cleanup_result,
        "residue": final_residue,
    }


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-014"
    existing = json.loads(
        run(["wp", "gdhe", "task014-fixtures", "show", "--path=cms"], repository)
    )
    if isinstance(existing, dict) and existing.get("posts"):
        cleanup(repository)
    if any(residue(repository).values()):
        raise RuntimeError("TASK-014/A3 pre-determinism residue gate failed.")

    rounds = [
        lifecycle(1, repository, plugin, artifacts),
        lifecycle(2, repository, plugin, artifacts),
    ]
    hashes_identical = rounds[0]["goldenSha256"] == rounds[1]["goldenSha256"]
    ids_changed = rounds[0]["fixtureDatabaseIds"]["posts"] != rounds[1]["fixtureDatabaseIds"]["posts"]
    report = {
        "evidenceVersion": "TASK-014-PRODUCT-CARD-DETERMINISM-1",
        "fixtureVersion": "TASK-014-PRODUCT-CARD-1",
        "lifecycleCount": 2,
        "goldenCountPerRound": 8,
        "goldenHashesIdentical": hashes_identical,
        "databaseIdsChangedBetweenRounds": ids_changed,
        "publicContractUsesDatabaseIds": False,
        "rounds": rounds,
        "valid": hashes_identical and ids_changed,
    }
    output = artifacts / "PRODUCT_CARD_DETERMINISM.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
