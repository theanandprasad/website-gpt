import { useState } from 'react';
import { validateAndNormalizeUrl } from '@/lib/url-validator';

interface UrlInputFormProps {
  onSubmit: (url: string, processedData?: any) => void;
  isLoading?: boolean;
}

export default function UrlInputForm({ onSubmit, isLoading = false }: UrlInputFormProps) {
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState(1); // Default depth is 1
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Client-side validation
    const normalizedUrl = validateAndNormalizeUrl(url.trim());
    if (!normalizedUrl) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Server-side processing
    try {
      setIsValidating(true);
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: normalizedUrl,
          depth: depth 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process URL');
        setIsValidating(false);
        return;
      }

      setIsValidating(false);
      onSubmit(normalizedUrl, data.data);
    } catch (error) {
      setError('An error occurred while processing the URL');
      setIsValidating(false);
      console.error('Error processing URL:', error);
    }
  };

  const currentlyLoading = isLoading || isValidating;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4 w-full">
          <div className="flex-grow">
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-900 mb-1">
              Website URL
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900"
              disabled={currentlyLoading}
            />
          </div>
          
          <div className="md:w-1/4">
            <label htmlFor="depth-select" className="block text-sm font-medium text-gray-900 mb-1">
              Crawl Depth
            </label>
            <select
              id="depth-select"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900"
              disabled={currentlyLoading}
            >
              <option value="0">Just this page</option>
              <option value="1">One level deep</option>
              <option value="2">Two levels deep</option>
              <option value="3">Three levels deep</option>
            </select>
          </div>
          
          <div className="md:self-end mt-4 md:mt-0">
            <button
              type="submit"
              disabled={currentlyLoading}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold ${
                currentlyLoading
                  ? 'bg-gray-500 text-white cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-4 focus:ring-gray-500/30 shadow-md'
              } transition-colors`}
            >
              {currentlyLoading ? (
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
                  Processing...
                </div>
              ) : (
                'Analyze Website'
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
        
        <div className="text-sm text-gray-600 mt-2">
          <p>
            <strong>Crawl Depth:</strong> Higher depth values will analyze more pages but take longer to process.
            {depth > 1 && " For large websites, this may take several minutes."}
          </p>
        </div>
      </form>
    </div>
  );
} 