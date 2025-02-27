'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface WebsiteContent {
  content: string;
  chunks: string[];
  metadata: Record<string, string>;
  paragraphs: string[];
  crawledUrls?: string[];
  crawlDepth?: number;
  pagesProcessed?: number;
}

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState<string | null>(null);
  const [websiteTitle, setWebsiteTitle] = useState<string>('');
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Get the website title and content from localStorage
    const storedTitle = localStorage.getItem('websiteTitle');
    if (storedTitle) {
      setWebsiteTitle(storedTitle);
    }

    const storedContent = localStorage.getItem('websiteContent');
    if (storedContent) {
      try {
        setWebsiteContent(JSON.parse(storedContent));
      } catch (error) {
        console.error('Error parsing website content:', error);
      }
    }

    setIsLoading(false);

    // Add initial system message
    setMessages([
      {
        id: 'welcome',
        role: 'system',
        content: 'Welcome! Ask me anything about this website.',
        timestamp: new Date(),
      },
    ]);
  }, [searchParams]);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      // First, get the relevant chunks from the query API
      const queryResponse = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          url: url,
        }),
      });
      
      const queryData = await queryResponse.json();
      
      if (!queryResponse.ok) {
        throw new Error(queryData.error || 'Failed to process query');
      }
      
      // Then, try to get an AI-generated answer from the chat API
      try {
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: userMessage.content,
            url: url,
            context: queryData.context,
            relevantChunks: queryData.relevantChunks
          }),
        });
        
        const chatData = await chatResponse.json();
        
        if (chatResponse.ok && chatData.answer) {
          // If chat API succeeded, use its answer
          const systemMessage: Message = {
            id: `system-${Date.now()}`,
            role: 'system',
            content: chatData.answer,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, systemMessage]);
        } else {
          // If chat API failed, fall back to using the context from query API
          const systemMessage: Message = {
            id: `system-${Date.now()}`,
            role: 'system',
            content: `Here's what I found:\n\n${queryData.context}`,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, systemMessage]);
        }
      } catch (error) {
        // If chat API errors, fall back to using the context from query API
        console.error('Error calling chat API:', error);
        
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          role: 'system',
          content: `Here's what I found:\n\n${queryData.context}`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Error querying API:', error);
      
      const errorMessage: Message = {
        id: `system-error-${Date.now()}`,
        role: 'system',
        content: 'Sorry, I encountered an error while processing your query. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Loading...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!url || !websiteContent) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">No Website Data Available</h1>
        <p className="mb-6 text-gray-800">Please select a website to analyze first.</p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md font-bold inline-block"
        >
          <span className="text-white font-bold">Go Back Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">{websiteTitle}</h1>
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
        {websiteContent.metadata && websiteContent.metadata.description && (
          <div className="mt-4 text-gray-700">
            <p>{websiteContent.metadata.description}</p>
          </div>
        )}
        
        {/* Display crawl information if available */}
        {websiteContent.pagesProcessed && websiteContent.pagesProcessed > 1 && (
          <div className="mt-4 text-gray-700 text-sm">
            <p>
              <span className="font-medium">Pages analyzed:</span> {websiteContent.pagesProcessed}
              {websiteContent.crawlDepth !== undefined && (
                <span> (Depth: {websiteContent.crawlDepth})</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Chat</h2>
          <Link 
            href="/" 
            className="text-gray-900 hover:text-gray-700 transition-colors font-bold"
          >
            Analyze Another Website
          </Link>
        </div>
        
        <div className="bg-secondary rounded-lg p-6 mb-6 h-[400px] overflow-y-auto border border-gray-200">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-white ml-12'
                    : 'bg-white border border-gray-200 mr-12'
                }`}
              >
                <p className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about this website..."
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputValue.trim()}
            className={`px-6 py-3 rounded-lg shadow-md ${
              isProcessing || !inputValue.trim()
                ? 'bg-gray-500 text-white cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800 transition-colors'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-white font-bold">Processing...</span>
              </div>
            ) : (
              <span className="text-white font-bold">Send</span>
            )}
          </button>
        </form>
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