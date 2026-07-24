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
    if len(hashes) != 13:
        raise RuntimeError("expected exactly 13 Golden files")
    return hashes


def residue(repository):
    query = (
        "SELECT "
        "(SELECT COUNT(*) FROM wp_posts WHERE post_title LIKE 'TASK-007 A2%' "
        "OR post_name LIKE 'task-007-a2-%'), "
        "(SELECT COUNT(*) FROM wp_postmeta WHERE meta_key='_gdhe_a2_marker' "
        "OR meta_value LIKE '%TASK-007-A2%'), "
        "(SELECT COUNT(*) FROM wp_terms WHERE slug LIKE 'task-007-a2-%');"
    )
    output = run(
        ["wp", "db", "query", query, "--skip-column-names", "--path=cms", "--allow-root"],
        repository,
    )
    counts = [int(value) for value in output.split()]
    uploads = list((repository / "cms" / "wp-content" / "uploads").rglob("*task-007-a2*"))
    return {
        "taskPosts": counts[0],
        "taskPostmeta": counts[1],
        "taskTerms": counts[2],
        "taskUploads": len([path for path in uploads if path.is_file()]),
    }


def lifecycle(round_number, repository, plugin, artifacts):
    created = False
    try:
        run(["wp", "gdhe", "a2-fixtures", "create", "--path=cms", "--allow-root"], repository)
        created = True
        run(
            [
                "wp",
                "eval-file",
                str(plugin / "tests" / "a2-contract-test.php"),
                "--path=cms",
                "--allow-root",
            ],
            repository,
        )
        run(["python3", str(plugin / "tests" / "a2-schema-validate.py")], repository)
        schema_report = json.loads((artifacts / "SCHEMA_VALIDATION.json").read_text(encoding="utf-8"))
        if not schema_report["valid"]:
            raise RuntimeError("schema validation failed")
        fixture_manifest = json.loads((artifacts / "FIXTURE_MANIFEST.json").read_text(encoding="utf-8"))
        hashes = golden_hashes(artifacts / "golden")
        cleanup = json.loads(
            run(["wp", "gdhe", "a2-fixtures", "cleanup", "--path=cms", "--allow-root"], repository)
        )
        created = False
        cleanup_residue = residue(repository)
        if any(cleanup_residue.values()):
            raise RuntimeError("fixture residue remained after round " + str(round_number))
        return {
            "round": round_number,
            "fixtureDatabaseIds": fixture_manifest,
            "schemaValid": True,
            "goldenSha256": hashes,
            "cleanup": cleanup,
            "residue": cleanup_residue,
        }
    finally:
        if created:
            run(["wp", "gdhe", "a2-fixtures", "cleanup", "--path=cms", "--allow-root"], repository)


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-007"
    rounds = [
        lifecycle(1, repository, plugin, artifacts),
        lifecycle(2, repository, plugin, artifacts),
    ]
    identical = rounds[0]["goldenSha256"] == rounds[1]["goldenSha256"]
    database_ids_changed = (
        rounds[0]["fixtureDatabaseIds"]["posts"] != rounds[1]["fixtureDatabaseIds"]["posts"]
        and rounds[0]["fixtureDatabaseIds"]["attachments"] != rounds[1]["fixtureDatabaseIds"]["attachments"]
    )
    report = {
        "evidenceVersion": "TASK-007-A2-DETERMINISM-R5",
        "fixtureVersion": "TASK-007-A2-R3",
        "lifecycleCount": 2,
        "goldenCountPerRound": 13,
        "goldenHashesIdentical": identical,
        "databaseIdsChangedBetweenRounds": database_ids_changed,
        "publicContractUsesDatabaseIds": False,
        "rounds": rounds,
    }
    output = artifacts / "DETERMINISTIC_GOLDEN_REVISION.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if identical and database_ids_changed else 1


if __name__ == "__main__":
    sys.exit(main())
