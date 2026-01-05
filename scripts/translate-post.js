import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/content/posts');

/**
 * Detect language of post content
 */
function detectLanguage(content) {
  // Polish common words and characters
  const polishMarkers = ['jest', 'są', 'będzie', 'może', 'nie', 'tak', 'dla', 'jako', 'to', 'się', 'na', 'ą', 'ę', 'ó', 'ś', 'ć', 'ż', 'ź', 'ł'];
  
  // Count occurrences of Polish markers
  const polishCount = polishMarkers.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'gi');
    const matches = content.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  // If we have more than 5 Polish markers, assume it's Polish
  return polishCount > 5 ? 'pl' : 'en';
}

/**
 * Translate post content to the target language
 */
async function translatePost(content, sourceLanguage, targetLanguage) {
  try {
    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}...`);
    
    // Extract frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      throw new Error('Could not find frontmatter in post');
    }
    
    const frontmatter = frontmatterMatch[1];
    const markdownContent = content.slice(frontmatterMatch[0].length);
    
    // Parse frontmatter to extract fields
    const titleMatch = frontmatter.match(/title: "(.+?)"/);
    const descMatch = frontmatter.match(/description: "(.+?)"/);
    const title = titleMatch ? titleMatch[1] : '';
    const description = descMatch ? descMatch[1] : '';
    
    // Translate using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in technical and innovation content.
            You need to translate content from ${sourceLanguage === 'en' ? 'English to Polish' : 'Polish to English'}.
            Maintain the original Markdown formatting, headings, links, and structure.
            Return a JSON object with "title", "description", and "content" fields.`
        },
        {
          role: "user",
          content: `Please translate the following content from ${sourceLanguage === 'en' ? 'English to Polish' : 'Polish to English'}.
            
            Title: ${title}
            Description: ${description}
            
            Content:
            ${markdownContent}
            
            Return a JSON object with "title", "description", and "content" fields containing the translated versions.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Create new frontmatter with translated content
    // Escape quotes in title and description
    const escapeYaml = (str) => str.replace(/"/g, '\\"');
    
    // Get existing frontmatter fields
    const tagsMatch = frontmatter.match(/tags: \[(.*?)\]/);
    const tags = tagsMatch ? tagsMatch[1] : '"idea"';
    
    const imageMatch = frontmatter.match(/image: "(.+?)"/);
    const imageField = imageMatch ? `image: "${imageMatch[1]}"` : '';
    
    const pubDateMatch = frontmatter.match(/pubDate: "(.+?)"/);
    const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString().split('T')[0];
    
    // Create translated frontmatter
    const translatedFrontmatter = `---
title: "${escapeYaml(result.title)}"
description: "${escapeYaml(result.description)}"
${imageField}
pubDate: "${pubDate}"
language: "${targetLanguage}"
tags: [${tags}]
---

`;

    // Return the translated post
    return {
      frontmatter: translatedFrontmatter,
      content: result.content
    };
  } catch (error) {
    console.error("Error translating post:", error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Check for OPENAI_API_KEY
    if (!process.env.OPENAI_API_KEY) {
      console.error("Error: OPENAI_API_KEY is not set in your environment or .env file");
      console.log("Please create a .env file with your OpenAI API key, for example:");
      console.log("OPENAI_API_KEY=your-api-key-here");
      process.exit(1);
    }
    
    // Get source file path from command line argument
    const sourceFilePath = process.argv[2];
    if (!sourceFilePath) {
      console.error("Please provide a source file path as an argument");
      console.log("Usage: node translate-post.js path/to/your/post.md");
      process.exit(1);
    }
    
    // Read the source file
    const sourcePath = path.isAbsolute(sourceFilePath) 
      ? sourceFilePath 
      : path.join(process.cwd(), sourceFilePath);
    
    const content = await fs.readFile(sourcePath, 'utf-8');
    
    // Detect source language
    const sourceLanguage = detectLanguage(content);
    const targetLanguage = sourceLanguage === 'en' ? 'pl' : 'en';
    
    console.log(`Detected source language: ${sourceLanguage}`);
    console.log(`Target language: ${targetLanguage}`);
    
    // Translate the post
    const translated = await translatePost(content, sourceLanguage, targetLanguage);
    
    // Create a new filename for the translated version
    const sourceFileName = path.basename(sourcePath);
    const targetFileName = `${path.basename(sourceFileName, '.md')}-${targetLanguage}.md`;
    const targetFilePath = path.join(path.dirname(sourcePath), targetFileName);
    
    // Write the translated post
    await fs.writeFile(targetFilePath, translated.frontmatter + translated.content, 'utf-8');
    
    console.log(`✅ Translation complete: ${targetFilePath}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();