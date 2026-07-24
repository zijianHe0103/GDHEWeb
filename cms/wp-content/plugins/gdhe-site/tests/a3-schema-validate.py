#!/usr/bin/env python3

import json
import hashlib
import sys
from copy import deepcopy
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker, RefResolver


ROOT_SCHEMAS = (
    "page.v3.schema.json",
    "collection.v3.schema.json",
    "navigation.schema.json",
    "route-manifest.schema.json",
    "error.schema.json",
)


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


def transitive_schema_graph(schema_dir):
    pending = [schema_dir / name for name in ROOT_SCHEMAS]
    schemas = {}
    while pending:
        path = pending.pop()
        path = path.resolve()
        relative = path.relative_to(schema_dir.resolve()).as_posix()
        if relative in schemas:
            continue
        schema = json.loads(path.read_text(encoding="utf-8"))
        schemas[relative] = schema
        for reference in local_references(schema):
            pending.append(path.parent / reference)
    return dict(sorted(schemas.items()))


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    schema_dir = plugin / "config" / "schemas"
    golden_dir = repository / "TASKS" / "ARTIFACTS" / "TASK-007" / "golden-a3"
    output = repository / "TASKS" / "ARTIFACTS" / "TASK-007" / "A3_SCHEMA_VALIDATION.json"
    graph = transitive_schema_graph(schema_dir)
    store = {}
    for relative, schema in graph.items():
        if "$id" in schema:
            store[schema["$id"]] = schema
        store["https://gdhe.example/schemas/v3/" + relative] = schema
    mappings = {}
    for path in sorted(golden_dir.glob("resolve-*.json")):
        mappings[path.name] = "page.v3.schema.json"
    for path in sorted(golden_dir.glob("collection-*.json")):
        mappings[path.name] = "collection.v3.schema.json"
    mappings["navigation.json"] = "navigation.schema.json"
    mappings["route-manifest.json"] = "route-manifest.schema.json"
    results = []
    for golden_name, schema_name in mappings.items():
        instance = json.loads((golden_dir / golden_name).read_text(encoding="utf-8"))
        schema = graph[schema_name]
        resolver = RefResolver.from_schema(schema, store=store)
        validator = Draft202012Validator(schema, resolver=resolver, format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(instance), key=lambda item: list(item.absolute_path))
        results.append({
            "golden": golden_name,
            "schema": schema_name,
            "valid": not errors,
            "errors": [error.message for error in errors],
        })

    page_schema = graph["page.v3.schema.json"]
    validator = Draft202012Validator(
        page_schema,
        resolver=RefResolver.from_schema(page_schema, store=store),
        format_checker=FormatChecker(),
    )
    product = json.loads((golden_dir / "resolve-product-alpha.json").read_text(encoding="utf-8"))
    bad_uuid = deepcopy(product)
    bad_uuid["id"] = "31000000-0000-5000-8000-000000000002"
    too_many_relations = deepcopy(product)
    relation = product["relations"]["markets"][0]
    too_many_relations["relations"]["markets"] = [deepcopy(relation) for _ in range(21)]
    missing_product_code = deepcopy(product)
    del missing_product_code["details"]["productCode"]
    database_id = deepcopy(product)
    database_id["postId"] = 123
    http_product_video = deepcopy(product)
    http_product_video["details"]["videoUrl"] = "http://media.gdhe.example/product.mp4"
    support = json.loads((golden_dir / "resolve-support.json").read_text(encoding="utf-8"))
    non_https_support_video = deepcopy(support)
    non_https_support_video["details"]["videoUrl"] = "ftp://media.gdhe.example/support.mp4"
    boundary_instances = {
        "uuid-v4": bad_uuid,
        "relation-max-items": too_many_relations,
        "required-product-code": missing_product_code,
        "database-id-additional-property": database_id,
        "product-video-http": http_product_video,
        "support-video-non-https": non_https_support_video,
    }
    boundaries = []
    for name, instance in boundary_instances.items():
        valid = not list(validator.iter_errors(instance))
        boundaries.append({"fixture": name, "expectedValid": False, "valid": valid})
    report = {
        "validator": "jsonschema Draft202012Validator",
        "fixtureVersion": "TASK-007-A3-REVIEW-R1",
        "schemaGraphRoots": list(ROOT_SCHEMAS),
        "schemaGraphFiles": list(graph),
        "schemaGraphSha256": {
            relative: hashlib.sha256((schema_dir / relative).read_bytes()).hexdigest()
            for relative in graph
        },
        "validatedCount": len(results),
        "valid": all(item["valid"] for item in results)
        and all(item["valid"] == item["expectedValid"] for item in boundaries),
        "results": results,
        "boundaryResults": boundaries,
    }
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
