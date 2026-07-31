#!/usr/bin/env python3

import json
from copy import deepcopy
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker, RefResolver


ROOT_SCHEMA = "product-configuration.v1.schema.json"


def local_references(value):
    references = []
    if isinstance(value, dict):
        reference = value.get("$ref")
        if isinstance(reference, str) and reference and not reference.startswith("#"):
            target = reference.split("#", 1)[0]
            if "://" in target or target.startswith("/") or ".." in Path(target).parts:
                raise RuntimeError("Product Configuration Schema contains an unsafe reference.")
            references.append(target)
        for child in value.values():
            references.extend(local_references(child))
    elif isinstance(value, list):
        for child in value:
            references.extend(local_references(child))
    return references


def schema_graph(schema_dir):
    pending = [schema_dir / ROOT_SCHEMA]
    schemas = {}
    root = schema_dir.resolve()
    while pending:
        path = pending.pop().resolve()
        try:
            relative = path.relative_to(root).as_posix()
        except ValueError as error:
            raise RuntimeError("Product Configuration Schema reference escaped its root.") from error
        if relative in schemas:
            continue
        if not path.is_file():
            raise RuntimeError("Product Configuration Schema closure file is missing: " + relative)
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
        "type": "product_configuration",
        "product": {
            "id": "17000000-0000-4000-8000-000000000001",
            "model": "FGD X15+PVC",
            "name": "FGD X15+PVC Track",
            "publicPath": "/products/fgd-x15-pvc/",
            "productKind": "curtain_track",
            "quantityUnit": "piece",
        },
        "articleNumberOptions": [
            {
                "articleNumber": "GDHEPRD000172",
                "lengthMeters": 6,
                "color": {"code": "ivory-white", "label": "Ivory White"},
            }
        ],
        "configurationPolicy": {
            "installationMethods": [
                {
                    "method": "ceiling",
                    "changesTrackArticleNumber": False,
                    "optionalAccessory": None,
                },
                {
                    "method": "wall",
                    "changesTrackArticleNumber": False,
                    "optionalAccessory": None,
                },
            ],
            "packaging": {
                "scope": "curtain_track",
                "basePackaging": {
                    "required": True,
                    "selectionMode": "single",
                    "options": ["standard", "carton", "large_shrink_wrap"],
                },
                "logoPrinting": {"available": True, "valueType": "boolean"},
                "protectionArrangement": {
                    "required": False,
                    "selectionMode": "single",
                    "options": ["single_bag", "paired"],
                },
            },
            "customLength": {
                "enabled": True,
                "articleNumberResolution": "sales_follow_up",
                "minimumExclusive": 0,
                "maximum": None,
                "decimalPlaces": 1,
            },
        },
        "modifiedAt": "2026-07-31T01:01:00+00:00",
    }


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    schema_dir = plugin / "config" / "schemas"
    graph = schema_graph(schema_dir)
    expected = {
        "article-number-option.v1.schema.json",
        "product-configuration.v1.schema.json",
        "public-path.schema.json",
        "uuid-v4.schema.json",
    }
    if set(graph) != expected:
        raise RuntimeError("Product Configuration closure is not the frozen four-file graph.")

    store = {}
    for relative, schema in graph.items():
        if "$id" in schema:
            store[schema["$id"]] = schema
        store["https://gdhe.example/schemas/product-configuration/v1/" + relative] = schema
    root = graph[ROOT_SCHEMA]
    validator = Draft202012Validator(
        root,
        resolver=RefResolver.from_schema(root, store=store),
        format_checker=FormatChecker(),
    )
    valid = positive_fixture()
    if list(validator.iter_errors(valid)):
        raise RuntimeError("Positive Product Configuration fixture did not validate.")

    negatives = {}
    database_id = deepcopy(valid)
    database_id["product"]["postId"] = 1978
    negatives["database-id"] = database_id
    wrong_version = deepcopy(valid)
    wrong_version["schemaVersion"] = "3.0.0"
    negatives["schema-version"] = wrong_version
    wrong_article = deepcopy(valid)
    wrong_article["articleNumberOptions"][0]["articleNumber"] = "TEMP-172"
    negatives["article-number"] = wrong_article
    precision = deepcopy(valid)
    precision["articleNumberOptions"][0]["lengthMeters"] = 6.55
    negatives["length-precision"] = precision
    accessory = deepcopy(valid)
    accessory["configurationPolicy"]["installationMethods"][0]["optionalAccessory"] = {
        "model": "Guessed Bracket",
        "name": "Guessed Bracket",
        "articleNumber": "GDHEPRD999999",
    }
    negatives["incomplete-accessory"] = accessory
    packaging = deepcopy(valid)
    packaging["configurationPolicy"]["packaging"]["basePackaging"]["options"] = [
        "standard",
        "carton",
    ]
    negatives["packaging"] = packaging
    custom_article = deepcopy(valid)
    custom_article["configurationPolicy"]["customLength"]["articleNumber"] = "GDHEPRD000172"
    negatives["custom-article-number"] = custom_article
    internal = deepcopy(valid)
    internal["purchasePrice"] = "MUST_NOT_LEAK"
    negatives["internal-field"] = internal

    failures = [
        name
        for name, instance in negatives.items()
        if not list(validator.iter_errors(instance))
    ]
    if failures:
        raise RuntimeError(
            "Negative Product Configuration fixtures unexpectedly validated: "
            + ", ".join(failures)
        )

    golden_dir = (
        repository
        / "TASKS"
        / "ARTIFACTS"
        / "TASK-019"
        / "golden-product-configuration"
    )
    golden_results = []
    for path in sorted(golden_dir.glob("*.json")):
        instance = json.loads(path.read_text(encoding="utf-8"))
        errors = sorted(
            validator.iter_errors(instance),
            key=lambda item: list(item.absolute_path),
        )
        golden_results.append(
            {
                "golden": path.name,
                "valid": not errors,
                "errors": [error.message for error in errors],
            }
        )
    if golden_results and not all(item["valid"] for item in golden_results):
        raise RuntimeError("A runtime Product Configuration Golden failed Schema validation.")

    report = {
        "schemaVersion": "1.0.0",
        "closureFiles": sorted(graph),
        "positiveCount": 1,
        "negativeCount": len(negatives),
        "runtimeGoldenCount": len(golden_results),
        "runtimeGoldenResults": golden_results,
        "valid": True,
    }
    output = (
        repository
        / "TASKS"
        / "ARTIFACTS"
        / "TASK-019"
        / "PRODUCT_CONFIGURATION_SCHEMA_VALIDATION.json"
    )
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
