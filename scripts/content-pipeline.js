import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/content/posts');
const taxonomyPath = path.join(__dirname, '../src/data/taxonomy.json');
const historyCache = path.join(__dirname, '../src/data/post-history.json');

/**
 * Run content pipeline for a single post
 * This function runs all enhancement scripts on a post:
 * 1. Generate post history from git
 * 2. Apply taxonomy (tags)
 * 3. Create translation if needed
 */
async function runPipeline(filePath) {
  try {
    console.log(`Running content pipeline for: ${filePath}`);
    
    // 1. Extract post history
    console.log('Extracting post history from Git...');
    await generatePostHistory(filePath);
    
    // 2. Detect language
    const content = await fs.readFile(filePath, 'utf-8');
    const language = detectLanguage(content);
    console.log(`Detected language: ${language}`);
    
    // 3. Update frontmatter with language if needed
    await updateLanguage(filePath, language);
    
    // 4. Apply taxonomy
    console.log('Applying taxonomy...');
    await applyTaxonomy(filePath);
    
    // 5. Create translation if it doesn't exist
    console.log('Checking for translations...');
    await createTranslationIfNeeded(filePath, language);
    
    console.log('Content pipeline completed successfully!');
  } catch (error) {
    console.error(`Error running pipeline:`, error);
  }
}

/**
 * Detect language of post content
 * Basic detection based on common Polish words
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
 * Update language in frontmatter
 */
async function updateLanguage(filePath, language) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return;
    
    const frontmatter = frontmatterMatch[1];
    const restOfContent = content.slice(frontmatterMatch[0].length);
    
    // Check if language is already set
    if (frontmatter.includes('language:')) {
      const langMatch = frontmatter.match(/language: "([^"]*)"/);
      if (langMatch && langMatch[1] === language) {
        console.log('Language already set correctly.');
        return;
      }
    }
    
    // Add or update language
    const updatedFrontmatter = frontmatter.includes('language:') 
      ? frontmatter.replace(/language: "[^"]*"/, `language: "${language}"`)
      : `${frontmatter}\nlanguage: "${language}"`;
    
    // Write updated content
    const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    console.log(`Updated language to "${language}" in ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error updating language:`, error);
  }
}

/**
 * Generate post history using Git
 */
async function generatePostHistory(filePath) {
  try {
    // Get file history from git
    const fileHistory = await getFileHistory(filePath);
    
    // Update the post with history info
    await updatePostWithHistory(filePath, fileHistory);
    
    // Update cache
    const historyData = await loadHistoryCache();
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    historyData[relativePath] = fileHistory;
    await saveHistoryCache(historyData);
    
    console.log(`Updated history for ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error generating post history:`, error);
  }
}

/**
 * Get file history from git log
 */
async function getFileHistory(filePath) {
  try {
    // Get creation date (first commit)
    const { stdout: creationInfo } = await execPromise(
      `git log --format="%at" --reverse --follow ${filePath} | head -1`
    );
    
    // Get last modification date (most recent commit)
    const { stdout: modificationInfo } = await execPromise(
      `git log -1 --format="%at" --follow ${filePath}`
    );
    
    // Get total number of commits that modified this file
    const { stdout: commitCount } = await execPromise(
      `git log --follow --format="%h" ${filePath} | wc -l`
    );
    
    const created = creationInfo.trim() ? new Date(parseInt(creationInfo.trim()) * 1000).toISOString() : null;
    const modified = modificationInfo.trim() ? new Date(parseInt(modificationInfo.trim()) * 1000).toISOString() : null;
    const edits = parseInt(commitCount.trim()) || 0;
    
    return {
      created,
      modified,
      edits
    };
  } catch (error) {
    console.error(`Error getting history for ${filePath}:`, error);
    return {
      created: null,
      modified: null,
      edits: 0
    };
  }
}

/**
 * Load or initialize the history cache
 */
