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
 * Generate tags for a given markdown content using OpenAI
 */
async function generateTagsWithAI(title, content) {
  console.log(`Generating tags for: ${title}`);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates appropriate tags for blog posts about innovation and ideas. Respond with 3-7 relevant tags that categorize this content, separated by commas. Tags should be single words or short phrases in lowercase, with no spaces (use dashes if needed)."
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content.substring(0, 3000)}` // Limit content length
        }
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const tagsString = response.choices[0].message.content.trim();
    // Split by commas and clean up each tag
    const tags = tagsString.split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
    
    return tags;
  } catch (error) {
    console.error("Error generating tags:", error);
    return ["idea"]; // Fallback tag
  }
}

/**
 * Updates the frontmatter of a markdown file with AI-generated tags
 */
async function updatePostWithAITags(filePath) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      console.warn(`No frontmatter found in ${filePath}`);
      return;
    }
    
    const frontmatter = frontmatterMatch[1];
    const restOfContent = content.slice(frontmatterMatch[0].length);
    
    // Extract title
    const titleMatch = frontmatter.match(/title: "(.+?)"/);
    if (!titleMatch) {
      console.warn(`No title found in ${filePath}`);
      return;
    }
    
    const title = titleMatch[1];
    
    // Generate tags using AI
    const aiTags = await generateTagsWithAI(title, restOfContent);
    
    // Replace or add tags in frontmatter
    const updatedFrontmatter = frontmatter.includes('tags:') 
      ? frontmatter.replace(/tags: \[.*?\]/, `tags: [${aiTags.map(tag => `"${tag}"`).join(', ')}]`)
      : `${frontmatter}\ntags: [${aiTags.map(tag => `"${tag}"`).join(', ')}]`;
    
    // Write updated content
    const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    console.log(`Updated tags for ${path.basename(filePath)}: ${aiTags.join(', ')}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

/**
 * Process a specific file or all files in the posts directory
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

    const targetPath = process.argv[2];
    
    if (targetPath) {
      // Process a specific file
      const fullPath = path.isAbsolute(targetPath) 
        ? targetPath 
        : path.join(process.cwd(), targetPath);
      
      if (!fullPath.endsWith('.md')) {
        console.error("Error: Target file must be a markdown (.md) file");
        process.exit(1);
      }
      
      console.log(`Processing file: ${fullPath}`);
      await updatePostWithAITags(fullPath);
    } else {
      // Process all files in the posts directory
      console.log(`Processing all files in ${postsDir}`);
      const files = await fs.readdir(postsDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      console.log(`Found ${mdFiles.length} markdown files`);
      
      for (const file of mdFiles) {
        await updatePostWithAITags(path.join(postsDir, file));
      }
      
      console.log("All posts have been processed!");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();