import { ContentChunk } from './content-processor';
import fs from 'fs';
import path from 'path';

/**
 * Interface for vector store operations
 */
export interface VectorStore {
  addDocuments(documents: Array<ContentChunk & { embedding: number[] }>): Promise<void>;
  similaritySearch(query: { embedding: number[] }, k?: number): Promise<ContentChunk[]>;
  getAll(): Promise<ContentChunk[]>;
  clear(): Promise<void>;
}

/**
 * Simple in-memory vector store implementation with persistence
 * This is a placeholder for a real vector database like ChromaDB or Pinecone
 */
export class InMemoryVectorStore implements VectorStore {
  private documents: Array<ContentChunk & { embedding: number[] }> = [];
  private persistPath: string;
  private persistEnabled: boolean;

  constructor(persistEnabled: boolean = true) {
    this.persistEnabled = persistEnabled;
    this.persistPath = path.join(process.cwd(), 'data', 'vector-store.json');
    
    // Create the data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (this.persistEnabled && !fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (error) {
        console.error('Error creating data directory:', error);
        this.persistEnabled = false;
      }
    }
    
    // Load persisted data if available
    this.loadFromDisk();
  }

  /**
   * Add documents to the vector store
   * @param documents Array of content chunks with embeddings
   */
  async addDocuments(documents: Array<ContentChunk & { embedding: number[] }>): Promise<void> {
    console.log(`Adding ${documents.length} documents to vector store. Total: ${this.documents.length + documents.length}`);
    
    // Add documents
    this.documents.push(...documents);
    
    // Persist to disk
    this.saveToDisk();
  }

  /**
   * Perform a similarity search
   * @param query Query with embedding
   * @param k Number of results to return
   * @returns Array of similar content chunks
   */
  async similaritySearch(query: { embedding: number[] }, k: number = 5): Promise<ContentChunk[]> {
    if (this.documents.length === 0) {
      console.log('Vector store is empty, returning empty results');
      return [];
    }

    console.log(`Performing similarity search over ${this.documents.length} documents`);

    // Calculate cosine similarity between query and all documents
    const similarities = this.documents.map(doc => ({
      chunk: doc,
      similarity: this.cosineSimilarity(query.embedding, doc.embedding),
    }));

    // Sort by similarity (descending) and take the top k
    const results = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .map(item => {
        // Return the chunk without the embedding
        const { embedding, ...chunk } = item.chunk;
        return chunk as ContentChunk;
      });
    
    console.log(`Found ${results.length} results with similarity search`);
    
    // Log the top 3 results with their similarity scores
    similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .forEach((item, index) => {
        console.log(`Top ${index + 1} result: similarity=${item.similarity.toFixed(4)}, content preview: ${item.chunk.content.substring(0, 50)}...`);
      });
    
    return results;
  }

  /**
   * Get all documents in the vector store
   * @returns Array of all content chunks
   */
  async getAll(): Promise<ContentChunk[]> {
    console.log(`Getting all ${this.documents.length} documents from vector store`);
    return this.documents.map(({ embedding, ...chunk }) => chunk as ContentChunk);
  }

  /**
   * Clear all documents from the vector store
   */
  async clear(): Promise<void> {
    console.log('Clearing vector store');
    this.documents = [];
    this.saveToDisk();
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param a First vector
   * @param b Second vector
   * @returns Cosine similarity score
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Save the vector store to disk
   */
  private saveToDisk(): void {
    if (!this.persistEnabled) return;
    
    try {
      fs.writeFileSync(
        this.persistPath,
        JSON.stringify({ documents: this.documents }),
        'utf8'
      );
      console.log(`Vector store persisted to ${this.persistPath}`);
    } catch (error) {
      console.error('Error persisting vector store:', error);
    }
  }
  
  /**
   * Load the vector store from disk
   */
  private loadFromDisk(): void {
    if (!this.persistEnabled) return;
    
    try {
      if (fs.existsSync(this.persistPath)) {
        const data = JSON.parse(fs.readFileSync(this.persistPath, 'utf8'));
        this.documents = data.documents || [];
        console.log(`Loaded ${this.documents.length} documents from ${this.persistPath}`);
      }
    } catch (error) {
      console.error('Error loading vector store:', error);
      // If there's an error loading, start with an empty store
      this.documents = [];
    }
  }
}

// Singleton instance of the vector store
let vectorStore: VectorStore | null = null;

/**
 * Get the vector store instance
 * @returns Vector store instance
 */
export function getVectorStore(): VectorStore {
  if (!vectorStore) {
    vectorStore = new InMemoryVectorStore();
  }
  return vectorStore;
} 