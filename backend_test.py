import json
import os
import urllib.request

BASE = os.environ.get("NEXT_PUBLIC_BASE_URL", "https://realtime-craft.preview.emergentagent.com").rstrip("/") + "/api/data"


def request(method="GET", query="", payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(BASE + query, data=data, method=method, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.status, json.loads(response.read())


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS: {message}")


try:
    status, body = request("GET")
    check(status == 200, "GET default returns 200")
    check(isinstance(body.get("points"), list) and len(body["points"]) == 1200, "GET default returns 1200 points")
    check(isinstance(body.get("meta"), dict), "GET includes meta")

    for query, expected in [("?points=24", 24), ("?points=50000", 50000), ("?points=1", 24), ("?points=999999", 50000), ("?points=not-a-number", 1200)]:
        status, body = request("GET", query)
        check(status == 200 and len(body["points"]) == expected, f"GET {query or 'default'} safely yields {expected} points")

    status, body = request("POST", payload={"value": 42.5})
    check(status == 200 and body.get("accepted") is True and body["point"]["value"] == 42.5, "POST numeric value accepted")
    status, body = request("POST", payload={})
    check(status == 200 and body.get("accepted") is True and body["point"]["value"] == 100, "POST missing value safely defaults")
    print("BACKEND TESTS PASSED")
except Exception as exc:
    print(f"BACKEND TESTS FAILED: {exc}")
    raise
