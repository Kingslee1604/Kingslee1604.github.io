#!/usr/bin/env bash
# Installs the site's tools into ~/.local (no sudo): Node.js, pnpm, gitleaks, OSV-Scanner.
# Every download is verified against the publisher's SHA-256 checksum. Versions are pinned
# here (the same as AgentForge's); bump them deliberately.
set -euo pipefail

NODE_VERSION="24.21.0"
PNPM_VERSION="12.7.0"
GITLEAKS_VERSION="8.30.1"
OSV_SCANNER_VERSION="2.6.0"

PREFIX="${HOME}/.local"
BIN="${PREFIX}/bin"
OPT="${PREFIX}/opt"
mkdir -p "${BIN}" "${OPT}"

if [[ "$(uname -s)-$(uname -m)" != "Linux-x86_64" ]]; then
  echo "This script supports Linux x86_64 (WSL2 Ubuntu, GitHub runners) only." >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT

verify() { echo "$2  $1" | sha256sum --check --status || { echo "Checksum mismatch for $1" >&2; exit 1; }; }
sum_from() { curl -fsSL "$1" | awk -v a="$2" '$2 == a || $2 == "*"a {print $1}'; }

# --- Node.js ------------------------------------------------------------------
node_dir="${OPT}/node-v${NODE_VERSION}-linux-x64"
if [[ ! -x "${node_dir}/bin/node" ]]; then
  base="https://nodejs.org/dist/v${NODE_VERSION}"
  asset="node-v${NODE_VERSION}-linux-x64.tar.xz"
  curl -fsSL -o "${tmp}/${asset}" "${base}/${asset}"
  verify "${tmp}/${asset}" "$(sum_from "${base}/SHASUMS256.txt" "${asset}")"
  tar -xJf "${tmp}/${asset}" -C "${OPT}"
fi
for tool in node npm npx corepack; do
  ln -sf "${node_dir}/bin/${tool}" "${BIN}/${tool}"
done

# --- pnpm (via corepack, pinned) ------------------------------------------------
export PATH="${BIN}:${PATH}"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack enable --install-directory "${BIN}" pnpm
corepack prepare "pnpm@${PNPM_VERSION}" --activate >/dev/null

# --- gitleaks -------------------------------------------------------------------
if ! "${BIN}/gitleaks" version 2>/dev/null | grep -q "${GITLEAKS_VERSION}"; then
  base="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}"
  asset="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
  curl -fsSL -o "${tmp}/${asset}" "${base}/${asset}"
  verify "${tmp}/${asset}" "$(sum_from "${base}/gitleaks_${GITLEAKS_VERSION}_checksums.txt" "${asset}")"
  tar -xzf "${tmp}/${asset}" -C "${tmp}" gitleaks
  install -m 0755 "${tmp}/gitleaks" "${BIN}/gitleaks"
fi

# --- OSV-Scanner ----------------------------------------------------------------
if ! "${BIN}/osv-scanner" --version 2>/dev/null | grep -q "${OSV_SCANNER_VERSION}"; then
  base="https://github.com/google/osv-scanner/releases/download/v${OSV_SCANNER_VERSION}"
  asset="osv-scanner_linux_amd64"
  curl -fsSL -o "${tmp}/${asset}" "${base}/${asset}"
  verify "${tmp}/${asset}" "$(sum_from "${base}/osv-scanner_SHA256SUMS" "${asset}")"
  install -m 0755 "${tmp}/${asset}" "${BIN}/osv-scanner"
fi

echo "node $(node --version), pnpm $(pnpm --version), gitleaks $("${BIN}/gitleaks" version), osv-scanner ${OSV_SCANNER_VERSION}"
