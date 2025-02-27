import { NextRequest, NextResponse } from 'next/server';
import { validateAndNormalizeUrl } from '@/lib/url-validator';
import { processUrl } from '@/lib/scraper';
import { processContent, prepareForEmbedding, combineChunksWithEmbeddings } from '@/lib/content-processor';
import { getEmbeddingModel } from '@/lib/embeddings';
import { getVectorStore } from '@/lib/vector-store';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { url } = body;

    // Validate the URL
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Normalize and validate the URL
    const normalizedUrl = validateAndNormalizeUrl(url);
    if (!normalizedUrl) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Process the URL and extract content
    const { title, content, chunks, metadata, paragraphs } = await processUrl(normalizedUrl);

    // Process the content for embedding
    const processedContent = processContent(normalizedUrl, title, content, metadata);
    
    // Generate embeddings for the chunks
    const embeddingModel = getEmbeddingModel();
    const textsToEmbed = prepareForEmbedding(processedContent.chunks);
    const embeddings = await embeddingModel.embed(textsToEmbed);
    
    // Combine chunks with embeddings
    const chunksWithEmbeddings = combineChunksWithEmbeddings(
      processedContent.chunks,
      embeddings
    );
    
    // Store in vector database
    const vectorStore = getVectorStore();
    await vectorStore.addDocuments(chunksWithEmbeddings);

    // Return the processed content (without embeddings)
    return NextResponse.json({
      success: true,
      url: normalizedUrl,
      data: {
        title,
        content,
        chunks,
        metadata,
        paragraphs,
        processedChunks: processedContent.chunks.length,
      },
    });
  } catch (error) {
    console.error('Error processing URL:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 