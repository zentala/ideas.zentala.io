import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request }) => {
  const { tags = [], currentPath = '', limit = 3 } = await request.json();
  
  if (!tags.length) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Get all posts
    const posts = await import.meta.glob('../../content/posts/*.md');
    const allPosts = await Promise.all(
      Object.entries(posts).map(async ([path, loader]) => {
        const post = await loader();
        const url = path
          .replace('../../content/', '/')
          .replace(/\.md$/, '/');
        
        return {
          ...post,
          url,
        };
      })
    );
    
    // Filter by tags and exclude current post
    const relatedPosts = allPosts
      .filter(post => {
        if (post.url === currentPath) return false;
        const postTags = post.frontmatter?.tags || [];
        return tags.some(tag => postTags.includes(tag));
      })
      .sort((a, b) => {
        // Score posts by how many matching tags they have
        const aMatchCount = a.frontmatter?.tags?.filter(tag => tags.includes(tag)).length || 0;
        const bMatchCount = b.frontmatter?.tags?.filter(tag => tags.includes(tag)).length || 0;
        return bMatchCount - aMatchCount;
      })
      .slice(0, limit)
      .map(post => ({
        title: post.frontmatter?.title,
        description: post.frontmatter?.description,
        image: post.frontmatter?.image,
        url: post.url,
        tags: post.frontmatter?.tags,
      }));
    
    return new Response(JSON.stringify(relatedPosts), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in related-posts.json:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch related posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};