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
    const { url, depth = 1 } = body;  // Default depth is 1 (crawl one level deep)

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

    // Validate depth parameter
    const maxDepth = Math.min(Math.max(parseInt(String(depth), 10) || 1, 0), 3);  // Limit depth between 0 and 3

    // Process the URL and extract content with depth-based crawling
    const { title, content, chunks, metadata, paragraphs, crawledUrls } = await processUrl(
      normalizedUrl,
      maxDepth
    );

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
        crawledUrls,
        crawlDepth: maxDepth,
        pagesProcessed: crawledUrls?.length || 1
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