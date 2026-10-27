// Link-preview images (Open Graph, 1200×630), drawn at build time: one for the home page and
// one per case study. satori lays out the text with the site's own font; sharp makes the PNG.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { profile } from '../../data/profile';

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children, ...extra },
});

const C = { bg: '#0d0d14', surface: '#161622', border: '#2e2e48', text: '#ededf5', muted: '#b3b3c7', accent: '#b4a9ff' };

const hexagon = (size: number) => ({
  type: 'svg',
  props: {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: C.accent,
    strokeWidth: 2,
    children: { type: 'path', props: { d: 'M12 2l8.66 5v10L12 22l-8.66-5V7z' } },
  },
});

const brand = h('div', { alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700, color: C.text }, [
  hexagon(40),
  profile.name,
]);

const footer = h('div', { justifyContent: 'space-between', fontSize: 24, color: C.muted }, [
  'kingslee1604.github.io',
  h('div', { color: C.accent }, 'Senior Engineer · AI Platforms · Backend'),
]);

const frame = (children: Node[]) =>
  h(
    'div',
    {
      width: 1200,
      height: 630,
      boxSizing: 'border-box',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '56px 64px',
      background: C.bg,
      fontFamily: 'Space Grotesk',
      borderTop: `8px solid #5b5bf0`,
    },
    children,
  );

async function homeCard(): Promise<Node> {
  const photo = await readFile('src/assets/kingslee.jpg');
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`;
  return frame([
    brand,
    h('div', { alignItems: 'center', gap: 56 }, [
      h('div', { flexDirection: 'column', gap: 24, width: 740 }, [
        h('div', { fontSize: 54, fontWeight: 700, lineHeight: 1.12, color: C.text, textWrap: 'balance' }, profile.headline),
        h('div', { fontSize: 26, color: C.muted, lineHeight: 1.4 }, '15+ years in healthcare IT · creator of AgentForge'),
      ]),
      h('img', { width: 260, height: 260, borderRadius: 28, border: `4px solid ${C.border}` }, undefined, {
        src,
        width: 260,
        height: 260,
      }),
    ]),
    footer,
  ]);
}

function caseStudyCard(project: CollectionEntry<'projects'>): Node {
  const { title, summary, metrics } = project.data;
  return frame([
    brand,
    h('div', { flexDirection: 'column', gap: 14 }, [
      h('div', { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.accent }, 'CASE STUDY'),
      h('div', { fontSize: 64, fontWeight: 700, color: C.text }, title),
      h('div', { fontSize: 26, color: C.muted, lineHeight: 1.4, maxWidth: 1040, textWrap: 'balance' }, summary),
      h(
        'div',
        { gap: 16, marginTop: 8 },
        metrics.slice(0, 3).map((m) =>
          h(
            'div',
            { flexDirection: 'column', padding: '14px 22px', background: C.surface, border: `2px solid ${C.border}`, borderRadius: 14 },
            [h('div', { fontSize: 34, fontWeight: 700, color: C.text }, m.value), // The font's Latin subset has no arrow glyph.
              h('div', { fontSize: 20, color: C.muted }, m.label.replace('→', 'to'))],
          ),
        ),
      ),
    ]),
    footer,
  ]);
}

export const getStaticPaths = (async () => {
  const studies = await getCollection('projects', (p) => p.data.caseStudy);
  return [{ params: { slug: 'home' }, props: { project: undefined } }, ...studies.map((project) => ({ params: { slug: project.id }, props: { project } }))];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const project = props.project as CollectionEntry<'projects'> | undefined;
  const fontFile = (weight: number) => readFile(`node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-${weight}-normal.woff`);
  const svg = await satori((project ? caseStudyCard(project) : await homeCard()) as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Space Grotesk', data: await fontFile(500), weight: 500, style: 'normal' },
      { name: 'Space Grotesk', data: await fontFile(700), weight: 700, style: 'normal' },
    ],
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
