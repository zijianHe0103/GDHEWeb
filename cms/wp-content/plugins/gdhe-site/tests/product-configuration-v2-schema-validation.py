#!/usr/bin/env python3

import json
from copy import deepcopy
from decimal import Decimal
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker, RefResolver


ROOT_SCHEMA = "product-configuration.v2.schema.json"
EXPECTED = {
    "article-number-option.v1.schema.json",
    ROOT_SCHEMA,
    "public-path.schema.json",
    "uuid-v4.schema.json",
}


def references(value):
    found = []
    if isinstance(value, dict):
        reference = value.get("$ref")
        if isinstance(reference, str) and reference and not reference.startswith("#"):
            target = reference.split("#", 1)[0]
            if "://" in target or target.startswith("/") or ".." in Path(target).parts:
                raise RuntimeError("Product Configuration v2 Schema has an unsafe reference.")
            found.append(target)
        for child in value.values():
            found.extend(references(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(references(child))
    return found


def graph(schema_dir):
    pending = [schema_dir / ROOT_SCHEMA]
    schemas = {}
    root = schema_dir.resolve()
    while pending:
        path = pending.pop().resolve()
        relative = path.relative_to(root).as_posix()
        if relative in schemas:
            continue
        schema = json.loads(path.read_text(encoding="utf-8"), parse_float=Decimal)
        Draft202012Validator.check_schema(schema)
        schemas[relative] = schema
        pending.extend(path.parent / item for item in references(schema))
    return dict(sorted(schemas.items()))


def main():
    plugin = Path(__file__).resolve().parents[1]
    repository = plugin.parents[3]
    artifacts = repository / "TASKS" / "ARTIFACTS" / "TASK-021"
    schemas = graph(plugin / "config" / "schemas")
    if set(schemas) != EXPECTED:
        raise RuntimeError("Product Configuration v2 closure is not the frozen four-file graph.")
    store = {}
    for relative, schema in schemas.items():
        if "$id" in schema:
            store[schema["$id"]] = schema
        store["https://gdhe.example/schemas/product-configuration/v2/" + relative] = schema
    root = schemas[ROOT_SCHEMA]
    validator = Draft202012Validator(
        root,
        resolver=RefResolver.from_schema(root, store=store),
        format_checker=FormatChecker(),
    )
    golden_path = artifacts / "golden-product-configuration-v2" / "fgd-x15-pvc.json"
    valid = json.loads(golden_path.read_text(encoding="utf-8"), parse_float=Decimal)
    if list(validator.iter_errors(valid)):
        raise RuntimeError("Runtime Product Configuration v2 Golden failed Schema validation.")
    decimal_positive_failures = []
    for label in ("4.3", "5.8", "6.7"):
        candidate = deepcopy(valid)
        candidate["articleNumberOptions"][0]["lengthMeters"] = Decimal(label)
        errors = list(validator.iter_errors(candidate))
        if errors:
            decimal_positive_failures.append(
                {"lengthMeters": label, "message": errors[0].message}
            )
    if decimal_positive_failures:
        raise RuntimeError(
            "Exact one-tenth full-root positives failed: "
            + json.dumps(decimal_positive_failures, separators=(",", ":"))
        )
    negatives = {}
    for name, mutator in {
        "installation-field": lambda item: item["configurationPolicy"].update({"installationMethods": []}),
        "accessory-field": lambda item: item["configurationPolicy"].update({"installationAccessory": {}}),
        "internal-field": lambda item: item.update({"purchasePrice": "private"}),
        "malformed-length": lambda item: item["articleNumberOptions"][0].update({"lengthMeters": Decimal("6.05")}),
        "malformed-color": lambda item: item["articleNumberOptions"][0]["color"].update({"code": "Ivory White"}),
        "database-id": lambda item: item["product"].update({"postId": 2749}),
        "wrong-version": lambda item: item.update({"schemaVersion": "1.0.0"}),
    }.items():
        candidate = deepcopy(valid)
        mutator(candidate)
        negatives[name] = candidate
    failures = [name for name, item in negatives.items() if not list(validator.iter_errors(item))]
    if failures:
        raise RuntimeError("Negative v2 fixtures validated: " + ", ".join(failures))
    report = {
        "schemaVersion": "2.0.0",
        "closureFiles": sorted(schemas),
        "closureCount": len(schemas),
        "positiveCount": 4,
        "exactDecimalFullRootCases": {
            "4.3": True,
            "5.8": True,
            "6.7": True,
            "6.05": False,
        },
        "negativeCount": len(negatives),
        "runtimeGoldenCount": 1,
        "valid": True,
    }
    output = artifacts / "PRODUCT_CONFIGURATION_V2_SCHEMA_VALIDATION.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
