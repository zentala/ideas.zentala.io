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
const taxonomyPath = path.join(__dirname, '../src/data/taxonomy.json');

/**
 * Extract titles and short summaries of all posts
 */
async function extractPostSummaries() {
  try {
    const files = await fs.readdir(postsDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    const postSummaries = [];
    
    for (const file of mdFiles) {
      const filePath = path.join(postsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;
      
      const frontmatter = frontmatterMatch[1];
      
      // Extract title
      const titleMatch = frontmatter.match(/title: "(.+?)"/);
      if (!titleMatch) continue;
      
      const title = titleMatch[1];
      
      // Extract description
      const descMatch = frontmatter.match(/description: "(.+?)"/);
      const description = descMatch ? descMatch[1] : '';
      
      // Extract existing tags if any
      const tagsMatch = frontmatter.match(/tags: \[(.*?)\]/);
      const existingTags = tagsMatch 
        ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, ''))
        : [];
      
      // Get a snippet of the content
      const contentSnippet = content
        .slice(frontmatterMatch[0].length)
        .trim()
        .substring(0, 300)
        .replace(/\n/g, ' ');
      
      postSummaries.push({
        file,
        title,
        description,
        contentSnippet,
        existingTags
      });
    }
    
    return postSummaries;
  } catch (error) {
    console.error('Error extracting post summaries:', error);
    return [];
  }
}

/**
 * Generate a taxonomy for all posts
 */
async function generateTaxonomy(postSummaries) {
  try {
    console.log('Analyzing all posts to generate a consistent taxonomy...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an English taxonomy and classification expert. Your task is to:

1. Analyze the collection of blog posts to understand their themes and topics
2. Create a consistent taxonomy for categorizing the posts in English only
3. Apply this taxonomy to generate appropriate tags for each post

Guidelines for the taxonomy:
- Use a maximum of 20-30 primary categories/tags
- All tags should be in English only
- Tags should be general enough to group related posts
- Tags should be specific enough to be meaningful
- Use lowercase, hyphenated format (e.g., "smart-home" not "Smart Home")
- Look for common themes across posts to ensure tag reuse
- Avoid creating post-specific tags that would only apply to one post

Your output will be used to tag a collection of innovation and idea posts in English only.`
        },
        {
          role: "user",
          content: `Here are summaries of all posts in the collection. I need you to:
1. Analyze them to understand all the topics covered
2. Create a consistent taxonomy with 20-30 primary tag concepts in English only
3. Apply those tags to each post, ensuring related posts share common tags

${JSON.stringify(postSummaries, null, 2)}

Respond with:
1. A list of 20-30 primary tag concepts, each with:
   - The English version of the tag
   - A short description in English
2. The tags applied to each post (3-7 tags per post), all in English regardless of the original content language

Return as a JSON object with "bilingualTags" and "postTags" properties.
The "bilingualTags" should be an object where keys are English tags and values are objects with "enDescription".`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error generating taxonomy:", error);
    return { bilingualTags: {}, postTags: {} };
  }
}

/**
 * Detect language of post content
 * Very basic detection based on common Polish words
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
 * Update post files with consistent English-only taxonomy
 */
async function updatePostsWithTaxonomy(taxonomy) {
  try {
    // Get tag assignments for each post
    const postTags = taxonomy.postTags;
    const bilingualTags = taxonomy.bilingualTags;
    
    // Create a language-neutral version of the taxonomy for all-language functionality
    const synonymMap = {};
    
    // Add English tags
    Object.keys(bilingualTags).forEach(enTag => {
      synonymMap[enTag] = enTag;
    });
    
    for (const [filename, tags] of Object.entries(postTags)) {
      const filePath = path.join(postsDir, filename);
      
      try {
        // Read the file
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Detect language of content
        const language = detectLanguage(content);
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) continue;
        
        const frontmatter = frontmatterMatch[1];
        const restOfContent = content.slice(frontmatterMatch[0].length);
        
        // Add language to frontmatter if not already there
        const langFrontmatter = frontmatter.includes('language:') 
          ? frontmatter
          : `${frontmatter}\nlanguage: "${language}"`;
        
        // Always use English tags regardless of content language
        const tagSet = new Set(tags);
        
        // Replace or add tags in frontmatter
        const updatedFrontmatter = langFrontmatter.includes('tags:') 
          ? langFrontmatter.replace(/tags: \[.*?\]/, `tags: [${Array.from(tagSet).map(tag => `"${tag}"`).join(', ')}]`)
          : `${langFrontmatter}\ntags: [${Array.from(tagSet).map(tag => `"${tag}"`).join(', ')}]`;
        
        // Write updated content
        const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        
        console.log(`Updated tags for ${filename} (${language})`);
      } catch (error) {
        console.error(`Error updating file ${filename}:`, error);
      }
    }
    
    // Ensure data directory exists
    await fs.mkdir(path.dirname(taxonomyPath), { recursive: true });
    
    // Save the taxonomy definition for future reference
    await fs.writeFile(
      taxonomyPath, 
      JSON.stringify({
        bilingualTags: taxonomy.bilingualTags,
        synonymMap
      }, null, 2), 
      'utf-8'
    );
    
    console.log(`English taxonomy definition saved to ${taxonomyPath}`);
  } catch (error) {
    console.error('Error updating posts with taxonomy:', error);
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
    
    // Extract summaries from all posts
    const postSummaries = await extractPostSummaries();
    
    if (postSummaries.length === 0) {
      console.error('No posts found to analyze.');
      process.exit(1);
    }
    
    console.log(`Extracted ${postSummaries.length} post summaries for analysis.`);
    
    // Generate taxonomy
    const taxonomy = await generateTaxonomy(postSummaries);
    
    if (!taxonomy.bilingualTags || Object.keys(taxonomy.bilingualTags).length === 0) {
      console.error('Failed to generate bilingual taxonomy.');
      process.exit(1);
    }
    
    console.log(`Generated ${Object.keys(taxonomy.bilingualTags).length} bilingual tag concepts.`);
    
    // Update posts with the new taxonomy
    await updatePostsWithTaxonomy(taxonomy);
    
    console.log('All posts have been updated with consistent English tags!');
    
    // Print primary tag categories
    console.log('\nPrimary Tag Categories:');
    Object.entries(taxonomy.bilingualTags).forEach(([enTag, data]) => {
      console.log(`- ${enTag}`);
      console.log(`  ${data.enDescription}`);
      console.log();
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();