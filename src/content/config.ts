import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().transform(str => new Date(str)),
    image: z.string().optional().nullable(),
    tags: z.array(z.string()).default(['idea']),
    draft: z.boolean().optional().default(false),
  })
});

export const collections = {
  'posts': postsCollection,
  'drafts': postsCollection
};