import { ContentChunk } from './content-processor';

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
 * Simple in-memory vector store implementation
 * This is a placeholder for a real vector database like ChromaDB or Pinecone
 */
export class InMemoryVectorStore implements VectorStore {
  private documents: Array<ContentChunk & { embedding: number[] }> = [];

  /**
   * Add documents to the vector store
   * @param documents Array of content chunks with embeddings
   */
  async addDocuments(documents: Array<ContentChunk & { embedding: number[] }>): Promise<void> {
    this.documents.push(...documents);
  }

  /**
   * Perform a similarity search
   * @param query Query with embedding
   * @param k Number of results to return
   * @returns Array of similar content chunks
   */
  async similaritySearch(query: { embedding: number[] }, k: number = 5): Promise<ContentChunk[]> {
    if (this.documents.length === 0) {
      return [];
    }

    // Calculate cosine similarity between query and all documents
    const similarities = this.documents.map(doc => ({
      chunk: doc,
      similarity: this.cosineSimilarity(query.embedding, doc.embedding),
    }));

    // Sort by similarity (descending) and take the top k
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .map(item => {
        // Return the chunk without the embedding
        const { embedding, ...chunk } = item.chunk;
        return chunk as ContentChunk;
      });
  }

  /**
   * Get all documents in the vector store
   * @returns Array of all content chunks
   */
  async getAll(): Promise<ContentChunk[]> {
    return this.documents.map(({ embedding, ...chunk }) => chunk as ContentChunk);
  }

  /**
   * Clear all documents from the vector store
   */
  async clear(): Promise<void> {
    this.documents = [];
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