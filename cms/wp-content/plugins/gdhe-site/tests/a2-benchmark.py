#!/usr/bin/env python3

import concurrent.futures
import json
import math
import statistics
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


FIXTURES = {
    "home": "/",
    "service": "/services/task-007-a2-precision-machining/",
    "caseStudy": "/case-studies/task-007-a2-aerospace-bracket/",
    "material": "/materials/task-007-a2-aluminum-6061/",
}


def request_once(base_url, public_path):
    query = urllib.parse.urlencode({"locale": "en", "path": public_path, "schema": "2.0.0"})
    url = base_url.rstrip("/") + "/wp-json/gdhe/v1/resolve?" + query
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            body = response.read()
            status = response.status
    except Exception as error:
        return {"milliseconds": (time.perf_counter() - started) * 1000, "status": 0, "bytes": 0, "error": str(error)}
    return {"milliseconds": (time.perf_counter() - started) * 1000, "status": status, "bytes": len(body), "error": ""}


def percentile(values, percentage):
    ordered = sorted(values)
    rank = max(0, math.ceil(percentage * len(ordered)) - 1)
    return ordered[rank]


def main():
    if len(sys.argv) != 3:
        print("usage: a2-benchmark.py BASE_URL OUTPUT_JSON", file=sys.stderr)
        return 2
    base_url = sys.argv[1]
    output = Path(sys.argv[2])
    requests_per_fixture = 200
    concurrency = 20
    report = {
        "benchmarkVersion": "TASK-007-A2-BENCHMARK-R3",
        "fixtureVersion": "TASK-007-A2-R3",
        "baseUrl": base_url,
        "warmed": True,
        "warmupRequestCount": len(FIXTURES),
        "requestsPerFixture": requests_per_fixture,
        "concurrency": concurrency,
        "originRequestCount": requests_per_fixture * len(FIXTURES),
        "requestGraph": {
            "nodes": ["benchmark-client", "wordpress-rest", "gdhe-resolver", "scf-normalizer", "mysql-media"],
            "edges": [
                ["benchmark-client", "wordpress-rest"],
                ["wordpress-rest", "gdhe-resolver"],
                ["gdhe-resolver", "scf-normalizer"],
                ["scf-normalizer", "mysql-media"],
            ],
        },
        "fixtures": {},
    }

    for public_path in FIXTURES.values():
        warmup = request_once(base_url, public_path)
        if warmup["status"] != 200:
            raise RuntimeError("warmup failed for " + public_path + ": " + json.dumps(warmup))

    all_results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as pool:
        for name, public_path in FIXTURES.items():
            futures = [pool.submit(request_once, base_url, public_path) for _ in range(requests_per_fixture)]
            all_results[name] = [future.result() for future in futures]

    total_errors = 0
    all_latencies = []
    for name, results in all_results.items():
        latencies = [item["milliseconds"] for item in results]
        errors = [item for item in results if item["status"] != 200 or item["error"]]
        total_errors += len(errors)
        all_latencies.extend(latencies)
        report["fixtures"][name] = {
            "publicPath": FIXTURES[name],
            "requestCount": len(results),
            "originRequestCount": len(results),
            "payloadBytes": statistics.mode([item["bytes"] for item in results]),
            "p50Milliseconds": round(percentile(latencies, 0.50), 3),
            "p95Milliseconds": round(percentile(latencies, 0.95), 3),
            "errorRate": round(len(errors) / len(results), 6),
        }

    report["aggregate"] = {
        "requestCount": len(all_latencies),
        "p50Milliseconds": round(percentile(all_latencies, 0.50), 3),
        "p95Milliseconds": round(percentile(all_latencies, 0.95), 3),
        "errorRate": round(total_errors / len(all_latencies), 6),
    }
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if total_errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
