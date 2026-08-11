#!/usr/bin/env python3

import json
from pathlib import Path
from decimal import Decimal
from copy import deepcopy

from jsonschema import Draft202012Validator, FormatChecker, RefResolver


ROOTS = (
    "related-product-card-collection.v2.schema.json",
    "mixed-quote-line-validation-request.v1.schema.json",
    "mixed-quote-line-validation-response.v1.schema.json",
)


def fragment_only_refs(value):
    if isinstance(value, dict):
        found = []
        for key, child in value.items():
            if key == "$ref" and isinstance(child, str) and child.startswith("#/$defs/"):
                found.append(child)
            else:
                found.extend(fragment_only_refs(child))
        return found
    if isinstance(value, list):
        found = []
        for child in value:
            found.extend(fragment_only_refs(child))
        return found
    return []


def main():
    schema_dir = Path(__file__).resolve().parents[1] / "config" / "schemas"
    missing = [name for name in ROOTS if not (schema_dir / name).is_file()]
    if missing:
        raise RuntimeError("Missing TASK-025 Schema roots: " + ", ".join(missing))
    schemas = {}
    for path in schema_dir.glob("*.schema.json"):
        schema = json.loads(path.read_text(encoding="utf-8"), parse_float=Decimal)
        Draft202012Validator.check_schema(schema)
        schemas[path.name] = schema
    ambiguous = {
        name: fragment_only_refs(schemas[name])
        for name in ROOTS[1:]
        if fragment_only_refs(schemas[name])
    }
    if ambiguous:
        raise RuntimeError(
            "Mixed Schema roots contain fragment-only internal refs: "
            + json.dumps(ambiguous, sort_keys=True)
        )
    store = {schema["$id"]: schema for schema in schemas.values() if "$id" in schema}
    for name, schema in schemas.items():
        store["https://gdhe.example/schemas/product-card/v1/" + name] = schema
        store["https://gdhe.example/schemas/related-product-card/v2/" + name] = schema

    def reject_remote(uri):
        raise RuntimeError("Network Schema resolution is forbidden: " + uri)

    def validator(name):
        root = schemas[name]
        return Draft202012Validator(
            root,
            resolver=RefResolver.from_schema(
                root,
                store=store,
                handlers={"http": reject_remote, "https": reject_remote},
            ),
            format_checker=FormatChecker(),
        )

    repository = schema_dir.parents[5]
    golden_dir = repository / "TASKS" / "ARTIFACTS" / "TASK-025" / "golden-wordpress"
    roots = {
        "related-product-card-v1.json": "related-product-card-collection.v1.schema.json",
        "related-product-card-v2.json": "related-product-card-collection.v2.schema.json",
        "standard-ready.json": "mixed-quote-line-validation-response.v1.schema.json",
        "custom-sales-follow-up.json": "mixed-quote-line-validation-response.v1.schema.json",
        "migrated-standard-refresh.json": "mixed-quote-line-validation-response.v1.schema.json",
        "mixed-two-line.json": "mixed-quote-line-validation-response.v1.schema.json",
        "mixed-fifty-line.json": "mixed-quote-line-validation-response.v1.schema.json",
    }
    validated = []
    for filename, root in roots.items():
        instance = json.loads((golden_dir / filename).read_text(encoding="utf-8"), parse_float=Decimal)
        errors = list(validator(root).iter_errors(instance))
        if errors:
            raise RuntimeError(f"{filename} failed {root}: {errors[0].message}")
        validated.append(filename)

    response_validator = validator("mixed-quote-line-validation-response.v1.schema.json")
    custom_response = json.loads(
        (golden_dir / "custom-sales-follow-up.json").read_text(encoding="utf-8"),
        parse_float=Decimal,
    )
    response_negatives = {}
    wrong_resolution = deepcopy(custom_response)
    wrong_resolution["lines"][0]["resolution"] = "resolved_article_number"
    response_negatives["custom-wrong-resolution"] = wrong_resolution
    uppercase_response = deepcopy(custom_response)
    uppercase_response["lines"][0]["entryId"] = "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF"
    response_negatives["uppercase-entry-id"] = uppercase_response
    accepted_response_negatives = [
        name for name, value in response_negatives.items()
        if not list(response_validator.iter_errors(value))
    ]
    if accepted_response_negatives:
        raise RuntimeError(
            "Response Schema accepted negatives: " + ", ".join(accepted_response_negatives)
        )

    request = {
        "apiVersion": "1", "schemaVersion": "1.0.0", "locale": "en",
        "lines": [{
            "entryId": "25000000-0000-4000-8000-000000000501",
            "lineKind": "configured_product", "canonicalPath": "/products/fgd-x15-pvc/",
            "selection": {"type": "custom_length", "articleNumber": None,
                          "lengthMeters": Decimal("4.3"),
                          "color": {"code": "ivory-white", "label": "Ivory White"},
                          "resolution": "sales_follow_up"},
            "packaging": {"basePackaging": "standard", "logoPrinting": False,
                          "protectionArrangement": None},
            "quantityUnit": "piece", "quantity": 1,
        }],
    }
    request_validator = validator("mixed-quote-line-validation-request.v1.schema.json")
    if list(request_validator.iter_errors(request)):
        raise RuntimeError("Valid mixed quote-line request failed the request Schema.")
    negatives = {}
    extra = deepcopy(request); extra["unknown"] = True; negatives["unknown-root"] = extra
    zero = deepcopy(request); zero["lines"] = []; negatives["zero-lines"] = zero
    fifty_one = deepcopy(request); fifty_one["lines"] = request["lines"] * 51; negatives["fifty-one-lines"] = fifty_one
    wrong_unit = deepcopy(request); wrong_unit["lines"][0]["quantityUnit"] = "roll"; negatives["wrong-unit"] = wrong_unit
    unsafe_quantity = deepcopy(request); unsafe_quantity["lines"][0]["quantity"] = 9007199254740992; negatives["unsafe-quantity"] = unsafe_quantity
    unknown_line = deepcopy(request); unknown_line["lines"][0]["model"] = "untrusted"; negatives["unknown-line-field"] = unknown_line
    accepted = [name for name, value in negatives.items() if not list(request_validator.iter_errors(value))]
    if accepted:
        raise RuntimeError("Request Schema accepted negatives: " + ", ".join(accepted))

    report = {
        "schemaRoots": list(ROOTS), "schemaRootCount": 3,
        "runtimeGoldenCount": len(validated), "runtimeGoldens": sorted(validated),
        "requestPositiveCount": 1, "requestNegativeCount": len(negatives),
        "requestNegativeNames": sorted(negatives), "draft": "2020-12", "valid": True,
        "responseNegativeCount": len(response_negatives),
        "responseNegativeNames": sorted(response_negatives),
        "mixedRootInternalRefs": "absolute-root-id-plus-fragment",
        "networkResolution": "forbidden",
    }
    output = repository / "TASKS" / "ARTIFACTS" / "TASK-025" / "WORDPRESS_SCHEMA_VALIDATION.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
