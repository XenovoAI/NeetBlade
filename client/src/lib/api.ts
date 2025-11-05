// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }

  // Check if we're accessing via localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://${window.location.hostname}:${window.location.port || 5001}`;
  }

  // Production URL
  return 'https://neetblade.in';
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
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
};