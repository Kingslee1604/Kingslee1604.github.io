# kingslee1604.github.io

Source for **[kingslee1604.github.io](https://kingslee1604.github.io)**, the portfolio of
Kingslee Velu: senior engineer building reliable AI platforms and backend systems.

[![CI](https://github.com/Kingslee1604/Kingslee1604.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/Kingslee1604/Kingslee1604.github.io/actions/workflows/ci.yml)

## How it is built

- **[Astro](https://astro.build)**, static output: plain HTML and CSS, with JavaScript only
  for the theme toggle.
- **Content as files.** Each project is one Markdown file in `src/content/projects/`; profile
  data is in `src/data/profile.ts`. Adding a project means adding a file.
- **Link-preview images** are drawn at build time (`src/pages/og/[slug].png.ts`).
- **Every number links to its source** in the project's repository.

## Quality gates (CI, on every change)

| Gate | Tool |
|---|---|
| Lighthouse 95+ on mobile (Performance, Accessibility, Best Practices, SEO) | Lighthouse CI |
| 0 accessibility violations, dark and light themes | Playwright + axe-core |
| No sideways scrolling at 360 px, keyboard skip link, theme toggle, reduced motion | Playwright |
| Every link and anchor resolves | `scripts/check-links.mjs` |
| No secrets; no known-vulnerable dependencies | gitleaks, OSV-Scanner |
| Types | `astro check` |

Main deploys to GitHub Pages only after every gate passes. Actions are pinned to commit SHAs,
tools are checksum-verified, and dependencies must be at least 14 days old
(`pnpm-workspace.yaml`), with dated exceptions for security fixes.

## Run it locally

```bash
./scripts/install-tools.sh   # Node, pnpm, gitleaks, OSV-Scanner into ~/.local (checksum-verified)
pnpm install
pnpm dev                     # http://localhost:4321
pnpm build && pnpm links     # build, then check every link
pnpm test:docker             # browser tests + Lighthouse in the Playwright Docker image
pnpm scan                    # secrets and dependency scan
```
