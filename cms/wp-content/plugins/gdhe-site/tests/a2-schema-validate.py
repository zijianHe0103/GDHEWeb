#!/usr/bin/env python3

import json
import sys
from copy import deepcopy
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker, RefResolver


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    schema_dir = plugin / "config" / "schemas"
    golden_dir = repository / "TASKS" / "ARTIFACTS" / "TASK-007" / "golden"
    output = repository / "TASKS" / "ARTIFACTS" / "TASK-007" / "SCHEMA_VALIDATION.json"

    store = {}
    for path in sorted(schema_dir.rglob("*.json")):
        schema = json.loads(path.read_text(encoding="utf-8"))
        if "$id" in schema:
            store[schema["$id"]] = schema

    mappings = {
        "resolve-home.json": "page.schema.json",
        "resolve-service.json": "page.schema.json",
        "resolve-case-study.json": "page.schema.json",
        "resolve-material.json": "page.schema.json",
        "collection-service.json": "collection.schema.json",
        "collection-service-page-2.json": "collection.schema.json",
        "collection-service-page-3-empty.json": "collection.schema.json",
        "collection-service-modified.json": "collection.schema.json",
        "collection-service-per-page-1.json": "collection.schema.json",
        "collection-case-study.json": "collection.schema.json",
        "collection-material.json": "collection.schema.json",
        "navigation.json": "navigation.schema.json",
        "route-manifest.json": "route-manifest.schema.json",
    }
    results = []
    for golden_name, schema_name in mappings.items():
        instance = json.loads((golden_dir / golden_name).read_text(encoding="utf-8"))
        schema = json.loads((schema_dir / schema_name).read_text(encoding="utf-8"))
        resolver = RefResolver.from_schema(schema, store=store)
        validator = Draft202012Validator(schema, resolver=resolver, format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(instance), key=lambda item: list(item.absolute_path))
        results.append(
            {
                "golden": golden_name,
                "schema": schema_name,
                "valid": not errors,
                "errors": [error.message for error in errors],
            }
        )

    error_schema = json.loads((schema_dir / "error.schema.json").read_text(encoding="utf-8"))
    error_validator = Draft202012Validator(
        error_schema,
        resolver=RefResolver.from_schema(error_schema, store=store),
        format_checker=FormatChecker(),
    )
    error_fixtures = json.loads((repository / "TASKS" / "ARTIFACTS" / "TASK-007" / "ERROR_CONTRACT_FIXTURES.json").read_text(encoding="utf-8"))
    error_results = []
    for name, instance in sorted(error_fixtures.items()):
        errors = sorted(error_validator.iter_errors(instance), key=lambda item: list(item.absolute_path))
        error_results.append({"fixture": name, "valid": not errors, "errors": [error.message for error in errors]})

    module_bundle = json.loads((repository / "TASKS" / "ARTIFACTS" / "TASK-007" / "MODULE_CONTRACT_FIXTURES.json").read_text(encoding="utf-8"))
    module_names = {
        "accordion": "accordion.schema.json",
        "card_grid": "card-grid.schema.json",
        "split_media": "split-media.schema.json",
        "cta_banner": "cta-banner.schema.json",
    }
    module_results = []
    for instance in module_bundle["valid"]:
        schema_name = module_names[instance["type"]]
        schema = json.loads((schema_dir / "modules" / schema_name).read_text(encoding="utf-8"))
        validator = Draft202012Validator(schema, resolver=RefResolver.from_schema(schema, store=store), format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(instance), key=lambda item: list(item.absolute_path))
        module_results.append({"schema": schema_name, "expectedValid": True, "valid": not errors, "errors": [error.message for error in errors]})
    for fixture in module_bundle["invalid"]:
        schema = json.loads((schema_dir / "modules" / fixture["schema"]).read_text(encoding="utf-8"))
        validator = Draft202012Validator(schema, resolver=RefResolver.from_schema(schema, store=store), format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(fixture["instance"]), key=lambda item: list(item.absolute_path))
        module_results.append({"schema": fixture["schema"], "expectedValid": False, "valid": not errors, "errors": [error.message for error in errors]})

    module_expectations_met = all(item["valid"] == item["expectedValid"] for item in module_results)

    def validate_instance(schema_name, instance):
        schema = json.loads((schema_dir / schema_name).read_text(encoding="utf-8"))
        validator = Draft202012Validator(schema, resolver=RefResolver.from_schema(schema, store=store), format_checker=FormatChecker())
        return not list(validator.iter_errors(instance))

    page_instance = json.loads((golden_dir / "resolve-home.json").read_text(encoding="utf-8"))
    navigation_instance = json.loads((golden_dir / "navigation.json").read_text(encoding="utf-8"))
    route_instance = json.loads((golden_dir / "route-manifest.json").read_text(encoding="utf-8"))
    bad_uuid_page = deepcopy(page_instance)
    bad_uuid_page["id"] = "10000000-0000-5000-8000-000000000001"
    relation_overflow = deepcopy(page_instance)
    relation_item = json.loads((golden_dir / "resolve-service.json").read_text(encoding="utf-8"))["relations"]["materials"][0]
    relation_overflow["relations"]["materials"] = [deepcopy(relation_item) for _ in range(21)]
    navigation_overflow = deepcopy(navigation_instance)
    navigation_overflow["items"] = [deepcopy(navigation_instance["items"][0]) for _ in range(101)]
    deep_node = deepcopy(navigation_instance["items"][0])
    deep_node["children"] = []
    level_three = deepcopy(deep_node)
    level_three["children"] = [deepcopy(deep_node)]
    level_two = deepcopy(deep_node)
    level_two["children"] = [level_three]
    level_one = deepcopy(deep_node)
    level_one["children"] = [level_two]
    navigation_depth = deepcopy(navigation_instance)
    navigation_depth["items"] = [level_one]
    route_overflow = deepcopy(route_instance)
    route_overflow["routes"] = [deepcopy(route_instance["routes"][0]) for _ in range(5001)]
    boundary_cases = [
        ("uuid-v4", "page.schema.json", bad_uuid_page, False),
        ("relation-max-items", "page.schema.json", relation_overflow, False),
        ("navigation-max-items", "navigation.schema.json", navigation_overflow, False),
        ("navigation-max-depth", "navigation.schema.json", navigation_depth, False),
        ("route-max-items", "route-manifest.schema.json", route_overflow, False),
    ]
    boundary_results = []
    for name, schema_name, instance, expected_valid in boundary_cases:
        valid = validate_instance(schema_name, instance)
        boundary_results.append({"fixture": name, "expectedValid": expected_valid, "valid": valid})
    boundary_expectations_met = all(item["valid"] == item["expectedValid"] for item in boundary_results)

    public_path_schema = json.loads((schema_dir / "public-path.schema.json").read_text(encoding="utf-8"))
    public_path_validator = Draft202012Validator(public_path_schema)
    valid_paths = ["/", "/services/task-007-a2-precision-machining/"]
    invalid_paths = ["/services//bad/", "/services/../bad/", "/Services/bad/", "/services%2fbad/", "/services/bad/?x=1", "/services/bad/#x"]
    path_schema_valid = all(public_path_validator.is_valid(value) for value in valid_paths) and all(not public_path_validator.is_valid(value) for value in invalid_paths)

    report = {
        "validator": "jsonschema Draft202012Validator",
        "fixtureVersion": "TASK-007-A2-R3",
        "validatedCount": len(results),
        "errorFixtureCount": len(error_results),
        "moduleFixtureCount": len(module_results),
        "valid": all(item["valid"] for item in results) and all(item["valid"] for item in error_results) and module_expectations_met and boundary_expectations_met and path_schema_valid,
        "results": results,
        "errorResults": error_results,
        "moduleResults": module_results,
        "boundaryResults": boundary_results,
        "publicPathSchemaMatrixValid": path_schema_valid,
    }
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