async function loadHistoryCache() {
  try {
    const cacheData = await fs.readFile(historyCache, 'utf-8');
    return JSON.parse(cacheData);
  } catch (error) {
    // If file doesn't exist or can't be parsed, return empty cache
    return {};
  }
}

/**
 * Save the history cache
 */
async function saveHistoryCache(cache) {
  // Ensure data directory exists
  await fs.mkdir(path.dirname(historyCache), { recursive: true });
  
  await fs.writeFile(historyCache, JSON.stringify(cache, null, 2), 'utf-8');
  console.log(`History cache saved to ${historyCache}`);
}

/**
 * Update post frontmatter with history information
 */
async function updatePostWithHistory(filePath, history) {
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
    
    // Update or add history fields in frontmatter
    let updatedFrontmatter = frontmatter;
    
    // Update created date
    if (history.created) {
      updatedFrontmatter = updatedFrontmatter.includes('created:') 
        ? updatedFrontmatter.replace(/created: ".*?"/, `created: "${history.created}"`)
        : `${updatedFrontmatter}\ncreated: "${history.created}"`;
    }
    
    // Update modified date
    if (history.modified) {
      updatedFrontmatter = updatedFrontmatter.includes('modified:') 
        ? updatedFrontmatter.replace(/modified: ".*?"/, `modified: "${history.modified}"`)
        : `${updatedFrontmatter}\nmodified: "${history.modified}"`;
    }
    
    // Update edit count
    updatedFrontmatter = updatedFrontmatter.includes('edits:') 
      ? updatedFrontmatter.replace(/edits: \d+/, `edits: ${history.edits}`)
      : `${updatedFrontmatter}\nedits: ${history.edits}`;
    
    // Write updated content
    const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
    await fs.writeFile(filePath, updatedContent, 'utf-8');
  } catch (error) {
    console.error(`Error updating history:`, error);
  }
}

/**
 * Apply taxonomy to a post
 */
async function applyTaxonomy(filePath) {
  try {
    // Load taxonomy
    const taxonomyData = await loadTaxonomy();
    if (!taxonomyData || !taxonomyData.bilingualTags) {
      console.log('No taxonomy found. Generating tags individually...');
      await generateIndividualTags(filePath);
      return;
    }
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return;
    
    const frontmatter = frontmatterMatch[1];
    const restOfContent = content.slice(frontmatterMatch[0].length);
    
    // Detect language
    const language = detectLanguage(content);
    
    // Extract relevant content for tag generation
    const titleMatch = frontmatter.match(/title: "([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : '';
    
    const descMatch = frontmatter.match(/description: "([^"]*)"/);
    const description = descMatch ? descMatch[1] : '';
    
    // Get content snippet
    const contentSnippet = restOfContent.substring(0, 1000).replace(/\n/g, ' ');
    
    // Generate appropriate tags
    const tagResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a taxonomy specialist who assigns appropriate tags to content based on a predefined taxonomy.
You will be given a post and should return 3-7 appropriate tags from the taxonomy.

The taxonomy is organized as:
${JSON.stringify(taxonomyData.bilingualTags, null, 2)}`
        },
        {
          role: "user",
          content: `Please assign 3-7 appropriate tags to this post in ${language === 'pl' ? 'Polish' : 'English'}.
The tags should come from the taxonomy I provided or be closely related to it.

Title: ${title}
Description: ${description}
Content snippet: ${contentSnippet}

Return just the tags as a JSON array of strings.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.3,
    });
    
    // Parse tags from response
    const tagsResponse = JSON.parse(tagResponse.choices[0].message.content);
    const tags = Array.isArray(tagsResponse.tags) ? tagsResponse.tags : [];
    
    if (tags.length === 0) {
      console.log('Failed to generate tags from taxonomy. Using default tag.');
      tags.push(language === 'pl' ? 'pomysł' : 'idea');
    }
    
    // Update frontmatter with tags
    const updatedFrontmatter = frontmatter.includes('tags:') 
      ? frontmatter.replace(/tags: \[.*?\]/, `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]`)
      : `${frontmatter}\ntags: [${tags.map(tag => `"${tag}"`).join(', ')}]`;
    
    // Write updated content
    const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    console.log(`Updated tags for ${path.basename(filePath)}: ${tags.join(', ')}`);
  } catch (error) {
    console.error(`Error applying taxonomy:`, error);
  }
}

