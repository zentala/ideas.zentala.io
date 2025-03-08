import fs from 'fs/promises';
import path from 'path';
import { generateMetadataFromPost } from '../src/utils.js';

// Paths
const sourceDir = path.join(process.cwd(), 'posts');
const targetDir = path.join(process.cwd(), 'src/content/posts');

async function main() {
  try {
    // Ensure target directory exists
    try {
      await fs.mkdir(targetDir, { recursive: true });
      console.log(`Created target directory: ${targetDir}`);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
    
    // Get all markdown files
    const files = await fs.readdir(sourceDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`Found ${mdFiles.length} markdown files to convert`);
    
    // Process each file
    for (const file of mdFiles) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Read the content
      const content = await fs.readFile(sourcePath, 'utf-8');
      
      // Generate metadata
      const metadata = generateMetadataFromPost(content, file);
      
      // Escape special characters in title and description
      const escapeYaml = (str) => str.replace(/"/g, '\\"');
      
      // Create frontmatter
      const frontmatter = `---
title: "${escapeYaml(metadata.title)}"
description: "${escapeYaml(metadata.description)}"
${metadata.image ? `image: "${escapeYaml(metadata.image)}"` : ''}
pubDate: "${metadata.pubDate}"
tags: [${metadata.tags.map(tag => `"${escapeYaml(tag)}"`).join(', ')}]
---

`;
      
      // Write to target directory
      await fs.writeFile(targetPath, frontmatter + content);
      console.log(`Converted: ${file}`);
    }
    
    console.log('Conversion complete!');
  } catch (error) {
    console.error('Error converting posts:', error);
  }
}

main();