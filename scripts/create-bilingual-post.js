import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/content/posts');

/**
 * Generate a bilingual post using AI
 */
async function generateBilingualPost(topic, language = 'en') {
  try {
    console.log(`Generating post about "${topic}" in ${language === 'en' ? 'English' : 'Polish'}...`);
    
    // Generate the post content
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert content creator specializing in innovation and technology ideas.
            Create a well-structured markdown post about the given topic in ${language === 'en' ? 'English' : 'Polish'}.
            The post should include:
            1. A clear title (h1)
            2. An introduction explaining the concept
            3. Several sections with details, benefits, challenges
            4. A conclusion or future outlook
            
            Return a JSON object with:
            - title: A concise title for the post
            - description: A brief description for SEO (max 160 chars)
            - content: The full markdown content
            - suggestedTags: An array of 3-7 relevant tags as single words or hyphenated phrases
            
            Make the content informative, engaging, and well-structured with proper markdown formatting.`
        },
        {
          role: "user",
          content: `Create a post about: ${topic}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Prepare frontmatter
    const today = new Date().toISOString().split('T')[0];
    const frontmatter = `---
title: "${result.title.replace(/"/g, '\\"')}"
description: "${result.description.replace(/"/g, '\\"')}"
pubDate: "${today}"
language: "${language}"
tags: [${result.suggestedTags.map(tag => `"${tag}"`).join(', ')}]
---

`;
    
    return {
      frontmatter,
      content: result.content,
      filename: topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };
  } catch (error) {
    console.error("Error generating post:", error);
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
    
    // Get topic from user
    const topic = await askQuestion("What would you like to create a post about? ");
    if (!topic) {
      console.error("Topic cannot be empty");
      process.exit(1);
    }
    
    // Generate English post
    const englishPost = await generateBilingualPost(topic, 'en');
    
    // Generate Polish post
    const polishPost = await generateBilingualPost(topic, 'pl');
    
    // Create filenames
    const baseFilename = englishPost.filename;
    const englishFilename = `${baseFilename}-en.md`;
    const polishFilename = `${baseFilename}-pl.md`;
    
    // Create the posts directory if it doesn't exist
    await fs.mkdir(postsDir, { recursive: true });
    
    // Write the posts
    await fs.writeFile(
      path.join(postsDir, englishFilename),
      englishPost.frontmatter + englishPost.content
    );
    
    await fs.writeFile(
      path.join(postsDir, polishFilename),
      polishPost.frontmatter + polishPost.content
    );
    
    console.log(`✅ Generated bilingual posts:`);
    console.log(`  - English: ${path.join(postsDir, englishFilename)}`);
    console.log(`  - Polish: ${path.join(postsDir, polishFilename)}`);
    console.log(`\nRun 'npm run generate-taxonomy' to update the taxonomy with these new posts.`);
    
    rl.close();
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
}

main();