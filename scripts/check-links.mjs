// Checks every link and image in the built site (run after `pnpm build`):
// - internal links must point to a built file, and #anchors to an id on that page;
// - links to other sites must answer without an error.
// Usage: node scripts/check-links.mjs [--offline]
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';
const SITE = 'https://kingslee1604.github.io';
const offline = process.argv.includes('--offline');
// Sites that refuse automated requests; a link to them is reported, not failed.
const BLOCKS_BOTS = new Set(['www.linkedin.com']);

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function resolveInternal(pathname) {
  const base = path.join(DIST, decodeURIComponent(pathname));
  for (const candidate of [base, path.join(base, 'index.html'), `${base}.html`]) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

const failures = [];
const external = new Map(); // url -> pages using it
const pages = await htmlFiles(DIST);

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const page = '/' + path.relative(DIST, file).replaceAll(path.sep, '/');
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
  for (const ref of refs) {
    if (/^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    const url = new URL(ref, SITE + page);
    if (url.origin !== SITE) {
      if (!external.has(url.href)) external.set(url.href, new Set());
      external.get(url.href).add(page);
      continue;
    }
    const target = await resolveInternal(url.pathname);
    if (!target) {
      failures.push(`${page}: broken link ${ref}`);
      continue;
    }
    if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      const targetHtml = await readFile(target, 'utf8');
      if (!targetHtml.includes(`id="${id}"`)) failures.push(`${page}: missing anchor ${ref}`);
    }
  }
}

async function check(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
        headers: { 'User-Agent': 'Mozilla/5.0 (link check for kingslee1604.github.io)' },
      });
      if (res.status === 429 && attempt < 3) {
        await new Promise((r) => setTimeout(r, 3000 * attempt));
        continue;
      }
      return res.status;
    } catch (err) {
      if (attempt === 3) return `error: ${err.cause?.code ?? err.message}`;
    }
  }
}

const skipped = [];
if (!offline) {
  for (const [url, usedOn] of external) {
    const host = new URL(url).hostname;
    if (BLOCKS_BOTS.has(host)) {
      skipped.push(url);
      continue;
    }
    const status = await check(url);
    if (typeof status !== 'number' || status >= 400) {
      failures.push(`${[...usedOn].join(', ')}: ${url} -> ${status}`);
    }
  }
}

console.log(`${pages.length} pages, ${external.size} outside links${offline ? ' (not checked: --offline)' : ''}`);
for (const url of skipped) console.log(`not checked (site blocks automated requests): ${url}`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('All links OK.');
