// API Configuration and Utility for Web and Mobile (Capacitor / PWA)

export const getApiBaseUrl = () => {
  // 1. Explicit environment variable takes top precedence
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  // 2. Custom URL saved by user in app settings (useful for physical phone testing over Wi-Fi)
  const savedUrl = localStorage.getItem('janawaaz_api_url');
  if (savedUrl) {
    return savedUrl.replace(/\/+$/, '');
  }

  // 3. Detect Capacitor Native Platform
  const isCapacitor = typeof window !== 'undefined' && (
    window?.Capacitor?.isNativePlatform?.() ||
    window?.location?.protocol === 'capacitor:' ||
    window?.location?.origin?.includes('localhost') && !window?.location?.port
  );

  if (isCapacitor) {
    return 'https://janawaaz-backend-ra47.onrender.com/api';
  }

  // 4. Default for Web browser / Vite dev proxy
  return '/api';
};

export const setApiBaseUrl = (url) => {
  if (url) {
    localStorage.setItem('janawaaz_api_url', url.trim());
  } else {
    localStorage.removeItem('janawaaz_api_url');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${cleanEndpoint}`;
  
  return fetch(url, options);
};
