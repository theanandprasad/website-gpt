import * as cheerio from 'cheerio';

/**
 * Fetches HTML content from a URL
 * @param url The URL to fetch
 * @returns The HTML content as a string
 */
export async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Website-GPT-Scraper/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching HTML:', error);
    throw error;
  }
}

/**
 * Extracts the title of a webpage from HTML
 * @param html The HTML content
 * @returns The title of the webpage
 */
export function extractTitle(html: string): string {
  const $ = cheerio.load(html);
  return $('title').text().trim() || 'Untitled Page';
}

/**
 * Extracts the main content from HTML
 * @param html The HTML content
 * @returns The main content as a string
 */
export function extractMainContent(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove script, style, and other non-content elements
  $('script, style, nav, footer, header, aside, iframe, noscript').remove();
  
  // Try to find the main content container
  const mainSelectors = [
    'main',
    'article',
    '#content',
    '.content',
    '.main',
    '.article',
    '.post',
    '.post-content',
    '.entry-content',
  ];
  
  let mainContent = '';
  
  // Try each selector until we find content
  for (const selector of mainSelectors) {
    const content = $(selector).text().trim();
    if (content.length > 200) { // Arbitrary threshold to ensure we have meaningful content
      mainContent = content;
      break;
    }
  }
  
  // If no main content found, use the body
  if (!mainContent) {
    mainContent = $('body').text().trim();
  }
  
  // Clean up the content
  return cleanText(mainContent);
}

/**
 * Extracts all paragraphs from HTML
 * @param html The HTML content
 * @returns An array of paragraph texts
 */
export function extractParagraphs(html: string): string[] {
  const $ = cheerio.load(html);
  
  // Remove script, style, and other non-content elements
  $('script, style, nav, footer, header, aside, iframe, noscript').remove();
  
  // Extract all paragraphs
  const paragraphs: string[] = [];
  $('p, h1, h2, h3, h4, h5, h6, li').each((_, element) => {
    const text = $(element).text().trim();
    if (text.length > 0) {
      paragraphs.push(text);
    }
  });
  
  return paragraphs.map(cleanText);
}

/**
 * Cleans text by removing extra whitespace and normalizing
 * @param text The text to clean
 * @returns The cleaned text
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

/**
 * Chunks text into smaller segments
 * @param text The text to chunk
 * @param maxChunkSize The maximum size of each chunk
 * @returns An array of text chunks
 */
export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by sentences to avoid cutting in the middle of a sentence
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Extracts metadata from HTML
 * @param html The HTML content
 * @returns An object containing metadata
 */
export function extractMetadata(html: string): Record<string, string> {
  const $ = cheerio.load(html);
  const metadata: Record<string, string> = {};
  
  // Extract title
  metadata.title = $('title').text().trim() || 'Untitled Page';
  
  // Extract description
  const description = $('meta[name="description"]').attr('content') || 
                     $('meta[property="og:description"]').attr('content');
  if (description) {
    metadata.description = description;
  }
  
  // Extract keywords
  const keywords = $('meta[name="keywords"]').attr('content');
  if (keywords) {
    metadata.keywords = keywords;
  }
  
  return metadata;
}

/**
 * Extracts links from HTML that belong to the same domain
 * @param html The HTML content
 * @param baseUrl The base URL for resolving relative links
 * @returns An array of absolute URLs
 */
export function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links: Set<string> = new Set();
  const baseUrlObj = new URL(baseUrl);
  const baseDomain = baseUrlObj.hostname;
  
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      try {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, baseUrl).toString();
        const linkUrl = new URL(absoluteUrl);
        
        // Only include links from the same domain and with http/https protocol
        if (linkUrl.hostname === baseDomain && 
            (linkUrl.protocol === 'http:' || linkUrl.protocol === 'https:') &&
            !linkUrl.pathname.includes('#') && // Exclude anchor links
            !linkUrl.pathname.endsWith('.pdf') && // Exclude PDFs
            !linkUrl.pathname.endsWith('.jpg') && // Exclude images
            !linkUrl.pathname.endsWith('.png') && 
            !linkUrl.pathname.endsWith('.gif') &&
            !linkUrl.pathname.endsWith('.svg')) {
          links.add(absoluteUrl);
        }
      } catch (error) {
        // Ignore invalid URLs
      }
    }
  });
  
  return Array.from(links);
}

/**
 * Processes a URL and extracts content with optional depth-based crawling
 * @param url The URL to process
 * @param maxDepth Maximum depth for crawling (0 means only the initial URL)
 * @param currentDepth Current depth in the crawling process
 * @param visitedUrls Set of already visited URLs to avoid duplicates
 * @returns An object containing the processed content
 */
export async function processUrl(
  url: string,
  maxDepth: number = 0,
  currentDepth: number = 0,
  visitedUrls: Set<string> = new Set()
): Promise<{
  title: string;
  content: string;
  chunks: string[];
  metadata: Record<string, string>;
  paragraphs: string[];
  crawledUrls?: string[];
}> {
  // Mark this URL as visited
  visitedUrls.add(url);
  
  const html = await fetchHtml(url);
  const title = extractTitle(html);
  const content = extractMainContent(html);
  const chunks = chunkText(content);
  const metadata = extractMetadata(html);
  const paragraphs = extractParagraphs(html);
  
  // If we've reached the maximum depth, don't crawl further
  if (currentDepth >= maxDepth) {
    return {
      title,
      content,
      chunks,
      metadata,
      paragraphs,
      crawledUrls: Array.from(visitedUrls)
    };
  }
  
  // Extract links for further crawling
  const links = extractLinks(html, url);
  let allContent = content;
  let allChunks = [...chunks];
  let allParagraphs = [...paragraphs];
  
  // Crawl each link that hasn't been visited yet
  for (const link of links) {
    if (!visitedUrls.has(link) && visitedUrls.size < 20) { // Limit to 20 pages to prevent excessive crawling
      try {
        console.log(`Crawling: ${link} (Depth: ${currentDepth + 1}/${maxDepth})`);
        const result = await processUrl(link, maxDepth, currentDepth + 1, visitedUrls);
        
        // Combine content from this page with the main content
        allContent += '\n\n' + result.content;
        allChunks = [...allChunks, ...result.chunks];
        allParagraphs = [...allParagraphs, ...result.paragraphs];
      } catch (error) {
        console.error(`Error crawling ${link}:`, error);
        // Continue with other links even if one fails
      }
    }
  }
  
  return {
    title,
    content: allContent,
    chunks: allChunks,
    metadata,
    paragraphs: allParagraphs,
    crawledUrls: Array.from(visitedUrls)
  };
} 