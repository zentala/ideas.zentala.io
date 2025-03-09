#!/usr/bin/env node

/**
 * This script copies the sitemap files from the dist directory to the public directory
 * during the build process to ensure they're available both during development
 * and in the production build.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Define directories
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy and potentially modify sitemap files
try {
  const sitemapFiles = [
    'sitemap-index.xml',
    'sitemap-0.xml'
  ];
  
  let copiedFiles = 0;
  for (const file of sitemapFiles) {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(publicDir, file);
    
    if (fs.existsSync(srcPath)) {
      // Read the file content
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // We'll keep the original URLs in the XML files
      // This is intentional, as the production URLs are often better for search engines
      
      // Write the file to the public directory
      fs.writeFileSync(destPath, content);
      console.log(`Copied ${file} to public directory`);
      copiedFiles++;
    } else {
      console.warn(`Warning: ${file} not found in dist directory`);
    }
  }
  
  // Create a development-specific version that uses local URLs
  if (fs.existsSync(path.join(distDir, 'sitemap-0.xml'))) {
    const content = fs.readFileSync(path.join(distDir, 'sitemap-0.xml'), 'utf8');
    const devContent = content.replace(/https:\/\/ideas\.zentala\.io\//g, '/');
    fs.writeFileSync(path.join(publicDir, 'dev-sitemap-0.xml'), devContent);
    console.log('Created development-specific sitemap at /dev-sitemap-0.xml');
  }
  
  if (copiedFiles > 0) {
    console.log(`Successfully copied ${copiedFiles} sitemap file(s) to public directory`);
  } else {
    console.error('Error: No sitemap files found to copy');
  }
} catch (error) {
  console.error('Error copying sitemap files:', error);
  process.exit(1);
}