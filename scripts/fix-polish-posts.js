#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');

// Translation mapping for Polish to English tags
const plToEnMapping = {
  "platforma samochodowa": "car platform",
  "części samochodowe": "car parts", 
  "subskrypcja": "subscription",
  "geolokalizacja": "geolocation",
  "zdjęcia aut": "car photos",
  "ogłoszenia": "listings",
  "pomysły": "ideas",
  "innowacje": "innovations",
  "aplikacja mobilna": "mobile app",
  "wymiana wizytówek": "business cards",
  "innowacje technologiczne": "technological innovation", 
  "kontakty biznesowe": "business contacts",
  "produkty": "products",
  "usługi": "services",
  "startup": "startup",
  "aplikacja": "application",
  "technologia": "technology",
  "motoryzacja": "automotive",
  "internet rzeczy": "IoT",
  "uczenie maszynowe": "machine learning",
  "biznes": "business",
  "przedsiębiorczość": "entrepreneurship",
  "prototyp": "prototype",
  "inwestycje": "investments",
  "edukacja": "education",
  "rozrywka": "entertainment",
  "społeczność": "community",
  "media społecznościowe": "social media",
  "platforma internetowa": "web platform",
  "usługi samochodowe": "car services"
};

// Check if a file exists
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Get original content from git history if available
function getOriginalContentFromGit(filePath) {
  try {
    // Get the file's first commit hash
    const firstCommitHash = execSync(`git log --format="%H" --reverse "${filePath}" | head -1`).toString().trim();
    
    if (firstCommitHash) {
      // Get the content from the first commit
      const originalContent = execSync(`git show ${firstCommitHash}:"${path.relative(process.cwd(), filePath)}"`).toString();
      return originalContent;
    }
  } catch (error) {
    console.error(`Error retrieving git history for ${filePath}:`, error.message);
  }
  
  return null;
}

// Process a single markdown file
function processMarkdownFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if content contains [object Object]
  if (content.includes('[object Object]')) {
    console.log(`  Found [object Object] in ${filePath}`);
    
    // Try to restore content from git history
    const originalContent = getOriginalContentFromGit(filePath);
    
    if (originalContent && !originalContent.includes('[object Object]')) {
      content = originalContent;
      console.log(`  Restored content from git history`);
      modified = true;
    } else {
      console.log(`  Could not restore content from git`);
    }
  }
  
  // Check if it's a Polish post - check different language formats
  if (content.includes('language: "pl"') || content.includes("language: 'pl'") || content.includes('language: pl')) {
    console.log(`  Found Polish post`);
    
    // Change language to English - handle different quote formats
    content = content.replace(/language:\s*["']?pl["']?/g, 'language: "en"');
    
    // Find tags section in the frontmatter
    const tagsMatch = content.match(/tags:\s*\[(.*?)\]/s);
    
    if (tagsMatch && tagsMatch[1]) {
      const originalTags = tagsMatch[1];
      let translatedTags = originalTags;
      
      // Translate each Polish tag to English if found in the mapping
      Object.entries(plToEnMapping).forEach(([plTag, enTag]) => {
        const tagRegex = new RegExp(`"${plTag}"`, 'g');
        translatedTags = translatedTags.replace(tagRegex, `"${enTag}"`);
      });
      
      // Replace the tags section with translated tags
      content = content.replace(/tags:\s*\[(.*?)\]/s, `tags: [${translatedTags}]`);
    }
    
    modified = true;
  }
  
  // Save changes if the file was modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  File updated: ${filePath}`);
  } else {
    console.log(`  No changes needed for: ${filePath}`);
  }
}

// Main function to process all markdown files
function main() {
  console.log(`Looking for Markdown files in: ${postsDir}`);
  
  if (!fileExists(postsDir)) {
    console.error(`Posts directory not found: ${postsDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(postsDir);
  
  // Filter for markdown files
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  console.log(`Found ${markdownFiles.length} Markdown files`);
  
  // Process each markdown file
  markdownFiles.forEach(file => {
    const filePath = path.join(postsDir, file);
    processMarkdownFile(filePath);
  });
  
  console.log('All files processed');
}

// Execute the main function
main();