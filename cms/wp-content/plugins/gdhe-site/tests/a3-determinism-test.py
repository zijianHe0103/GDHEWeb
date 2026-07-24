#!/usr/bin/env python3

import hashlib
import json
import subprocess
import sys
from pathlib import Path


def run(command, repository):
    result = subprocess.run(command, cwd=repository, text=True, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError("command failed: " + " ".join(command) + "\n" + result.stdout + result.stderr)
    return result.stdout.strip()


def golden_hashes(golden_dir):
    hashes = {}
    for path in sorted(golden_dir.glob("*.json")):
        hashes[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
    if len(hashes) != 15:
        raise RuntimeError("expected exactly 15 A3 Golden files")
    return hashes


def residue(repository):
    query = (
        "SELECT "
        "(SELECT COUNT(*) FROM wp_posts WHERE post_name LIKE 'task-007-a3-%'), "
        "(SELECT COUNT(*) FROM wp_postmeta WHERE meta_key='_gdhe_a3_fixture_marker' "
        "OR meta_value LIKE '%TASK-007-A3%'), "
        "(SELECT COUNT(*) FROM wp_terms WHERE slug IN "
        "('flow-control','synthetic-series','deck-mounted','configuration','data-sheet')), "
        "(SELECT COUNT(*) FROM wp_options WHERE option_name='gdhe_a3_fixture_manifest');"
    )
    output = run(
        ["wp", "db", "query", query, "--skip-column-names", "--path=cms", "--allow-root"],
        repository,
    )
    counts = [int(value) for value in output.split()]
    uploads = list((repository / "cms" / "wp-content" / "uploads").rglob("*task-007-a3*"))
    return {
        "taskPosts": counts[0],
        "taskPostmeta": counts[1],
        "taskTerms": counts[2],
        "taskOptions": counts[3],
        "taskUploads": len([path for path in uploads if path.is_file()]),
    }


def lifecycle(round_number, repository, plugin, artifacts):
    created = False
    try:
        manifest = json.loads(
            run(["wp", "gdhe", "a3-fixtures", "create", "--path=cms", "--allow-root"], repository)
        )
        created = True
        run(
            ["wp", "eval-file", str(plugin / "tests" / "a3-contract-test.php"), "--path=cms", "--allow-root"],
            repository,
        )
        run(["python3", str(plugin / "tests" / "a3-schema-validate.py")], repository)
        schema_report = json.loads((artifacts / "A3_SCHEMA_VALIDATION.json").read_text(encoding="utf-8"))
        if not schema_report["valid"]:
            raise RuntimeError("A3 schema validation failed")
        hashes = golden_hashes(artifacts / "golden-a3")
        cleanup = json.loads(
            run(["wp", "gdhe", "a3-fixtures", "cleanup", "--path=cms", "--allow-root"], repository)
        )
        created = False
        cleanup_residue = residue(repository)
        if any(cleanup_residue.values()):
            raise RuntimeError("A3 fixture residue remained after round " + str(round_number))
        return {
            "round": round_number,
            "fixtureDatabaseIds": manifest,
            "schemaValid": True,
            "goldenSha256": hashes,
            "cleanup": cleanup,
            "residue": cleanup_residue,
        }
    finally:
        if created:
            run(["wp", "gdhe", "a3-fixtures", "cleanup", "--path=cms", "--allow-root"], repository)


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-007"
    existing = run(["wp", "gdhe", "a3-fixtures", "show", "--path=cms", "--allow-root"], repository)
    existing_manifest = json.loads(existing)
    if isinstance(existing_manifest, dict) and existing_manifest.get("posts"):
        run(["wp", "gdhe", "a3-fixtures", "cleanup", "--path=cms", "--allow-root"], repository)
    migration_validation = json.loads(
        run(
            ["wp", "eval-file", str(plugin / "tests" / "a3-migration-runtime-test.php"), "--path=cms", "--allow-root"],
            repository,
        )
    )
    rounds = [
        lifecycle(1, repository, plugin, artifacts),
        lifecycle(2, repository, plugin, artifacts),
    ]
    identical = rounds[0]["goldenSha256"] == rounds[1]["goldenSha256"]
    ids_changed = (
        rounds[0]["fixtureDatabaseIds"]["posts"] != rounds[1]["fixtureDatabaseIds"]["posts"]
        and rounds[0]["fixtureDatabaseIds"]["attachments"] != rounds[1]["fixtureDatabaseIds"]["attachments"]
    )
    report = {
        "evidenceVersion": "TASK-007-A3-DETERMINISM-2",
        "fixtureVersion": "TASK-007-A3-REVIEW-R1",
        "migrationRuntimeValidation": migration_validation,
        "lifecycleCount": 2,
        "goldenCountPerRound": 15,
        "goldenHashesIdentical": identical,
        "databaseIdsChangedBetweenRounds": ids_changed,
        "publicContractUsesDatabaseIds": False,
        "rounds": rounds,
    }
    output = artifacts / "A3_DETERMINISTIC_GOLDEN.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if identical and ids_changed else 1


if __name__ == "__main__":
    sys.exit(main())
