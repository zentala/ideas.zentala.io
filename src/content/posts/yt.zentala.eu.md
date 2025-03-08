---
title: "yt.zentala.eu"
description: "Automated YouTube summarizer service with LLM technology, Polish-English support & secure GitHub integration"

pubDate: "2025-03-08"
tags: ["innowacje", "pomysły", "technologia", "serwis internetowy", "automatyzacja", "YouTube", "transkrypcja"]
created: "2025-03-08T14:57:57.000Z"
modified: "2025-03-08T15:09:08.000Z"
edits: 3
language: "pl"
---

# yt.zentala.eu

## Technical Specification for LLM-based YouTube Summarizer Service

### Service Description
A service to automatically generate and publish summarized and transcribed content from YouTube videos. Summaries and transcripts will primarily be provided in Polish, with occasional English content.

### Proposed Domain
- yt.zentala.eu

### Goals of the Project
- Generate SEO-friendly auto-content relevant to the user's interests and identity.
- Facilitate sharing summarized video links with friends and peers.
- Enable easy revisiting and reviewing of essential video content.
- Serve as an inspiration and experimental platform for potentially broader future projects focused on effective content sharing and knowledge curation.

### Overview of Workflow
1. **User Action**: User triggers various actions via Chrome extension directly on YouTube video pages.
2. **Content Generation & Actions**:
   - Options for different LLM actions:
     - Generate enhanced transcript (clean formatting).
     - Translate transcript into Polish.
     - Create Polish/English summaries.
     - Perform additional research based on transcript content, followed by summarization.
3. **Output & Version Control**:
   - Generated content (transcripts, translations, summaries, and research notes) are converted to Markdown.
   - Content and metadata are pushed to a dedicated GitHub repository.
4. **Static Website Publishing**:
   - Astro.js builds and deploys static web pages using content from the GitHub repository.
   - Website updates dynamically upon new commits.

### Technology Stack
- **Frontend**:
  - Astro.js-based static site
  - Hosted via GitHub Pages or similar service
- **Chrome Plugin**:
  - JavaScript/TypeScript Chrome Extension
  - Integration with YouTube for transcripts and summarization requests
  - Secure local storage of GitHub and OpenAI API credentials (with cloud synchronization via Google Chrome sync)
- **Content Automation**:
  - Language Model integration via direct API calls (e.g., OpenAI)
  - Markdown generation and direct GitHub repository interaction using GitHub API (no dedicated backend server required)

### Detailed Process
#### Chrome Plugin Functionality
- Adds actionable buttons to YouTube video pages for different content types.
- Extracts available YouTube-generated transcripts.
- Sends transcripts and user-selected action to LLM for processing.
- Receives processed content, converts it into Markdown, and prompts the user for optional edits.
- Pushes Markdown files and associated metadata directly to GitHub repository via GitHub API.

#### LLM Content Generation
- Accurate, SEO-friendly summaries, transcripts, and additional research content.
- Multilingual support (Polish primary, English secondary).

#### Enhanced Metadata Structure (Prototype)
```yaml
title_original: "Original YouTube Video Title"
title_summary: "Custom LLM-Generated Title"
publish_date_original: "YYYY-MM-DD"
publish_date_summary: "YYYY-MM-DD"
youtube_link: "https://youtube.com/..."
video_language: "en"
summary_language: "pl"
type: "summary" # "transcript", "translated_transcript", "research"
tags: ["tag1", "tag2", "seo-friendly"]
meta_description: "Short SEO-friendly description based on content."
```
- Transcripts and summaries will be full Markdown files (content), with metadata in YAML front matter.

#### Handling Multiple Content Types
- Each action type generates its own Markdown file with relevant YAML front matter metadata.
- Astro.js differentiates content using metadata (type, language) for appropriate presentation and indexing.

#### GitHub Integration
- Chrome plugin directly pushes Markdown files using GitHub API credentials stored securely.
- Commits trigger automated Astro.js deployments.

#### Static Website (Astro.js)
- Dynamically built from repository Markdown content.
- Responsive design for multi-device compatibility.
- Clear content categorization based on metadata for seamless navigation.

### Security and Credential Management
- Credentials securely stored locally in Chrome extension and synchronized via Chrome's built-in Google synchronization service for seamless cross-browser experience.