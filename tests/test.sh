#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"

run_curl() {
  local method=$1
  local path=$2
  local data=${3-}
  local tmp status
  tmp=$(mktemp)
  if [[ -n "$data" ]]; then
    status=$(curl -sS -o "$tmp" -w "%{http_code}" -X "$method" -H 'Content-Type: application/json' -d "$data" "$BASE_URL$path")
  else
    status=$(curl -sS -o "$tmp" -w "%{http_code}" -X "$method" "$BASE_URL$path")
  fi
  {
    echo "${method} ${path} -> ${status}"
    cat "$tmp"
    echo
  } >&2
  rm -f "$tmp"
  printf '%s' "$status"
}

status=$(run_curl GET /health)
if [[ "$status" != "200" ]]; then
  echo "GET /health failed" >&2
  exit 1
fi

status=$(run_curl GET /scores)
if [[ "$status" != "200" ]]; then
  echo "GET /scores failed" >&2
  exit 1
fi

status=$(run_curl POST /scores '{"name":"CLI Tester","score":42}')
if [[ "$status" != "200" && "$status" != "201" ]]; then
  echo "POST /scores failed" >&2
  exit 1
fi
