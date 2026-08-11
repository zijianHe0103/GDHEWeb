#!/usr/bin/env python3

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[5]
ENDPOINT = "http://127.0.0.1:8080/wp-json/gdhe/v1/quote-line-validations"


def configured(entry_id, resolution, length):
    return {
        "entryId": entry_id,
        "lineKind": "configured_product",
        "canonicalPath": "/products/fgd-x15-pvc/",
        "selection": {
            "type": "custom_length" if resolution == "sales_follow_up" else "article_number",
            "articleNumber": "GDHEPRD000172" if resolution == "standard_ready" else None,
            "lengthMeters": length,
            "color": {"code": "ivory-white", "label": "Ivory White"},
            "resolution": resolution,
        },
        "packaging": {"basePackaging": "standard", "logoPrinting": False, "protectionArrangement": None},
        "quantityUnit": "piece",
        "quantity": 1,
    }


def accessory(entry_id):
    return {
        "entryId": entry_id,
        "lineKind": "catalog_accessory",
        "articleNumber": "GDHEPRD000901",
        "quantityUnit": "piece",
        "quantity": 1,
    }


def send(lines):
    body = json.dumps({"apiVersion": "1", "schemaVersion": "1.0.0", "locale": "en", "lines": lines}, separators=(",", ":")).encode()
    request = Request(ENDPOINT, data=body, method="POST", headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=5) as response:
        raw = response.read()
        parsed = json.loads(raw)
        return {
            "status": response.status,
            "cacheControl": response.headers.get("Cache-Control"),
            "etagPresent": response.headers.get("ETag") is not None,
            "requestIdPresent": response.headers.get("X-GDHE-Request-ID") is not None,
            "lineCount": len(parsed["lines"]),
            "sha256": hashlib.sha256(raw).hexdigest(),
        }


def main():
    one = send([configured("25000000-0000-4000-8000-000000000601", "standard_ready", 6)])
    lines = [
        configured("25000000-0000-4000-8000-000000000602", "standard_ready", 6),
        accessory("25000000-0000-4000-8000-000000000603"),
    ]
    for index in range(48):
        lines.append(configured(f"25000000-0000-4000-8000-{604 + index:012d}", "sales_follow_up", (index + 1) / 10))
    fifty = send(lines)
    for expected, result in ((1, one), (50, fifty)):
        if result["status"] != 200 or result["lineCount"] != expected:
            raise RuntimeError("Real HTTP route returned an unexpected document.")
        if result["cacheControl"] != "no-store" or result["etagPresent"] or not result["requestIdPresent"]:
            raise RuntimeError("Real HTTP cache/header contract drifted.")
    report = {
        "runtimeBase": "http://127.0.0.1:8080",
        "method": "POST",
        "path": "/wp-json/gdhe/v1/quote-line-validations",
        "contentType": "application/json",
        "anonymous": True,
        "oneLine": one,
        "fiftyLines": fifty,
        "valid": True,
    }
    output = ROOT / "TASKS/ARTIFACTS/TASK-025/WORDPRESS_REAL_HTTP_EVIDENCE.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
