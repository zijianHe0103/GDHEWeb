#!/usr/bin/env python3

import json
import sys
from copy import deepcopy
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker, RefResolver


ROOT_SCHEMA = "product-card-collection.v1.schema.json"


def local_references(value):
    references = []
    if isinstance(value, dict):
        reference = value.get("$ref")
        if isinstance(reference, str) and reference and not reference.startswith("#"):
            references.append(reference.split("#", 1)[0])
        for child in value.values():
            references.extend(local_references(child))
    elif isinstance(value, list):
        for child in value:
            references.extend(local_references(child))
    return references


def schema_graph(schema_dir):
    pending = [schema_dir / ROOT_SCHEMA]
    schemas = {}
    while pending:
        path = pending.pop().resolve()
        relative = path.relative_to(schema_dir.resolve()).as_posix()
        if relative in schemas:
            continue
        schema = json.loads(path.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        schemas[relative] = schema
        for reference in local_references(schema):
            pending.append(path.parent / reference)
    return dict(sorted(schemas.items()))


def positive_fixture():
    return {
        "apiVersion": "1",
        "schemaVersion": "1.0.0",
        "locale": "en",
        "type": "product_card",
        "sort": "modified_desc",
        "filter": None,
        "page": 1,
        "perPage": 10,
        "total": 1,
        "totalPages": 1,
        "items": [
            {
                "id": "41000000-0000-4000-8000-000000000001",
                "kind": "detail_product",
                "model": "Synthetic Track A",
                "name": "Synthetic Track A",
                "publicPath": "/products/task-014-synthetic-track-a/",
                "image": {
                    "id": "42000000-0000-4000-8000-000000000001",
                    "url": "https://media.gdhe.example/task-014/track-a.webp",
                    "width": 1200,
                    "height": 800,
                    "alt": "Synthetic protected product fixture",
                },
                "primaryCategory": {
                    "id": "43000000-0000-4000-8000-000000000001",
                    "label": "Synthetic Tracks",
                    "publicPath": "/products/curtain-track-systems/synthetic-tracks/",
                },
                "series": [],
                "applications": [],
                "summary": None,
                "keyAttributes": [
                    {
                        "key": "system_type",
                        "label": "System type",
                        "value": "Synthetic",
                        "unit": None,
                    }
                ],
                "lifecycle": "active",
                "action": {
                    "mode": "view_product",
                    "label": "View Product",
                    "targetPath": "/products/task-014-synthetic-track-a/",
                },
                "modifiedAt": "2026-07-29T16:00:00+00:00",
            }
        ],
    }


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    schema_dir = plugin / "config" / "schemas"
    graph = schema_graph(schema_dir)
    expected = {
        "card-action.v1.schema.json",
        "card-attribute.v1.schema.json",
        "product-card-collection.v1.schema.json",
        "product-card.v1.schema.json",
        "public-path.schema.json",
        "public-protected-media.v1.schema.json",
        "public-taxonomy-ref.v1.schema.json",
        "uuid-v4.schema.json",
    }
    if set(graph) != expected:
        raise RuntimeError("ProductCard Schema closure does not match the frozen eight-file graph.")

    store = {}
    for relative, schema in graph.items():
        if "$id" in schema:
            store[schema["$id"]] = schema
        store["https://gdhe.example/schemas/product-card/v1/" + relative] = schema
    root = graph[ROOT_SCHEMA]
    validator = Draft202012Validator(
        root,
        resolver=RefResolver.from_schema(root, store=store),
        format_checker=FormatChecker(),
    )
    valid = positive_fixture()
    if list(validator.iter_errors(valid)):
        raise RuntimeError("Positive ProductCard fixture did not validate.")

    negatives = {}
    extra = deepcopy(valid)
    extra["items"][0]["postId"] = 14
    negatives["database-id"] = extra
    wrong_path = deepcopy(valid)
    wrong_path["items"][0]["publicPath"] = None
    negatives["detail-path"] = wrong_path
    wrong_action = deepcopy(valid)
    wrong_action["items"][0]["action"]["mode"] = "direct_rfq"
    negatives["action"] = wrong_action
    unprotected = deepcopy(valid)
    unprotected["items"][0]["image"]["url"] = "http://media.gdhe.example/internal.jpg"
    negatives["protected-media"] = unprotected
    empty_alt = deepcopy(valid)
    empty_alt["items"][0]["image"]["alt"] = ""
    negatives["empty-alt"] = empty_alt
    too_many = deepcopy(valid)
    too_many["items"][0]["keyAttributes"] *= 4
    negatives["attribute-limit"] = too_many

    failures = [
        name for name, instance in negatives.items()
        if not list(validator.iter_errors(instance))
    ]
    if failures:
        raise RuntimeError("Negative ProductCard fixtures unexpectedly validated: " + ", ".join(failures))

    golden_dir = repository / "TASKS" / "ARTIFACTS" / "TASK-014" / "golden-product-card"
    golden_results = []
    for path in sorted(golden_dir.glob("*.json")):
        instance = json.loads(path.read_text(encoding="utf-8"))
        errors = sorted(
            validator.iter_errors(instance),
            key=lambda item: list(item.absolute_path),
        )
        golden_results.append({
            "golden": path.name,
            "valid": not errors,
            "errors": [error.message for error in errors],
        })
    if golden_results and not all(item["valid"] for item in golden_results):
        raise RuntimeError("A runtime ProductCard Golden failed Schema validation.")

    report = {
        "schemaVersion": "1.0.0",
        "closureFiles": sorted(graph),
        "positiveCount": 1,
        "negativeCount": len(negatives),
        "runtimeGoldenCount": len(golden_results),
        "runtimeGoldenResults": golden_results,
        "valid": True,
    }
    output = repository / "TASKS" / "ARTIFACTS" / "TASK-014" / "PRODUCT_CARD_SCHEMA_VALIDATION.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
