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