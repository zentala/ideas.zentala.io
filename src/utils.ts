export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function extractExcerpt(content: string, maxLength: number = 150): string {
  // Remove HTML tags
  const text = content.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Truncate to maxLength
  if (text.length <= maxLength) return text;
  
  // Find the last space within maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace === -1) return truncated + '...';
  
  return truncated.substring(0, lastSpace) + '...';
}

export function getUniqueTagsFromPosts(posts: any[]): string[] {
  const allTags = posts.flatMap(post => post.frontmatter?.tags || []);
  return [...new Set(allTags)].sort();
}

export function generateMetadataFromPost(postContent: string): Record<string, any> {
  const titleMatch = postContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled Idea';
  
  // Get first paragraph as description
  let description = '';
  const paragraphs = postContent.split('\n\n');
  for (const paragraph of paragraphs) {
    if (paragraph.trim() && !paragraph.startsWith('#') && !paragraph.startsWith('![')) {
      description = paragraph.replace(/\n/g, ' ').trim();
      if (description.length > 160) {
        description = description.substring(0, 157) + '...';
      }
      break;
    }
  }
  
  // Extract image
  const imageMatch = postContent.match(/!\[.+\]\((.+)\)/);
  const image = imageMatch ? imageMatch[1] : '';
  
  // Extract potential tags from content
  const potentialTags: string[] = [];
  const techTerms = [
    'javascript', 'react', 'vue', 'angular', 'svelte', 'node', 'python', 'django', 'flask',
    'ruby', 'rails', 'php', 'laravel', 'golang', 'rust', 'c#', '.net', 'java', 'spring',
    'ai', 'ml', 'machine learning', 'deep learning', 'blockchain', 'iot', 'hardware', 'api',
    'frontend', 'backend', 'fullstack', 'mobile', 'web', 'desktop', 'cloud', 'aws', 'azure',
    'gcp', 'devops', 'ci/cd', 'testing', 'automation', 'security', 'database', 'sql', 'nosql',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'
  ];
  
  // Look for tech terms in content
  const contentLower = postContent.toLowerCase();
  techTerms.forEach(term => {
    if (contentLower.includes(term.toLowerCase()) && !potentialTags.includes(term)) {
      potentialTags.push(term);
    }
  });
  
  // Get current date
  const pubDate = new Date().toISOString().split('T')[0];
  
  return {
    title,
    description,
    image,
    pubDate,
    tags: potentialTags.slice(0, 5), // Limit to 5 tags
  };
}