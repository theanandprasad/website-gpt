'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UrlInputForm from '../components/UrlInputForm';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    
    try {
      // In a future phase, we'll implement the actual website scraping and processing
      // For now, we'll just simulate a delay and redirect to a placeholder chat page
      console.log('Processing URL:', url);
      
      // Store the URL in localStorage for now (in a future phase, we'll use Supabase)
      localStorage.setItem('lastProcessedUrl', url);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In the future, we'll redirect to a chat page with the processed website
      // For now, we'll just redirect to a placeholder page
      router.push(`/chat?url=${encodeURIComponent(url)}`);
    } catch (error) {
      console.error('Error processing URL:', error);
      // In a real app, we would show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
          Ask Questions About Any Website
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-8">
          Enter a website URL below and use AI to ask questions about its content. Get accurate answers
          without having to read through everything yourself.
        </p>
        
        <div className="mt-10">
          <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoading} />
        </div>
      </section>

      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
        <div className="bg-card-bg border border-card-border p-6 rounded-xl shadow-sm">
          <div className="text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Fast Analysis</h3>
          <p className="text-gray-800">
            Our AI quickly processes website content and provides accurate answers to your questions.
          </p>
        </div>

        <div className="bg-card-bg border border-card-border p-6 rounded-xl shadow-sm">
          <div className="text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Contextual Answers</h3>
          <p className="text-gray-800">
            Get answers that take into account the full context of the website&apos;s content.
          </p>
        </div>

        <div className="bg-card-bg border border-card-border p-6 rounded-xl shadow-sm">
          <div className="text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Natural Conversation</h3>
          <p className="text-gray-800">
            Interact with the website content through a natural chat interface.
          </p>
        </div>
      </section>
    </div>
  );
}
