/**
 * Interface for embedding models
 */
export interface EmbeddingModel {
  embed(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

/**
 * Improved mock embedding model that generates more consistent embeddings
 * This is a placeholder for a real embedding model like OpenAI's
 */
export class MockEmbeddingModel implements EmbeddingModel {
  private readonly dimensions: number;
  private readonly cache: Map<string, number[]>;

  constructor(dimensions: number = 384) {
    this.dimensions = dimensions;
    this.cache = new Map<string, number[]>();
  }

  /**
   * Generate embeddings for an array of texts
   * @param texts Array of texts to embed
   * @returns Array of embeddings
   */
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(text => this.getOrCreateEmbedding(text));
  }

  /**
   * Generate an embedding for a single query text
   * @param text Text to embed
   * @returns Embedding vector
   */
  async embedQuery(text: string): Promise<number[]> {
    return this.getOrCreateEmbedding(text);
  }

  /**
   * Get or create an embedding for a text
   * @param text Text to embed
   * @returns Embedding vector
   */
  private getOrCreateEmbedding(text: string): number[] {
    // Normalize text for consistent caching
    const normalizedText = text.toLowerCase().trim();
    
    // Check if we already have an embedding for this text
    if (this.cache.has(normalizedText)) {
      return this.cache.get(normalizedText)!;
    }
    
    // Generate a deterministic embedding based on the text content
    const embedding = this.generateDeterministicEmbedding(normalizedText);
    
    // Cache the embedding
    this.cache.set(normalizedText, embedding);
    
    return embedding;
  }

  /**
   * Generate a deterministic embedding based on text content
   * @param text Text to embed
   * @returns Embedding vector
   */
  private generateDeterministicEmbedding(text: string): number[] {
    // Create a simple hash of the text to use as a seed
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use the hash as a seed for a pseudo-random number generator
    const embedding = Array(this.dimensions).fill(0).map((_, i) => {
      // Simple deterministic function based on the hash and position
      const value = Math.sin(hash + i) * 10000;
      return value - Math.floor(value) - 0.5;
    });
    
    // Normalize the embedding to unit length
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }
}

// Singleton instance of the embedding model
let embeddingModel: EmbeddingModel | null = null;

/**
 * Get the embedding model instance
 * @returns Embedding model instance
 */
export function getEmbeddingModel(): EmbeddingModel {
  if (!embeddingModel) {
    embeddingModel = new MockEmbeddingModel();
  }
  return embeddingModel;
} 