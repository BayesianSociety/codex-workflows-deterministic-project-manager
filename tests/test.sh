#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

curl_json() {
  local method="$1"
  local path="$2"
  local expected="$3"
  local data="${4:-}"

  echo "==> ${method} ${BASE_URL}${path}"
  if [[ -n "$data" ]]; then
    status=$(curl -s -o /tmp/codex_test_body -w "%{http_code}" -X "$method" \
      -H 'Content-Type: application/json' \
      -d "$data" \
      "${BASE_URL}${path}")
  else
    status=$(curl -s -o /tmp/codex_test_body -w "%{http_code}" -X "$method" "${BASE_URL}${path}")
  fi

  if [[ "$status" != "$expected" && ( "$expected" != "200_or_201" || ( "$status" != "200" && "$status" != "201" ) ) ]]; then
    echo "Expected status $expected but got $status"
    cat /tmp/codex_test_body || true
    exit 1
  fi
  cat /tmp/codex_test_body
  echo ""
}

curl_json GET /health 200
curl_json GET /scores 200
curl_json POST /scores 200_or_201 '{"name":"QA Bot","score":42}'

echo "All route checks passed."
