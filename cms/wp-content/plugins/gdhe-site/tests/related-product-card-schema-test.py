#!/usr/bin/env python3

import json
import sys
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlparse

from jsonschema import Draft202012Validator, FormatChecker, RefResolver


ROOT_SCHEMA = "related-product-card-collection.v1.schema.json"


def references(value):
    found = []
    if isinstance(value, dict):
        reference = value.get("$ref")
        if isinstance(reference, str) and reference and not reference.startswith("#"):
            found.append(reference.split("#", 1)[0])
        for child in value.values():
            found.extend(references(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(references(child))
    return found


def schema_graph(schema_dir):
    all_schemas = {}
    id_paths = {}
    for path in sorted(schema_dir.glob("*.schema.json")):
        schema = json.loads(path.read_text(encoding="utf-8"))
        all_schemas[path.name] = schema
        if isinstance(schema.get("$id"), str):
            id_paths[schema["$id"]] = path.name
    pending = [ROOT_SCHEMA]
    graph = {}
    while pending:
        relative = pending.pop()
        if relative in graph:
            continue
        schema = all_schemas[relative]
        Draft202012Validator.check_schema(schema)
        graph[relative] = schema
        for reference in references(schema):
            if urlparse(reference).scheme:
                dependency = id_paths.get(reference)
                if dependency is None:
                    basename = Path(urlparse(reference).path).name
                    dependency = basename if basename in all_schemas else None
            else:
                dependency = Path(relative).parent.joinpath(reference).as_posix()
            if not dependency or dependency not in all_schemas:
                raise RuntimeError("Unresolved RelatedProductCard Schema reference: " + reference)
            pending.append(dependency)
    return dict(sorted(graph.items()))


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    schema_dir = plugin / "config" / "schemas"
    graph = schema_graph(schema_dir)
    expected = {
        "card-action.v1.schema.json",
        "card-attribute.v1.schema.json",
        "product-card.v1.schema.json",
        "public-path.schema.json",
        "public-protected-media.v1.schema.json",
        "public-taxonomy-ref.v1.schema.json",
        "related-product-card-collection.v1.schema.json",
        "related-product-card-item.v1.schema.json",
        "uuid-v4.schema.json",
    }
    if set(graph) != expected:
        raise RuntimeError("RelatedProductCard Schema closure is not the exact nine-file graph.")

    store = {schema["$id"]: schema for schema in graph.values() if "$id" in schema}
    for relative, schema in graph.items():
        store["https://gdhe.example/schemas/product-card/v1/" + relative] = schema
    root = graph[ROOT_SCHEMA]
    validator = Draft202012Validator(
        root,
        resolver=RefResolver.from_schema(root, store=store),
        format_checker=FormatChecker(),
    )
    golden_dir = repository / "TASKS" / "ARTIFACTS" / "TASK-023" / "golden-related-product-card"
    goldens = []
    for path in sorted(golden_dir.glob("*.json")):
        instance = json.loads(path.read_text(encoding="utf-8"))
        errors = sorted(validator.iter_errors(instance), key=lambda item: list(item.absolute_path))
        goldens.append({
            "golden": path.name,
            "valid": not errors,
            "errors": [error.message for error in errors],
        })
    if len(goldens) != 4 or not all(item["valid"] for item in goldens):
        raise RuntimeError("RelatedProductCard runtime Goldens failed the root Schema.")

    positive = json.loads((golden_dir / "four-plus.json").read_text(encoding="utf-8"))
    negatives = {}
    extra = deepcopy(positive)
    extra["postId"] = 1
    negatives["database-id"] = extra
    too_many = deepcopy(positive)
    too_many["items"] = too_many["items"] * 6
    negatives["relation-limit"] = too_many
    wrong_detail_quote = deepcopy(positive)
    wrong_detail_quote["items"][0]["directQuote"] = {
        "kind": "catalog_accessory",
        "quantityUnit": "piece",
    }
    negatives["detail-direct-quote"] = wrong_detail_quote
    missing_accessory_quote = deepcopy(positive)
    missing_accessory_quote["items"][1]["directQuote"] = None
    negatives["accessory-missing-direct-quote"] = missing_accessory_quote
    invalid_unit = deepcopy(positive)
    invalid_unit["items"][1]["directQuote"]["quantityUnit"] = "box"
    negatives["invalid-quantity-unit"] = invalid_unit
    unprotected = deepcopy(positive)
    unprotected["items"][0]["card"]["image"]["url"] = "http://media.gdhe.example/internal.jpg"
    negatives["hostile-media"] = unprotected
    invalid_card = deepcopy(positive)
    invalid_card["items"][0]["card"]["articleNumber"] = "PRIVATE-1"
    negatives["product-card-extra-field"] = invalid_card

    accepted_negatives = [
        name for name, instance in negatives.items()
        if not list(validator.iter_errors(instance))
    ]
    if accepted_negatives:
        raise RuntimeError(
            "RelatedProductCard Schema accepted negatives: " + ", ".join(accepted_negatives)
        )

    report = {
        "schemaVersion": "1.0.0",
        "closureFiles": sorted(graph),
        "closureFileCount": len(graph),
        "runtimeGoldenCount": len(goldens),
        "runtimeGoldenResults": goldens,
        "negativeCount": len(negatives),
        "negativeNames": sorted(negatives),
        "valid": True,
    }
    output = repository / "TASKS" / "ARTIFACTS" / "TASK-023" / "RELATED_PRODUCT_SCHEMA_VALIDATION.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
