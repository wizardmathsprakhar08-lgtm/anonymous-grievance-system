// Central API service for Expo Go App connecting to 24/7 Render Cloud backend

let currentApiBaseUrl = 'https://janawaaz-backend-ra47.onrender.com/api';

export const getApiBaseUrl = () => currentApiBaseUrl;

export const setApiBaseUrl = (newUrl) => {
  if (newUrl && newUrl.trim()) {
    currentApiBaseUrl = newUrl.trim().replace(/\/+$/, '');
  }
};

const request = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${currentApiBaseUrl}${cleanEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = data?.detail || `Server error (${res.status})`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    if (err.message.includes('Network request failed') || err.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to backend at ${currentApiBaseUrl}. Make sure your phone and PC are on the same Wi-Fi.`);
    }
    throw err;
  }
};

export const api = {
  // Public Citizen Endpoints
  submitGrievance: (text, category_hint = null) => {
    return request('/grievances', {
      method: 'POST',
      body: JSON.stringify({ text, category_hint: category_hint || null })
    });
  },

  getGrievance: (trackingId) => {
    return request(`/grievances/${encodeURIComponent(trackingId.trim().toUpperCase())}`);
  },

  // Officer / Admin Auth
  login: (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  // Officer Operations
  getOfficerQueue: (token, statusFilter = '') => {
    let endpoint = '/officer/queue';
    if (statusFilter) {
      endpoint += `?status_filter=${encodeURIComponent(statusFilter)}`;
    }
    return request(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  updateGrievanceStatus: (id, newStatus, note, token) => {
    return request(`/officer/grievances/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        new_status: newStatus,
        note: note ? note.trim() : null
      })
    });
  }
};
