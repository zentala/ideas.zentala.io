import path from 'path';
import fs from 'fs';

// Try to load taxonomy if it exists
let taxonomyData = { bilingualTags: {}, synonymMap: {} };
try {
  const taxonomyPath = path.join(process.cwd(), 'src/content/taxonomy.json');
  if (fs.existsSync(taxonomyPath)) {
    taxonomyData = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
  }
} catch (error) {
  console.warn('Could not load taxonomy:', error);
}

/**
 * Extracts unique tags from a collection of posts
 * @param {Array} posts - Array of post objects
 * @returns {Array} - Array of unique tags
 */
export function getUniqueTagsFromPosts(posts) {
  const allTags = posts
    .filter(post => post.frontmatter && post.frontmatter.tags)
    .flatMap(post => post.frontmatter.tags);
  
  return [...new Set(allTags)].sort();
}

/**
 * Normalizes a tag by finding its canonical form
 * @param {string} tag - Tag to normalize
 * @param {string} language - Target language ('en' or 'pl')
 * @returns {string} - Canonical form of the tag
 */
export function normalizeTag(tag, language = 'en') {
  // If we have a synonym mapping for this tag
  if (taxonomyData.synonymMap && taxonomyData.synonymMap[tag]) {
    const canonicalTag = taxonomyData.synonymMap[tag];
    
    // If we want the Polish version and it exists
    if (language === 'pl' && 
        taxonomyData.bilingualTags && 
        taxonomyData.bilingualTags[canonicalTag] &&
        taxonomyData.bilingualTags[canonicalTag].pl) {
      return taxonomyData.bilingualTags[canonicalTag].pl;
    }
    
    // Otherwise return the English canonical form
    return canonicalTag;
  }
  
  // If no mapping, return the original tag
  return tag;
}

/**
 * Finds all posts containing a tag or its synonyms
 * @param {Array} posts - Array of post objects
 * @param {string} tag - Tag to search for
 * @returns {Array} - Array of posts containing the tag or its synonyms
 */
export function getPostsByTag(posts, tag) {
  // Find canonical form of the tag
  const canonicalTag = normalizeTag(tag);
  
  // Find all synonyms for this tag
  const synonyms = new Set([tag, canonicalTag]);
  
  // Add Polish version if it exists
  if (taxonomyData.bilingualTags && 
      taxonomyData.bilingualTags[canonicalTag] &&
      taxonomyData.bilingualTags[canonicalTag].pl) {
    synonyms.add(taxonomyData.bilingualTags[canonicalTag].pl);
  }
  
  // Find all posts containing any of the synonyms
  return posts.filter(post => {
    if (!post.frontmatter || !post.frontmatter.tags) return false;
    return post.frontmatter.tags.some(postTag => synonyms.has(postTag));
  });
}

/**
 * Generates metadata from post content
 * @param {string} content - The markdown content
 * @param {string} filename - Optional filename to use for title fallback
 * @returns {Object} - Object containing title, description, and tags
 */
export function generateMetadataFromPost(content, filename = '') {
  // Extract title from first h1
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch 
    ? titleMatch[1] 
    : filename 
      ? path.basename(filename, '.md').replace(/-/g, ' ')
      : 'Untitled Idea';
  
  // Extract first paragraph as description
  const paragraphs = content.split('\n\n');
  let description = '';
  for (const para of paragraphs) {
    const text = para.trim();
    if (text && !text.startsWith('#') && !text.startsWith('!')) {
      description = text.replace(/\n/g, ' ').substring(0, 160);
      if (description.length === 160) description += '...';
      break;
    }
  }
  
  // Extract tags from content (assuming tags might be mentioned with hashtags or in a specific section)
  const tagsRegex = /#([a-zA-Z0-9_]+)/g;
  const tagMatches = [...content.matchAll(tagsRegex)];
  const tags = tagMatches.length > 0 
    ? [...new Set(tagMatches.map(match => match[1].toLowerCase()))]
    : ['idea'];
  
  // Set publication date to today
  const today = new Date().toISOString().split('T')[0];
  
  return {
    title,
    description: description || `Ideas about ${title}`,
    tags,
    pubDate: today,
    image: null // No image by default
  };
}