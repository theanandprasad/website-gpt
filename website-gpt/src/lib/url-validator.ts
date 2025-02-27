/**
 * Validates if a string is a valid URL
 * @param url The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    // Try to create a URL object
    const urlObj = new URL(url);
    
    // Check if the protocol is http or https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Normalizes a URL by ensuring it has a protocol and removing trailing slashes
 * @param url The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: string): string {
  let normalizedUrl = url.trim();
  
  // Add protocol if missing
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  // Remove trailing slash
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  return normalizedUrl;
}

/**
 * Extracts the domain from a URL
 * @param url The URL to extract the domain from
 * @returns The domain of the URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}

/**
 * Validates and normalizes a URL
 * @param url The URL to validate and normalize
 * @returns The normalized URL if valid, null otherwise
 */
export function validateAndNormalizeUrl(url: string): string | null {
  const normalizedUrl = normalizeUrl(url);
  
  if (isValidUrl(normalizedUrl)) {
    return normalizedUrl;
  }
  
  return null;
} 