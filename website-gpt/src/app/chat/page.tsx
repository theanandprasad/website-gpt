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
        <h1 className="text-2xl font-bold mb-4 text-gray-900">No Website Selected</h1>
        <p className="mb-6 text-gray-800">Please select a website to analyze first.</p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md font-bold inline-block"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Website Analysis</h1>
        <div className="flex items-center space-x-2 text-gray-800">
          <span className="font-medium">URL:</span>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline truncate font-medium"
          >
            {url}
          </a>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Chat Interface</h2>
          <Link 
            href="/" 
            className="text-gray-900 hover:text-gray-700 transition-colors font-bold"
          >
            Analyze Another Website
          </Link>
        </div>
        
        <div className="bg-secondary rounded-lg p-6 mb-6 min-h-[300px] flex items-center justify-center border border-gray-200">
          <p className="text-gray-800 text-center font-medium">
            This is a placeholder for the chat interface.<br />
            In the next phase, we will implement the actual chat functionality.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question about this website..."
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900"
            disabled
          />
          <button
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md font-bold"
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
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Loading...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
} 