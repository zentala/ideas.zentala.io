import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://ideas.zentala.io',
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    react(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  vite: {
    ssr: {
      noExternal: ['tailwindcss'],
    },
  },
});