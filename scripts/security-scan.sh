#!/usr/bin/env bash
# Secret scan (every commit, plus files not yet committed) and known-vulnerability scan of
# the locked dependencies. CI runs this on every change.
set -euo pipefail
cd "$(dirname "$0")/.."

if git rev-parse --verify --quiet HEAD >/dev/null; then
  gitleaks git --redact --no-banner .
fi
gitleaks dir --redact --no-banner .
osv-scanner scan source --lockfile pnpm-lock.yaml
