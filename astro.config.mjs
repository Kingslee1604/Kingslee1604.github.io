import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

// Markdown links to other sites open in a new tab, with hidden text saying so for screen readers.
function externalLinks() {
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && /^https?:\/\//.test(String(node.properties?.href ?? ''))) {
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
      node.children.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['visually-hidden'] },
        children: [{ type: 'text', value: ' (opens in a new tab)' }],
      });
      return;
    }
    node.children?.forEach(visit);
  };
  return (tree) => visit(tree);
}

export default defineConfig({
  site: 'https://kingslee1604.github.io',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ rehypePlugins: [externalLinks] }),
  },
  build: {
    // The CSS is small; inlining it saves a render-blocking request on every page.
    inlineStylesheets: 'always',
  },
});
