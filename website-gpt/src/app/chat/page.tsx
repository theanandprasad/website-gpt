'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ChatContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get the URL from the query parameters
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
    } else {
      // If no URL is provided, check localStorage
      const storedUrl = localStorage.getItem('lastProcessedUrl');
      if (storedUrl) {
        setUrl(storedUrl);
      }
    }
  }, [searchParams]);

  if (!url) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">No Website Selected</h1>
        <p className="mb-6">Please select a website to analyze first.</p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">Website Analysis</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="font-medium">URL:</span>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline truncate"
          >
            {url}
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Chat Interface</h2>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Analyze Another Website
          </Link>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-6 mb-6 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-500 text-center">
            This is a placeholder for the chat interface.<br />
            In the next phase, we will implement the actual chat functionality.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question about this website..."
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
} 