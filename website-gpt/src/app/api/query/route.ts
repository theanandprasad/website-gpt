import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingModel } from '@/lib/embeddings';
import { getVectorStore } from '@/lib/vector-store';
import { getRelevantChunks, assembleContext } from '@/lib/content-processor';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { query, url } = body;

    // Validate the query
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get all chunks from the vector store
    const vectorStore = getVectorStore();
    const allChunks = await vectorStore.getAll();

    // If no URL is provided, use all chunks
    // If URL is provided, filter chunks by URL
    const filteredChunks = url
      ? allChunks.filter(chunk => chunk.metadata.url === url)
      : allChunks;

    if (filteredChunks.length === 0) {
      return NextResponse.json(
        { error: 'No content found for the provided URL' },
        { status: 404 }
      );
    }

    // For now, use the simple keyword-based relevance function
    // In the future, we'll use vector similarity search
    const relevantChunks = getRelevantChunks(query, filteredChunks, 5);

    // Assemble the context from the relevant chunks
    const context = assembleContext(relevantChunks);

    // In a future phase, we'll send this context to an LLM for answering
    // For now, just return the relevant chunks and context
    return NextResponse.json({
      success: true,
      query,
      url: url || 'all',
      relevantChunks,
      context,
    });
  } catch (error) {
    console.error('Error processing query:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 