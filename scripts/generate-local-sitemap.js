#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Tworzymy lokalny sitemap
const localSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>http://localhost:4321/dev-sitemap-0.xml</loc>
  </sitemap>
</sitemapindex>`;

// Zapisujemy w katalogu public
fs.writeFileSync(path.join(rootDir, 'public', 'local-sitemap-index.xml'), localSitemap);
console.log('Generated local sitemap at public/local-sitemap-index.xml');

// Tworzymy redirect z sitemap-index.xml do local-sitemap-index.xml
const redirectFile = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=/local-sitemap-index.xml">
</head>
<body>
  <p>Redirecting to <a href="/local-sitemap-index.xml">local sitemap</a>...</p>
</body>
</html>`;

fs.writeFileSync(path.join(rootDir, 'public', 'sitemap-index.html'), redirectFile);
console.log('Generated redirect from sitemap-index.html to local-sitemap-index.xml');