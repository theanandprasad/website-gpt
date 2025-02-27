export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">About Website GPT</h1>
        
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-strong:text-gray-900 bg-card-bg border border-card-border rounded-xl shadow-sm p-8">
          <p className="mb-6">
            Website GPT is an innovative tool that allows users to interact with website content through
            natural language. Instead of spending time reading through entire websites, you can simply
            ask questions and get accurate answers based on the website&apos;s content.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Enter a URL:</strong> Provide the website address you want to analyze.
            </li>
            <li>
              <strong>Processing:</strong> Our system extracts and processes the content from the website.
            </li>
            <li>
              <strong>Ask Questions:</strong> Use the chat interface to ask any questions about the website content.
            </li>
            <li>
              <strong>Get Answers:</strong> Receive accurate, contextual answers based on the website&apos;s information.
            </li>
          </ol>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Technology</h2>
          <p className="mb-6">
            Website GPT uses advanced AI and natural language processing technologies to understand website
            content and generate accurate responses to your questions. The system employs:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Web scraping technology to extract content</li>
            <li>Text processing to clean and organize information</li>
            <li>Vector embeddings to understand semantic meaning</li>
            <li>Large language models to generate human-like responses</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Use Cases</h2>
          <p className="mb-6">
            Website GPT is useful for a variety of scenarios:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Quickly understanding the main points of research papers</li>
            <li>Extracting specific information from documentation</li>
            <li>Learning about products or services without reading entire websites</li>
            <li>Summarizing news articles or blog posts</li>
            <li>Researching topics across multiple websites efficiently</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 