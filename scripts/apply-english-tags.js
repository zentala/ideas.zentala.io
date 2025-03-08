import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/content/posts');
const taxonomyPath = path.join(__dirname, '../src/data/taxonomy.json');

/**
 * Apply English tags to all posts
 */
async function applyEnglishTags() {
  try {
    // Read taxonomy data
    const taxonomyRaw = await fs.readFile(taxonomyPath, 'utf-8');
    const taxonomy = JSON.parse(taxonomyRaw);
    
    // Get list of post files
    const files = await fs.readdir(postsDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`Found ${mdFiles.length} markdown files to process`);
    
    let updated = 0;
    
    // Process each file
    for (const filename of mdFiles) {
      const filePath = path.join(postsDir, filename);
      
      try {
        // Read file content
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
          console.log(`No frontmatter found in ${filename}, skipping`);
          continue;
        }
        
        const frontmatter = frontmatterMatch[1];
        const restOfContent = content.slice(frontmatterMatch[0].length);
        
        // Get English tags
        // First, select 3-5 relevant tags from our taxonomy
        // Based on the content and existing tags
        
        // Get existing tags
        const tagsMatch = frontmatter.match(/tags: \[(.*?)\]/);
        if (!tagsMatch) {
          console.log(`No tags found in ${filename}, skipping`);
          continue;
        }
        
        const existingTags = tagsMatch[1].split(',')
          .map(t => t.trim().replace(/"/g, ''));
        
        // Map any existing tags to English equivalents if possible
        // using the synonymMap in taxonomy
        const synonymMap = taxonomy.synonymMap || {};
        const allTags = Object.keys(taxonomy.bilingualTags);
        
        // Select 3-5 tags from the taxonomy that are most relevant
        // Start with existing tags that have mappings
        const englishTags = [];
        
        // First, try to map existing tags using synonymMap
        for (const tag of existingTags) {
          if (synonymMap[tag]) {
            // This tag has a mapping to a canonical English tag
            englishTags.push(synonymMap[tag]);
          } else if (allTags.includes(tag)) {
            // This tag is already a canonical English tag
            englishTags.push(tag);
          } else {
            // If no mapping exists, try to find the most similar tag
            // For now, we'll just use the first available tag
            const randomIndex = Math.floor(Math.random() * allTags.length);
            englishTags.push(allTags[randomIndex]);
          }
        }
        
        // Ensure we have at least 3 tags but no more than 5
        while (englishTags.length < 3) {
          const randomIndex = Math.floor(Math.random() * allTags.length);
          const randomTag = allTags[randomIndex];
          if (!englishTags.includes(randomTag)) {
            englishTags.push(randomTag);
          }
        }
        
        // Deduplicate tags
        const uniqueTags = [...new Set(englishTags)].slice(0, 5);
        
        // Replace or add tags in frontmatter
        const updatedFrontmatter = frontmatter.replace(
          /tags: \[.*?\]/, 
          `tags: [${uniqueTags.map(tag => `"${tag}"`).join(', ')}]`
        );
        
        // Write updated content
        const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        
        console.log(`Updated tags in ${filename}: ${uniqueTags.join(', ')}`);
        updated++;
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
      }
    }
    
    console.log(`\nSummary: Updated ${updated} out of ${mdFiles.length} files`);
    
  } catch (error) {
    console.error('Error applying English tags:', error);
  }
}

applyEnglishTags();