/**
 * Load taxonomy data
 */
async function loadTaxonomy() {
  try {
    const taxonomyContent = await fs.readFile(taxonomyPath, 'utf-8');
    return JSON.parse(taxonomyContent);
  } catch (error) {
    console.log('No taxonomy file found or invalid format.');
    return null;
  }
}

/**
 * Generate individual tags for a post (when no taxonomy is available)
 */
async function generateIndividualTags(filePath) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return;
    
    const frontmatter = frontmatterMatch[1];
    const restOfContent = content.slice(frontmatterMatch[0].length);
    
    // Extract title
    const titleMatch = frontmatter.match(/title: "([^"]*)"/);
    if (!titleMatch) return;
    
    const title = titleMatch[1];
    
    // Detect language
    const language = detectLanguage(content);
    
    // Generate tags using AI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates appropriate tags for blog posts about innovation and ideas. Respond with 3-7 relevant tags in ${language === 'pl' ? 'Polish' : 'English'} that categorize this content, formatted as a JSON array of strings.`
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${restOfContent.substring(0, 2000)}` 
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.5,
    });
    
    const tagsResponse = JSON.parse(response.choices[0].message.content);
    const tags = Array.isArray(tagsResponse.tags) ? tagsResponse.tags : [];
    
    if (tags.length === 0) {
      console.log('Failed to generate tags. Using default tag.');
      tags.push(language === 'pl' ? 'pomysł' : 'idea');
    }
    
    // Update frontmatter with tags
    const updatedFrontmatter = frontmatter.includes('tags:') 
      ? frontmatter.replace(/tags: \[.*?\]/, `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]`)
      : `${frontmatter}\ntags: [${tags.map(tag => `"${tag}"`).join(', ')}]`;
    
    // Write updated content
    const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    console.log(`Generated individual tags for ${path.basename(filePath)}: ${tags.join(', ')}`);
  } catch (error) {
    console.error(`Error generating individual tags:`, error);
  }
}

/**
 * Create translation if it doesn't exist
 */
async function createTranslationIfNeeded(filePath, sourceLanguage) {
  try {
    const filename = path.basename(filePath);
    const fileBase = filename.replace(/(-pl)?\.md$/, '');
    
    // Determine translation filename
    const translationFilename = sourceLanguage === 'en' 
      ? `${fileBase}-pl.md` 
      : `${fileBase.replace(/-pl$/, '')}.md`;
    
    const translationPath = path.join(postsDir, translationFilename);
    
    // Check if translation already exists
    try {
      await fs.access(translationPath);
      console.log(`Translation already exists: ${translationFilename}`);
      return;
    } catch (error) {
      // File doesn't exist, continue with translation
    }
    
    // Ask if user wants to create translation
    console.log(`No translation found for ${filename}. You can create one using:`);
    console.log(`npm run translate-post ${filePath}`);
  } catch (error) {
    console.error(`Error checking/creating translation:`, error);
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
    
    // Check if specific file is provided
    const filePath = process.argv[2];
    
    if (filePath) {
      // Process a specific file
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(process.cwd(), filePath);
      
      console.log(`Processing file: ${fullPath}`);
      await runPipeline(fullPath);
    } else {
      // Process all files in posts directory
      console.log(`Processing all files in ${postsDir}`);
      const files = await fs.readdir(postsDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      console.log(`Found ${mdFiles.length} markdown files`);
      
      for (const file of mdFiles) {
        console.log(`\nProcessing ${file}...`);
        await runPipeline(path.join(postsDir, file));
      }
    }
    
    console.log('\nContent pipeline completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();