import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getVectorStore } from '@/lib/vector-store';
import { getRelevantChunks, assembleContext } from '@/lib/content-processor';
import { getEmbeddingModel } from '@/lib/embeddings';

// Initialize OpenAI client if API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (openaiApiKey && openaiApiKey !== 'your-openai-api-key') {
  try {
    openai = new OpenAI({
      apiKey: openaiApiKey,
    });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, query, context, relevantChunks } = body;

    if (!url || !query) {
      return NextResponse.json(
        { error: 'URL and query are required' },
        { status: 400 }
      );
    }

    // If context is provided directly from the client, use it
    if (context && relevantChunks) {
      // If OpenAI client is available, use it to generate a response
      if (openai) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a helpful assistant that answers questions about website content. 
                Use ONLY the following context to answer the question. If you don't know the answer based on the context, say so.
                Context: ${context}`,
              },
              {
                role: 'user',
                content: query,
              },
            ],
            temperature: 0.5,
            max_tokens: 500,
          });

          const answer = completion.choices[0].message.content;

          return NextResponse.json({
            success: true,
            query,
            url,
            answer,
            relevantChunks,
          });
        } catch (error: any) {
          console.error('Error calling OpenAI API:', error);
          // Fall back to returning the context directly
          return NextResponse.json({
            success: true,
            query,
            url,
            answer: `I found the following information about your query:\n\n${context}`,
            relevantChunks,
          });
        }
      } else {
        // If OpenAI is not available, return the context directly
        return NextResponse.json({
          success: true,
          query,
          url,
          answer: `I found the following information about your query:\n\n${context}`,
          relevantChunks,
        });
      }
    }

    // If no context is provided, try to get it from the vector store
    const vectorStore = getVectorStore();
    const allChunks = await vectorStore.getAll();

    // Filter chunks by URL
    const filteredChunks = allChunks.filter(chunk => chunk.metadata.url === url);

    // If we have chunks for this URL, use them to generate a response
    if (filteredChunks.length > 0) {
      console.log(`Found ${filteredChunks.length} chunks for URL: ${url}`);
      
      // Get relevant chunks using both keyword matching and vector similarity
      let relevantChunks = [];
      
      // 1. First try keyword-based matching
      const keywordChunks = getRelevantChunks(query, filteredChunks, 5);
      
      // 2. Then try vector similarity search if we have an embedding model
      try {
        const embeddingModel = getEmbeddingModel();
        const queryEmbedding = await embeddingModel.embedQuery(query);
        
        // Get chunks using vector similarity
        const vectorChunks = await vectorStore.similaritySearch({ embedding: queryEmbedding }, 5);
        
        // Filter to only include chunks from the current URL
        const filteredVectorChunks = vectorChunks.filter(chunk => chunk.metadata.url === url);
        
        // Combine both sets of chunks, removing duplicates
        const chunkIds = new Set();
        relevantChunks = [...keywordChunks];
        
        for (const chunk of keywordChunks) {
          chunkIds.add(chunk.id);
        }
        
        for (const chunk of filteredVectorChunks) {
          if (!chunkIds.has(chunk.id)) {
            relevantChunks.push(chunk);
            chunkIds.add(chunk.id);
          }
        }
        
        // Limit to top 5 chunks
        relevantChunks = relevantChunks.slice(0, 5);
      } catch (error) {
        console.error('Error performing vector similarity search:', error);
        // Fall back to just keyword chunks
        relevantChunks = keywordChunks;
      }
      
      // If we still don't have any relevant chunks, use the first few chunks
      if (relevantChunks.length === 0) {
        console.log('No relevant chunks found, using first chunks');
        relevantChunks = filteredChunks.slice(0, 3);
      }

      // Assemble the context from the relevant chunks
      const storeContext = assembleContext(relevantChunks);
      
      console.log(`Using ${relevantChunks.length} chunks for context`);

      // If OpenAI client is available, use it to generate a response
      if (openai) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a helpful assistant that answers questions about website content. 
                Use ONLY the following context to answer the question. If you don't know the answer based on the context, say so.
                Context: ${storeContext}`,
              },
              {
                role: 'user',
                content: query,
              },
            ],
            temperature: 0.5,
            max_tokens: 500,
          });

          const answer = completion.choices[0].message.content;

          return NextResponse.json({
            success: true,
            query,
            url,
            answer,
            relevantChunks,
          });
        } catch (error: any) {
          console.error('Error calling OpenAI API:', error);
          // Fall back to returning the context directly
          return NextResponse.json({
            success: true,
            query,
            url,
            answer: `I found the following information about your query:\n\n${storeContext}`,
            relevantChunks,
          });
        }
      } else {
        // If OpenAI is not available, return the context directly
        return NextResponse.json({
          success: true,
          query,
          url,
          answer: `I found the following information about your query:\n\n${storeContext}`,
          relevantChunks,
        });
      }
    } 
    // If we don't have chunks for this URL but OpenAI is available, use it to generate a general response
    else if (openai) {
      try {
        // Try to fetch the website content directly
        let websiteInfo = "";
        try {
          const response = await fetch(url);
          if (response.ok) {
            websiteInfo = `The query is about the website at ${url}.`;
          }
        } catch (error) {
          console.error('Error fetching website:', error);
        }

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant that answers questions about websites. 
              The user is asking about a website, but we don't have specific content from it yet.
              ${websiteInfo}
              Please suggest that they try scraping the website first using the "Analyze Website" button on the home page.`,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        });

        const answer = completion.choices[0].message.content;

        return NextResponse.json({
          success: true,
          query,
          url,
          answer,
          relevantChunks: [],
        });
      } catch (error: any) {
        console.error('Error calling OpenAI API for general response:', error);
      }
    }

    // If all else fails, return a 404 error
    return NextResponse.json(
      { error: 'No content found for the provided URL' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 