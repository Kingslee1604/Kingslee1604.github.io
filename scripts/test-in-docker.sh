#!/usr/bin/env bash
# Runs the browser tests and Lighthouse locally inside Microsoft's Playwright image, so this
# machine needs no browsers or system packages. Run `pnpm build` first.
set -euo pipefail
cd "$(dirname "$0")/.."
version="$(node -p "require('./node_modules/@playwright/test/package.json').version")"
docker run --rm --init --ipc=host --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "${PWD}:/work" -w /work "mcr.microsoft.com/playwright:v${version}-noble" \
  bash -c 'node_modules/.bin/playwright test && bash scripts/lighthouse.sh'
