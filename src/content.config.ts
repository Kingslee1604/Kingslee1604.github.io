import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project. Adding a project means adding a file, not editing code.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      order: z.number(),
      featured: z.boolean().default(false),
      tags: z.array(z.string()),
      repo: z.string(),
      release: z.object({ label: z.string(), url: z.string() }).optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // An animated demo, shown on the case study; the cover replaces it for reduced motion.
      demo: z.object({ src: z.string(), width: z.number(), height: z.number(), alt: z.string() }).optional(),
      caseStudy: z.boolean().default(false),
      // Highlights for the project card. Every value needs a source link.
      metrics: z.array(z.object({ value: z.string(), label: z.string(), source: z.string() })).default([]),
    }),
});

export const collections = { projects };
