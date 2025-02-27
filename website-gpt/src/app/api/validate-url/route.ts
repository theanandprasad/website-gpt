import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'URL must use HTTP or HTTPS protocol' },
          { status: 400 }
        );
      }
    } catch (_) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if the URL is accessible
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Website-GPT-Validator/1.0',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `URL returned status code ${response.status}` },
          { status: 400 }
        );
      }
    } catch (_) {
      return NextResponse.json(
        { error: 'Could not access the URL' },
        { status: 400 }
      );
    }

    // If all checks pass, return success
    return NextResponse.json({ 
      success: true,
      url: parsedUrl.toString(),
      message: 'URL is valid and accessible'
    });
  } catch (error) {
    console.error('Error validating URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 