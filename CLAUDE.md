# Project Guidelines for ideas.zentala.io

## Project Overview
This is an Astro-based blog that showcases a collection of ideas with a Pinterest-like card interface.

## Build & Deployment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Management
- Markdown files are stored in `src/content/posts/` and `src/content/drafts/`
- Each post must have frontmatter with title, description, and tags
- Custom card designs can be created in `src/components/custom-cards/`
- Image assets should be placed in `public/images/`

## Content Style Guide
- Use descriptive filenames in kebab-case (e.g., `my-idea-name.md`)
- Start each document with a level-1 heading (`# Title`)
- Group related ideas using similar prefixes in filenames
- Images: Include alt text for all images
- Links: Use reference-style links when possible

## Custom Card Components
- To create a custom card visualization for a post, create a component in `src/components/custom-cards/`
- Name the component after the post's filename (without extension)
- The component will automatically be used on the homepage and tag pages

## Tags System
- Tags allow grouping related ideas
- Each post can have multiple tags
- Tags are automatically extracted from post content
- Tags can be browsed at `/tags`