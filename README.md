# Innovations & Ideas Collection

A personal idea collection website built with Astro.

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
pubDate: "2023-01-01"
tags: ["innovation", "technology", "future"]
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

#### Content Taxonomy System

The taxonomy generator creates a consistent tagging system across all posts:

```bash
npm run generate-taxonomy
```

This will:
1. Analyze all posts to understand common themes and topics
2. Create a consistent taxonomy of 20-30 primary tags
3. Apply appropriate tags to each post (ensuring related content shares tags)
4. Save the taxonomy definition to `src/content/taxonomy.json`

#### Individual Post Enhancement

For enhancing individual posts:

```bash
npm run enhance-post path/to/your/post.md
```

To enhance all posts:

```bash
npm run enhance-all
```

These commands improve post formatting, fix typos, and generate appropriate tags.

### Multilingual Features

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

To create a translation of a post in the opposite language:

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
