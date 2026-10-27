#!/usr/bin/env bash
# Lighthouse CI on the built site (mobile, 3 runs per page), using Playwright's Chromium.
# Fails if Performance, Accessibility, Best Practices or SEO scores below 95.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME_PATH="$(node -e "console.log(require('@playwright/test').chromium.executablePath())")"
export CHROME_PATH
node_modules/.bin/lhci autorun
