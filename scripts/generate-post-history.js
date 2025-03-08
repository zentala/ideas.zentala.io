import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/content/posts');
const historyCache = path.join(__dirname, '../src/content/post-history.json');

/**
 * Get file history from git log
 */
async function getFileHistory(filePath) {
  try {
    // Get creation date (first commit)
    const { stdout: creationInfo } = await execPromise(
      `git log --format="%at" --reverse --follow ${filePath} | head -1`
    );
    
    // Get last modification date (most recent commit)
    const { stdout: modificationInfo } = await execPromise(
      `git log -1 --format="%at" --follow ${filePath}`
    );
    
    // Get total number of commits that modified this file
    const { stdout: commitCount } = await execPromise(
      `git log --follow --format="%h" ${filePath} | wc -l`
    );
    
    const created = creationInfo.trim() ? new Date(parseInt(creationInfo.trim()) * 1000).toISOString() : null;
    const modified = modificationInfo.trim() ? new Date(parseInt(modificationInfo.trim()) * 1000).toISOString() : null;
    const edits = parseInt(commitCount.trim()) || 0;
    
    return {
      created,
      modified,
      edits
    };
  } catch (error) {
    console.error(`Error getting history for ${filePath}:`, error);
    return {
      created: null,
      modified: null,
      edits: 0
    };
  }
}

/**
 * Load or initialize the history cache
 */
async function loadHistoryCache() {
  try {
    const cacheData = await fs.readFile(historyCache, 'utf-8');
    return JSON.parse(cacheData);
  } catch (error) {
    // If file doesn't exist or can't be parsed, return empty cache
    return {};
  }
}

/**
 * Save the history cache
 */
async function saveHistoryCache(cache) {
  await fs.writeFile(historyCache, JSON.stringify(cache, null, 2), 'utf-8');
  console.log(`History cache saved to ${historyCache}`);
}

/**
 * Update post frontmatter with history information
 */
async function updatePostWithHistory(filePath, history) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      console.warn(`No frontmatter found in ${filePath}`);
      return;
    }
    
    const frontmatter = frontmatterMatch[1];
    const restOfContent = content.slice(frontmatterMatch[0].length);
    
    // Update or add history fields in frontmatter
    let updatedFrontmatter = frontmatter;
    
    // Update created date
    if (history.created) {
      updatedFrontmatter = updatedFrontmatter.includes('created:') 
        ? updatedFrontmatter.replace(/created: ".*?"/, `created: "${history.created}"`)
        : `${updatedFrontmatter}\ncreated: "${history.created}"`;
    }
    
    // Update modified date
    if (history.modified) {
      updatedFrontmatter = updatedFrontmatter.includes('modified:') 
        ? updatedFrontmatter.replace(/modified: ".*?"/, `modified: "${history.modified}"`)
        : `${updatedFrontmatter}\nmodified: "${history.modified}"`;
    }
    
    // Update edit count
    updatedFrontmatter = updatedFrontmatter.includes('edits:') 
      ? updatedFrontmatter.replace(/edits: \d+/, `edits: ${history.edits}`)
      : `${updatedFrontmatter}\nedits: ${history.edits}`;
    
    // Write updated content
    const updatedContent = `---\n${updatedFrontmatter}\n---${restOfContent}`;
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    console.log(`Updated history for ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const fileArg = process.argv[2];
    const forceUpdate = process.argv.includes('--force');
    
    // Load existing cache
    const historyData = await loadHistoryCache();
    
    if (fileArg && !fileArg.startsWith('--')) {
      // Process a specific file
      const fullPath = path.isAbsolute(fileArg) 
        ? fileArg 
        : path.join(process.cwd(), fileArg);
      
      console.log(`Processing file: ${fullPath}`);
      
      // Get file history from git
      const fileHistory = await getFileHistory(fullPath);
      
      // Update cache
      const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
      historyData[relativePath] = fileHistory;
      
      // Update post with history info
      await updatePostWithHistory(fullPath, fileHistory);
      
      // Save updated cache
      await saveHistoryCache(historyData);
    } else {
      // Process all files in the posts directory
      console.log(`Processing all files in ${postsDir}`);
      const files = await fs.readdir(postsDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      console.log(`Found ${mdFiles.length} markdown files`);
      
      let updatedCount = 0;
      
      for (const file of mdFiles) {
        const filePath = path.join(postsDir, file);
        const relativePath = `src/content/posts/${file}`;
        
        // Skip if already in cache and not forcing update
        if (!forceUpdate && historyData[relativePath] && historyData[relativePath].modified) {
          console.log(`Using cached history for ${file}`);
          await updatePostWithHistory(filePath, historyData[relativePath]);
          continue;
        }
        
        // Get file history from git
        console.log(`Getting git history for ${file}...`);
        const fileHistory = await getFileHistory(filePath);
        
        // Update cache
        historyData[relativePath] = fileHistory;
        
        // Update post with history info
        await updatePostWithHistory(filePath, fileHistory);
        
        updatedCount++;
      }
      
      // Save updated cache
      await saveHistoryCache(historyData);
      
      console.log(`Updated history for ${updatedCount} posts (${mdFiles.length - updatedCount} used cache)`);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();