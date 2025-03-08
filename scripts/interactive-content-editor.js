import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/content/posts');
const draftsDir = path.join(__dirname, '../src/content/drafts');
const sourceDir = path.join(__dirname, '../posts'); // Legacy posts directory
const workspaceDir = path.join(__dirname, '../workspace'); // Workspace for interactive editing
const taxonomyPath = path.join(__dirname, '../src/data/taxonomy.json');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function for prompting the user
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

/**
 * Load taxonomy data if available
 */
async function loadTaxonomy() {
  try {
    const taxonomyData = await fs.readFile(taxonomyPath, 'utf-8');
    return JSON.parse(taxonomyData);
  } catch (error) {
    console.log('No existing taxonomy found. Will generate fresh taxonomy later.');
    return null;
  }
}

/**
 * Create workspace directory if it doesn't exist
 */
async function ensureWorkspaceExists() {
  try {
    await fs.mkdir(workspaceDir, { recursive: true });
    console.log('Workspace directory ready.');
  } catch (error) {
    console.error('Error creating workspace directory:', error);
  }
}

/**
 * List available source files (legacy posts)
 */
async function listSourceFiles() {
  try {
    const files = await fs.readdir(sourceDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    return mdFiles;
  } catch (error) {
    console.error('Error listing source files:', error);
    return [];
  }
}

/**
 * List existing posts
 */
async function listExistingPosts() {
  try {
    const files = await fs.readdir(postsDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    return mdFiles;
  } catch (error) {
    console.error('Error listing existing posts:', error);
    return [];
  }
}

/**
 * Load source content
 */
async function loadSourceContent(filename) {
  try {
    const filePath = path.join(sourceDir, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error loading source content for ${filename}:`, error);
    return null;
  }
}

/**
 * Save content to workspace
 */
async function saveToWorkspace(filename, content) {
  try {
    const filePath = path.join(workspaceDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`Content saved to workspace: ${filename}`);
    return filePath;
  } catch (error) {
    console.error(`Error saving to workspace:`, error);
    return null;
  }
}

/**
 * Interactive AI discussion about post
 */
async function discussWithAI(content, filename, priorityInfo = null) {
  console.log('\n🤖 Starting interactive discussion to enhance content...\n');
  
  // Extract filename without extension for context
  const filenameWithoutExt = path.basename(filename, '.md');
  
  // Prepare system message with additional context if priority info is available
  let systemMessage = `You are an expert content developer specializing in innovation and ideas. 
You are helping develop content for a bilingual (English/Polish) ideas collection blog.

Your task is to discuss with the user about this post idea and help them develop it into 
a comprehensive, well-structured article. The filename '${filenameWithoutExt}' may provide 
context about the topic.`;

  // Add priority information if available
  if (priorityInfo) {
    systemMessage += `\n\nIMPORTANT CONTEXT ABOUT THIS CONTENT:
- Priority Level: ${priorityInfo.priorityLevel.toUpperCase()} (Score: ${priorityInfo.priorityScore}/10)
- Main Issues: ${priorityInfo.issueDescription}
- Recommended Action: ${priorityInfo.recommendedAction}

Please focus particularly on addressing these issues during our discussion.`;
  }

  systemMessage += `\n\nFor this interactive session:
1. Analyze the source content provided
2. Ask specific questions to understand the idea better
3. Help expand sections that need more detail
4. Suggest improvements for clarity and structure
5. Keep track of important points raised during the discussion

The final goal is to create:
- A well-structured English version (primary)
- A Polish translation (secondary)
- Appropriate metadata and tags

IMPORTANT: Keep your responses conversational and helpful. Ask one question at a time to 
maintain a natural flow of conversation. Focus on substantive content development - prioritize
getting details about the core idea, its applications, and challenges.`;

  // Initialize chat history
  let chatHistory = [
    {
      role: "system",
      content: systemMessage
    },
    {
      role: "user",
      content: `Here's the source content for a post idea titled "${filenameWithoutExt}". I'd like to interactively develop this into a comprehensive article. Let's discuss how to enhance it:

${content}`
    }
  ];
  
  // Interactive loop
  let conversationComplete = false;
  
  while (!conversationComplete) {
    try {
      // Get AI response
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: chatHistory,
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      const aiMessage = aiResponse.choices[0].message.content;
      console.log(`\n🤖 ${aiMessage}\n`);
      
      // Add AI message to history
      chatHistory.push({
        role: "assistant",
        content: aiMessage
      });
      
      // Get user response
      const userInput = await prompt('Your response (type "done" to finish, "save" to save progress, "generate" to create final posts): ');
      
      if (userInput.toLowerCase() === 'done') {
        conversationComplete = true;
        console.log('\nConversation completed. Let me generate a summary of our discussion...');
        
        // Generate a summary
        const summaryResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            ...chatHistory,
            {
              role: "user",
              content: "Please provide a concise summary of our discussion and the key points we've developed about this idea."
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        
        const summary = summaryResponse.choices[0].message.content;
        console.log('\n📝 Discussion Summary:');
        console.log(summary);
        
      } else if (userInput.toLowerCase() === 'save') {
        // Save current progress to workspace
        const progressFilename = `${filenameWithoutExt}-progress.md`;
        const progressContent = chatHistory.map(msg => `## ${msg.role.toUpperCase()}\n\n${msg.content}`).join('\n\n---\n\n');
        await saveToWorkspace(progressFilename, progressContent);
        console.log(`Progress saved to workspace/${progressFilename}`);
        
      } else if (userInput.toLowerCase() === 'generate') {
        console.log('\nGenerating final posts based on our discussion...');
        await generateFinalPosts(chatHistory, filenameWithoutExt);
        conversationComplete = true;
        
      } else {
        // Add user message to history
        chatHistory.push({
          role: "user",
          content: userInput
        });
      }
    } catch (error) {
      console.error('Error in AI discussion:', error);
      const retry = await prompt('Would you like to retry? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        conversationComplete = true;
      }
    }
  }
  
  return chatHistory;
}

/**
 * Generate final posts (English and Polish)
 */
async function generateFinalPosts(chatHistory, filenameBase) {
  try {
    console.log('Generating English version...');
    
    // Generate English version
    const englishResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        ...chatHistory,
        {
          role: "user",
          content: `Based on our discussion, please create a complete, polished English version of the post.
Include appropriate frontmatter with:
- title: A catchy title
- description: A brief description (1-2 sentences)
- tags: 3-7 relevant tags as an array ["tag1", "tag2"]
- language: "en"

The content should be comprehensive, well-structured with Markdown headings, and flow naturally.
Format as a complete markdown file with frontmatter and content.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    const englishPost = englishResponse.choices[0].message.content;
    const englishFilename = `${filenameBase}.md`;
    await saveToWorkspace(englishFilename, englishPost);
    
    console.log('Generating Polish translation...');
    
    // Generate Polish version
    const polishResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional translator specializing in English to Polish translation for technical and innovation topics."
        },
        {
          role: "user",
          content: `Please translate this English post to Polish. Maintain the same markdown structure and formatting.
Update the frontmatter to use:
- The same title and description, but translated to Polish
- The same tags but use Polish equivalents where appropriate
- language: "pl"

Here's the English post:

${englishPost}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    const polishPost = polishResponse.choices[0].message.content;
    const polishFilename = `${filenameBase}-pl.md`;
    await saveToWorkspace(polishFilename, polishPost);
    
    console.log('Posts generated in the workspace directory:');
    console.log(`- ${englishFilename} (English version)`);
    console.log(`- ${polishFilename} (Polish version)`);
    
    const finalize = await prompt('Would you like to finalize these posts to the content directory? (y/n): ');
    if (finalize.toLowerCase() === 'y') {
      await fs.copyFile(path.join(workspaceDir, englishFilename), path.join(postsDir, englishFilename));
      await fs.copyFile(path.join(workspaceDir, polishFilename), path.join(postsDir, polishFilename));
      console.log('Posts successfully copied to content directory!');
    }
  } catch (error) {
    console.error('Error generating final posts:', error);
  }
}

/**
 * Scan and analyze all posts to prioritize which need work
 */
async function scanAndPrioritizePosts() {
  try {
    console.log('\n🔍 Scanning all content to identify improvement opportunities...');
    
    // Get existing posts
    const existingPosts = await listExistingPosts();
    
    if (existingPosts.length === 0) {
      console.log('No existing posts found to analyze.');
      return null;
    }
    
    // Get legacy posts
    const legacyPosts = await listSourceFiles();
    
    // Create summaries of all content
    console.log('Creating content summaries...');
    
    const contentSummaries = [];
    
    // Process existing posts
    for (const file of existingPosts) {
      const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
      const restOfContent = frontmatterMatch ? content.slice(frontmatterMatch[0].length) : content;
      
      // Extract title
      const titleMatch = frontmatter.match(/title: "([^"]*)"/);
      const title = titleMatch ? titleMatch[1] : file;
      
      // Extract language
      const languageMatch = frontmatter.match(/language: "([^"]*)"/);
      const language = languageMatch ? languageMatch[1] : 'unknown';
      
      // Extract tags
      const tagsMatch = frontmatter.match(/tags: \[(.*?)\]/);
      const tags = tagsMatch ? tagsMatch[1].replace(/"/g, '').split(',').map(tag => tag.trim()) : [];
      
      // Extract content snippet
      const contentSnippet = restOfContent.substring(0, 500).replace(/\n/g, ' ');
      
      // Count words in content
      const wordCount = restOfContent.split(/\s+/).length;
      
      contentSummaries.push({
        type: 'existing',
        file,
        title,
        language,
        tags,
        contentSnippet,
        wordCount,
        path: path.join(postsDir, file)
      });
    }
    
    // Process legacy posts (if any)
    for (const file of legacyPosts) {
      const content = await loadSourceContent(file);
      if (!content) continue;
      
      // Simple word count
      const wordCount = content.split(/\s+/).length;
      
      contentSummaries.push({
        type: 'legacy',
        file,
        title: file.replace('.md', ''),
        language: 'unknown',
        tags: [],
        contentSnippet: content.substring(0, 500).replace(/\n/g, ' '),
        wordCount,
        path: path.join(sourceDir, file)
      });
    }
    
    console.log(`Found ${contentSummaries.length} total files to analyze (${existingPosts.length} existing, ${legacyPosts.length} legacy)`);
    
    // Analyze content with LLM to prioritize
    console.log('\nAnalyzing content quality and prioritizing what needs work...');
    
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a content quality analyst for a bilingual (English/Polish) innovation ideas blog. 
Your task is to analyze all the content files and prioritize which ones need the most improvement.

Criteria for prioritization:
1. Legacy content that needs conversion (highest priority)
2. Content that is incomplete or lacks sufficient detail
3. Content that lacks proper structure or organization
4. Content that is missing translations
5. Content with poor language quality or errors
6. Content that lacks tags or has inappropriate tags

For each file, assign a score from 1-10, where:
- 10: Critical (needs immediate work, legacy format or severely lacking)
- 7-9: High priority (substantial improvements needed)
- 4-6: Medium priority (some improvements would be beneficial)
- 1-3: Low priority (minor improvements only)

Return your analysis as a JSON object with "prioritizedFiles" as an array of objects, each containing:
1. filename
2. priorityScore (1-10)
3. priorityLevel (critical/high/medium/low)
4. issueDescription (brief description of main issues)
5. recommendedAction (what should be done)`
        },
        {
          role: "user",
          content: `Please analyze these content files and prioritize which ones need work:
${JSON.stringify(contentSummaries, null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7,
    });
    
    const analysisResult = JSON.parse(analysisResponse.choices[0].message.content);
    
    // Display results in a nice format
    console.log('\n📊 Content Improvement Priorities:');
    console.log('================================\n');
    
    // Group by priority level
    const critical = analysisResult.prioritizedFiles.filter(file => file.priorityLevel === 'critical');
    const high = analysisResult.prioritizedFiles.filter(file => file.priorityLevel === 'high');
    const medium = analysisResult.prioritizedFiles.filter(file => file.priorityLevel === 'medium');
    const low = analysisResult.prioritizedFiles.filter(file => file.priorityLevel === 'low');
    
    // Display critical priorities
    if (critical.length > 0) {
      console.log('🔴 CRITICAL PRIORITY:');
      critical.forEach((file, index) => {
        console.log(`${index + 1}. ${file.filename} (Score: ${file.priorityScore})`);
        console.log(`   Issue: ${file.issueDescription}`);
        console.log(`   Action: ${file.recommendedAction}\n`);
      });
    }
    
    // Display high priorities
    if (high.length > 0) {
      console.log('🟠 HIGH PRIORITY:');
      high.forEach((file, index) => {
        console.log(`${index + 1}. ${file.filename} (Score: ${file.priorityScore})`);
        console.log(`   Issue: ${file.issueDescription}`);
        console.log(`   Action: ${file.recommendedAction}\n`);
      });
    }
    
    // Display medium priorities (condensed)
    if (medium.length > 0) {
      console.log('🟡 MEDIUM PRIORITY:');
      medium.forEach((file, index) => {
        console.log(`${index + 1}. ${file.filename} (Score: ${file.priorityScore}) - ${file.issueDescription}`);
      });
      console.log();
    }
    
    // Display low priorities (very condensed)
    if (low.length > 0) {
      console.log('🟢 LOW PRIORITY:');
      console.log(low.map(file => file.filename).join(', '));
      console.log();
    }
    
    return analysisResult.prioritizedFiles;
  } catch (error) {
    console.error('Error scanning and prioritizing posts:', error);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Check for OPENAI_API_KEY
    if (!process.env.OPENAI_API_KEY) {
      console.error("Error: OPENAI_API_KEY is not set in your environment or .env file");
      console.log("Please create a .env file with your OpenAI API key, for example:");
      console.log("OPENAI_API_KEY=your-api-key-here");
      process.exit(1);
    }
    
    // Ensure workspace directory exists
    await ensureWorkspaceExists();
    
    console.log('🚀 Interactive Content Editor');
    console.log('============================');
    
    // Decide mode: scan and prioritize, convert legacy, edit existing, or create new
    const mode = await prompt('What would you like to do?\n1. Scan and prioritize content that needs work\n2. Convert a legacy post\n3. Edit an existing post\n4. Create a new post from scratch\nChoose (1/2/3/4): ');
    
    if (mode === '1') {
      // Scan and prioritize content
      const prioritizedFiles = await scanAndPrioritizePosts();
      
      if (!prioritizedFiles || prioritizedFiles.length === 0) {
        console.log('No files to prioritize or analysis failed.');
        rl.close();
        return;
      }
      
      // Ask if user wants to work on highest priority item
      const highestPriority = prioritizedFiles[0];
      const workOnHighest = await prompt(`\nWould you like to work on the highest priority item "${highestPriority.filename}"? (y/n): `);
      
      if (workOnHighest.toLowerCase() === 'y') {
        let filePath, content;
        
        // Check if it's a legacy or existing post
        const isLegacy = highestPriority.filename.includes('legacy') || 
                         !existsSync(path.join(postsDir, highestPriority.filename));
        
        if (isLegacy) {
          filePath = path.join(sourceDir, highestPriority.filename);
          content = await loadSourceContent(highestPriority.filename);
        } else {
          filePath = path.join(postsDir, highestPriority.filename);
          content = await fs.readFile(filePath, 'utf-8');
        }
        
        if (!content) {
          console.log('Failed to load content.');
          rl.close();
          return;
        }
        
        // Save original content for reference
        const originalFilename = `original-${highestPriority.filename}`;
        await saveToWorkspace(originalFilename, content);
        
        // Start interactive discussion with AI
        await discussWithAI(content, highestPriority.filename, highestPriority);
      } else {
        // Let user select a file from the prioritized list
        console.log('\nSelect a file to work on:');
        
        const topPriority = [...prioritizedFiles.filter(f => f.priorityLevel === 'critical' || f.priorityLevel === 'high')];
        if (topPriority.length === 0) {
          topPriority.push(...prioritizedFiles.filter(f => f.priorityLevel === 'medium').slice(0, 5));
        }
        
        topPriority.forEach((file, index) => {
          console.log(`${index + 1}. ${file.filename} (${file.priorityLevel}, Score: ${file.priorityScore})`);
        });
        
        const fileIndex = parseInt(await prompt('\nSelect a file (number): ')) - 1;
        
        if (fileIndex < 0 || fileIndex >= topPriority.length) {
          console.log('Invalid selection.');
          rl.close();
          return;
        }
        
        const selectedFile = topPriority[fileIndex];
        console.log(`\nSelected: ${selectedFile.filename}`);
        
        let filePath, content;
        
        // Check if it's a legacy or existing post
        const isLegacy = selectedFile.filename.includes('legacy') || 
                         !existsSync(path.join(postsDir, selectedFile.filename));
        
        if (isLegacy) {
          filePath = path.join(sourceDir, selectedFile.filename);
          content = await loadSourceContent(selectedFile.filename);
        } else {
          filePath = path.join(postsDir, selectedFile.filename);
          content = await fs.readFile(filePath, 'utf-8');
        }
        
        if (!content) {
          console.log('Failed to load content.');
          rl.close();
          return;
        }
        
        // Save original content for reference
        const originalFilename = `original-${selectedFile.filename}`;
        await saveToWorkspace(originalFilename, content);
        
        // Start interactive discussion with AI
        await discussWithAI(content, selectedFile.filename, selectedFile);
      }
    } else if (mode === '2') {
      // List available source files
      const sourceFiles = await listSourceFiles();
      
      if (sourceFiles.length === 0) {
        console.log('No source files found in the posts directory.');
        rl.close();
        return;
      }
      
      console.log('\nAvailable source files:');
      sourceFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
      
      const fileIndex = parseInt(await prompt('\nSelect a file to convert (number): ')) - 1;
      
      if (fileIndex < 0 || fileIndex >= sourceFiles.length) {
        console.log('Invalid selection.');
        rl.close();
        return;
      }
      
      const selectedFile = sourceFiles[fileIndex];
      console.log(`\nSelected: ${selectedFile}`);
      
      const content = await loadSourceContent(selectedFile);
      
      if (!content) {
        console.log('Failed to load content.');
        rl.close();
        return;
      }
      
      // Save original content for reference
      const originalFilename = `original-${selectedFile}`;
      await saveToWorkspace(originalFilename, content);
      
      // Start interactive discussion with AI
      await discussWithAI(content, selectedFile);
      
    } else if (mode === '3') {
      // List existing posts
      const existingPosts = await listExistingPosts();
      
      if (existingPosts.length === 0) {
        console.log('No existing posts found.');
        rl.close();
        return;
      }
      
      console.log('\nExisting posts:');
      existingPosts.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
      
      const fileIndex = parseInt(await prompt('\nSelect a post to edit (number): ')) - 1;
      
      if (fileIndex < 0 || fileIndex >= existingPosts.length) {
        console.log('Invalid selection.');
        rl.close();
        return;
      }
      
      const selectedFile = existingPosts[fileIndex];
      console.log(`\nSelected: ${selectedFile}`);
      
      const content = await fs.readFile(path.join(postsDir, selectedFile), 'utf-8');
      
      // Save original content for reference
      const originalFilename = `original-${selectedFile}`;
      await saveToWorkspace(originalFilename, content);
      
      // Start interactive discussion with AI
      await discussWithAI(content, selectedFile);
      
    } else if (mode === '4') {
      // Create new post from scratch
      const topicName = await prompt('\nEnter a topic name (will be used as filename): ');
      const filename = `${topicName.toLowerCase().replace(/\s+/g, '-')}.md`;
      
      const initialContent = await prompt('\nProvide a brief description of your idea (or press Enter to start with AI): ');
      
      // Start interactive discussion with AI
      await discussWithAI(initialContent, filename);
    } else {
      console.log('Invalid selection.');
    }
    
    // Clean up
    rl.close();
    console.log('\nThank you for using the Interactive Content Editor!');
    
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
}

main();