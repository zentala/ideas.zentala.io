# Innovations & Ideas Collection

A personal idea collection website built with Astro.

## Features

- Dark-themed design with modern aesthetics
- Responsive layout optimized for all devices
- Content authored in Markdown format
- Tag-based organization of ideas
- Automated tag generation using AI
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

### AI Tag Generation

The project includes an AI-powered tag generation system using OpenAI's API.

#### Setup

1. Create a `.env` file in the project root
2. Add your OpenAI API key:

```
OPENAI_API_KEY=your-api-key-here
```

#### Usage

To generate tags for a specific post:

```bash
npm run generate-tags path/to/your/post.md
```

To generate tags for all posts:

```bash
npm run generate-tags:all
```

## Styling and Customization

The site uses Tailwind CSS for styling. Global styles are defined in:

- `src/layouts/MainLayout.astro` - General styling and typography
- Custom components in `src/components/`

## License

This project is licensed under the MIT License.
