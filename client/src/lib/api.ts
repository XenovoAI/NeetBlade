// API Configuration
const getApiBaseUrl = () => {
  // In this setup, frontend and backend are served from the same server
  // So we use the current origin for API calls
  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for API calls
export const createApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}/api${endpoint}`;
};

// Common fetch wrapper
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = createApiUrl(endpoint);

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      // Check if response is HTML (likely an error page or redirect)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text();
        console.error('API Error: Received HTML response instead of JSON:', response.status, htmlText.substring(0, 200) + '...');

        // Check for common authentication redirect patterns
        if (htmlText.includes('login') || htmlText.includes('redirect') || response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }

        throw new Error(`Server returned HTML error page (status ${response.status}). Check if the API endpoint exists.`);
      }

      // Try to get error as JSON first, fallback to text
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }

      console.error('API Error:', response.status, errorMessage);
      throw new Error(`API Error: ${response.status} - ${errorMessage}`);
    }

    // Ensure response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError(`Expected JSON response but got ${contentType || 'unknown content type'}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
};
