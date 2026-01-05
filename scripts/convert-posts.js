import fs from 'fs/promises';
import path from 'path';
import { generateMetadataFromPost } from '../src/utils.js';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Check if OpenAI is available
let openaiAvailable = false;
try {
  execSync('npm list openai');
  openaiAvailable = true;
  console.log('OpenAI module found, will use it to enhance descriptions and formatting.');
} catch (error) {
  console.log('OpenAI module not found, will use basic metadata extraction.');
}

// Conditionally import OpenAI if available
let OpenAI, openai;
if (openaiAvailable) {
  try {
    // Dynamic import of OpenAI
    const openaiModule = await import('openai');
    OpenAI = openaiModule.default;
    
    try {
      // Try to load environment variables from .env
      await import('dotenv').then(module => module.default.config());
    } catch (err) {
      console.log('Could not load dotenv, will try to use OPENAI_API_KEY from environment.');
    }
    
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('OpenAI client initialized successfully.');
    } else {
      console.log('OPENAI_API_KEY not found in environment, will use basic processing.');
      openaiAvailable = false;
    }
  } catch (error) {
    console.log('Error initializing OpenAI:', error.message);
    openaiAvailable = false;
  }
}

// Paths
const sourceDir = path.join(process.cwd(), 'posts');
const targetDir = path.join(process.cwd(), 'src/content/posts');

/**
 * Enhance post content using AI
 * @param {string} content - Original post content
 * @param {string} title - Post title
 * @returns {Promise<Object>} Enhanced content and metadata
 */
async function enhanceContentWithAI(content, title) {
  if (!openaiAvailable || !openai) {
    return { enhancedContent: content, description: '', tags: [] };
  }
  
  try {
    console.log(`Enhancing content for: ${title}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: 
            "You are an expert editor specialized in improving Markdown content. " +
            "Your task is to analyze the given content and:\n" +
            "1. Fix Markdown formatting (proper headings, lists, code blocks)\n" +
            "2. Correct grammatical errors and typos\n" +
            "3. Create a concise, compelling description (max 150 chars)\n" +
            "4. Generate 3-7 relevant tags as single lowercase words or hyphenated phrases\n\n" +
            "Output format should be JSON with three properties: 'enhancedContent', 'description', and 'tags' (array)."
        },
        {
          role: "user",
          content: `# ${title}\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error enhancing content:", error.message);
    return { enhancedContent: content, description: '', tags: [] };
  }
}

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
      let content = await fs.readFile(sourcePath, 'utf-8');
      
      // Generate basic metadata
      let metadata = generateMetadataFromPost(content, file);
      
      // Use AI to improve content if available
      if (openaiAvailable) {
        try {
          const enhanced = await enhanceContentWithAI(content, metadata.title);
          
          if (enhanced.enhancedContent) {
            content = enhanced.enhancedContent;
          }
          
          if (enhanced.description && enhanced.description.length > 0) {
            metadata.description = enhanced.description;
          }
          
          if (enhanced.tags && enhanced.tags.length > 0) {
            metadata.tags = enhanced.tags;
          }
          
          console.log(`Enhanced content for ${file} successfully`);
        } catch (error) {
          console.log(`Error enhancing content for ${file}:`, error.message);
        }
      }
      
      // Escape special characters in title and description
      const escapeYaml = (str) => str ? str.replace(/"/g, '\\"') : '';
      
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