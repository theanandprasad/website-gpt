import { chunkText, cleanText } from './scraper';

/**
 * Interface for processed content
 */
export interface ProcessedContent {
  title: string;
  url: string;
  content: string;
  chunks: ContentChunk[];
  metadata: Record<string, string>;
}

/**
 * Interface for content chunks
 */
export interface ContentChunk {
  id: string;
  content: string;
  metadata: {
    url: string;
    title: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

/**
 * Processes content for storage and retrieval
 * @param url The URL of the website
 * @param title The title of the website
 * @param content The main content of the website
 * @param metadata Additional metadata about the website
 * @returns Processed content ready for embedding and storage
 */
export function processContent(
  url: string,
  title: string,
  content: string,
  metadata: Record<string, string>
): ProcessedContent {
  // Clean the content
  const cleanedContent = cleanText(content);
  
  // Chunk the content
  const textChunks = chunkText(cleanedContent, 1000);
  
  // Create content chunks with metadata
  const contentChunks: ContentChunk[] = textChunks.map((chunk, index) => ({
    id: `${generateChunkId(url)}-${index}`,
    content: chunk,
    metadata: {
      url,
      title,
      chunkIndex: index,
      totalChunks: textChunks.length,
    },
  }));
  
  return {
    title,
    url,
    content: cleanedContent,
    chunks: contentChunks,
    metadata,
  };
}

/**
 * Generates a unique ID for a chunk based on the URL
 * @param url The URL of the website
 * @returns A unique ID
 */
function generateChunkId(url: string): string {
  // Create a simple hash of the URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `chunk-${Math.abs(hash).toString(16)}`;
}

/**
 * Prepares content for embedding
 * @param chunks Array of content chunks
 * @returns Array of texts ready for embedding
 */
export function prepareForEmbedding(chunks: ContentChunk[]): string[] {
  return chunks.map(chunk => chunk.content);
}

/**
 * Combines chunks with their embeddings
 * @param chunks Array of content chunks
 * @param embeddings Array of embeddings
 * @returns Array of chunks with embeddings
 */
export function combineChunksWithEmbeddings(
  chunks: ContentChunk[],
  embeddings: number[][]
): Array<ContentChunk & { embedding: number[] }> {
  if (chunks.length !== embeddings.length) {
    throw new Error('Chunks and embeddings arrays must have the same length');
  }
  
  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index],
  }));
}

/**
 * Extracts the most relevant chunks for a query
 * @param query The user's query
 * @param chunks Array of content chunks
 * @param maxChunks Maximum number of chunks to return
 * @returns Array of the most relevant chunks
 */
export function getRelevantChunks(
  query: string,
  chunks: ContentChunk[],
  maxChunks: number = 5
): ContentChunk[] {
  // This is a placeholder for semantic search
  // In a real implementation, this would use vector similarity search
  
  // For now, just return a simple keyword match
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  const scoredChunks = chunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    let score = 0;
    
    for (const term of queryTerms) {
      if (content.includes(term)) {
        score += 1;
      }
    }
    
    return { chunk, score };
  });
  
  // Sort by score (descending) and take the top maxChunks
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(item => item.chunk);
}

/**
 * Assembles a context from relevant chunks
 * @param chunks Array of relevant content chunks
 * @returns A context string for the LLM
 */
export function assembleContext(chunks: ContentChunk[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `[Chunk ${index + 1}/${chunks.length} from ${chunk.metadata.title}]\n${chunk.content}`
    )
    .join('\n\n');
} 