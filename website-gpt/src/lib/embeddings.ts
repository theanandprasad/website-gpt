/**
 * Interface for embedding models
 */
export interface EmbeddingModel {
  embed(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

/**
 * Mock embedding model that generates random embeddings
 * This is a placeholder for a real embedding model like OpenAI's
 */
export class MockEmbeddingModel implements EmbeddingModel {
  private readonly dimensions: number;

  constructor(dimensions: number = 384) {
    this.dimensions = dimensions;
  }

  /**
   * Generate embeddings for an array of texts
   * @param texts Array of texts to embed
   * @returns Array of embeddings
   */
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(() => this.generateRandomEmbedding());
  }

  /**
   * Generate an embedding for a single query text
   * @param text Text to embed
   * @returns Embedding vector
   */
  async embedQuery(text: string): Promise<number[]> {
    return this.generateRandomEmbedding();
  }

  /**
   * Generate a random embedding vector
   * @returns Random embedding vector
   */
  private generateRandomEmbedding(): number[] {
    const embedding = Array(this.dimensions).fill(0).map(() => Math.random() * 2 - 1);
    
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