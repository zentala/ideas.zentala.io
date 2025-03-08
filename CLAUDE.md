# Project Guidelines for ideas.zentala.io

## Project Overview
This is an Astro-based blog that showcases a collection of ideas with a Pinterest-like card interface. The site supports multilingual content (English/Polish) with a bilingual tagging system.

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
- Each post must have frontmatter with title, description, tags, and language
- Custom card designs can be created in `src/components/custom-cards/`
- Image assets should be placed in `public/images/`

## Content Tooling
```bash
# Generate bilingual taxonomy for the entire collection
npm run generate-taxonomy

# Translate an existing post to another language
npm run translate-post [path-to-post]

# Create a new bilingual post (creates both language versions)
npm run create-bilingual [title]

# Extract post history from git (one post)
npm run post-history [path-to-post]

# Extract post history for all posts (using cache when available)
npm run post-history:all

# Force update post history for all posts (ignores cache)
npm run post-history:force

# Interactive content editor (convert, edit, or create posts interactively)
npm run interactive-editor

# Scan all content and prioritize what needs improvement
npm run interactive-editor    # Then select option 1

# Run full content pipeline for single post (history, language, taxonomy, translations)
npm run content-pipeline [path-to-post]

# Run full content pipeline for all posts
npm run content-pipeline
```

## Content Style Guide
- Use descriptive filenames in kebab-case (e.g., `my-idea-name.md`)
- Start each document with a level-1 heading (`# Title`)
- Group related ideas using similar prefixes in filenames
- Images: Include alt text for all images
- Links: Use reference-style links when possible

## Bilingual Content
- Each post should have a `language` field in frontmatter (`"en"` or `"pl"`)
- Related posts in different languages should have similar filenames
- Use the taxonomy generator to ensure consistent tags across languages

## Custom Card Components
- To create a custom card visualization for a post, create a component in `src/components/custom-cards/`
- Name the component after the post's filename (without extension)
- The component will automatically be used on the homepage and tag pages

## Tags System
- Tags allow grouping related ideas across languages
- Each post can have multiple tags in its native language
- A bilingual taxonomy maps tags between languages
- The taxonomy is stored in `src/content/taxonomy.json`
- Post history is cached in `src/content/post-history.json`
- Tags can be browsed at `/tags`

## Post Frontmatter Fields
```yaml
---
title: "My Great Idea"
description: "A short description of the idea"
tags: ["innovation", "technology", "future"]
language: "en"
created: "2023-01-01T12:00:00.000Z"  # First commit date (from git)
modified: "2023-02-15T15:30:00.000Z" # Latest commit date (from git)
edits: 7  # Number of commits that modified this file
---
```