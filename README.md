# Innovations & Ideas Collection

A personal idea collection website built with Astro and deployed to GitHub Pages.

[![Deploy to GitHub Pages](https://github.com/zentala/ideas.zentala.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/zentala/ideas.zentala.io/actions/workflows/deploy.yml)

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch. It's accessible at:
- [https://ideas.zentala.io](https://ideas.zentala.io)

### Custom Domain Setup

This repository is configured to use the custom domain ideas.zentala.io through:
1. A CNAME file in the public directory
2. GitHub Pages settings in the repository
3. DNS configuration at the domain registrar

## Features

- Dark-themed design with modern aesthetics
- Bilingual content support (English & Polish)
- Multilingual tag system with tag synonyms across languages
- Responsive layout optimized for all devices
- Content authored in Markdown format
- Tag-based organization of ideas
- Automated tag generation using AI
- AI-powered content translation
- SEO optimized content

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/zentala/ideas.zentala.io.git
cd ideas.zentala.io

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Management

### Directory Structure

- `src/content/posts/` - Published ideas
- `src/content/drafts/` - Draft ideas (only visible in development)

### Creating New Posts

1. Create a new `.md` file in `src/content/posts/` or `src/content/drafts/`
2. Add frontmatter with required metadata:

```markdown
---
title: "Your Innovative Idea Title"
description: "Brief description of your idea"
tags: ["innovation", "technology", "future"]
language: "en"  # or "pl" for Polish
created: "2023-01-01T12:00:00.000Z"  # First commit date (from git)
modified: "2023-02-15T15:30:00.000Z" # Latest commit date (from git)
edits: 7  # Number of commits that modified this file
---

# Your Innovative Idea Title

Content of your idea goes here...
```

### Converting Legacy Posts

If you have posts in the root `posts/` directory, you can convert them to the new content collections format:

```bash
npm run convert-posts
```

### AI-Powered Content Enhancement

The project includes AI-powered content enhancement using OpenAI's API:

#### Setup

1. Create a `.env` file in the project root
2. Add your OpenAI API key:

```
OPENAI_API_KEY=your-api-key-here
```

#### Interactive Content Editor

The interactive content editor allows conversational development of posts:

```bash
npm run interactive-editor
```

This tool provides:
1. **Content analysis and prioritization** - Scans all content and identifies what needs work most urgently
2. Interactive discussion with AI about any post idea
3. The ability to convert legacy posts from the old format
4. Editing and enhancement of existing posts
5. Creation of new posts from scratch with AI assistance
6. Automatic generation of translations
7. A workspace to save progress and previews

When you select the scan option, the tool will:
- Analyze all existing and legacy posts
- Score each post on a 1-10 priority scale
- Categorize posts as critical/high/medium/low priority
- Provide specific recommendations for each post
- Allow you to immediately work on high-priority content

#### Content Pipeline

The content pipeline automates post enhancement:

```bash
# Process a single post
npm run content-pipeline path/to/your/post.md

# Process all posts
npm run content-pipeline
```

This performs all these enhancements automatically:
1. Extracts Git history (creation date, modification date, edit count)
2. Detects and sets language property
3. Applies taxonomy tags based on content
4. Identifies missing translations

#### Content Taxonomy System

The taxonomy generator creates a consistent tagging system across all posts:

```bash
npm run generate-taxonomy
```

This will:
1. Analyze all posts to understand common themes and topics
2. Create a consistent taxonomy of 20-30 primary tags
3. Apply appropriate tags to each post (ensuring related content shares tags)
4. Save the taxonomy definition to `src/data/taxonomy.json`

#### Post History Tracking

Extract post history from git commits:

```bash
# Process a single post
npm run post-history path/to/your/post.md

# Process all posts (using cache when available)
npm run post-history:all

# Force update all posts (ignore cache)
npm run post-history:force
```

This will add to each post:
- `created`: Date of first commit (publication date)
- `modified`: Date of most recent commit
- `edits`: Number of times the post has been modified

The history data is cached in `src/data/post-history.json` for performance.

### Multilingual Features

#### Creating Bilingual Content

To create a new post in both English and Polish simultaneously:

```bash
npm run create-bilingual
```

This interactive tool will:
1. Ask you for a topic
2. Generate high-quality content in both English and Polish
3. Create properly formatted Markdown files for both languages
4. Apply appropriate tags and metadata
5. Save both versions to the content directory

#### Bilingual Taxonomy Generation

The system supports a bilingual tag taxonomy where tags have both English and Polish versions:

```bash
npm run generate-taxonomy
```

This intelligently analyzes all posts and:
1. Creates a comprehensive taxonomy with 20-30 primary concepts
2. Establishes tag synonyms across languages (e.g., "smart-home" ↔ "inteligentny-dom")
3. Applies consistent tagging across all posts
4. Makes content discoverable in both languages via tag search

#### Content Translation

To create a translation of an existing post in the opposite language:

```bash
npm run translate-post src/content/posts/your-post.md
```

This will:
1. Detect the source language (English or Polish)
2. Generate a high-quality translation in the other language
3. Create a new file with the translated content
4. Preserve metadata, formatting, and links
5. Add the appropriate language flag to the frontmatter

## Styling and Customization

The site uses Tailwind CSS for styling. Global styles are defined in:

- `src/layouts/MainLayout.astro` - General styling and typography
- Custom components in `src/components/`

## License

This project is licensed under the MIT License.
