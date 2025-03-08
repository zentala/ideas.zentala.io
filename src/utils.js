import path from 'path';

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