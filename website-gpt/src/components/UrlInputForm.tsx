import { useState } from 'react';

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export default function UrlInputForm({ onSubmit, isLoading = false }: UrlInputFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = (input: string): boolean => {
    try {
      const parsedUrl = new URL(input);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic client-side validation
    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Server-side validation
    try {
      setIsValidating(true);
      const response = await fetch('/api/validate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to validate URL');
        setIsValidating(false);
        return;
      }

      setIsValidating(false);
      onSubmit(url);
    } catch (error) {
      setError('An error occurred while validating the URL');
      setIsValidating(false);
      console.error('Error validating URL:', error);
    }
  };

  const currentlyLoading = isLoading || isValidating;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4 w-full">
          <div className="flex-grow">
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={currentlyLoading}
            />
          </div>
          <div className="md:self-end mt-4 md:mt-0">
            <button
              type="submit"
              disabled={currentlyLoading}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white ${
                currentlyLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
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
                  {isValidating ? 'Validating...' : 'Processing...'}
                </div>
              ) : (
                'Analyze Website'
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
} 