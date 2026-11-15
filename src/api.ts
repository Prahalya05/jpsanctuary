// Use the environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const getAuthAndUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const onAuthStateChanged = (authObj: any, callback: (user: User | null) => void) => {
  const user = getAuthAndUser();
  if (typeof callback === 'function') {
    callback(user);
    
    const listener = () => {
      callback(getAuthAndUser());
    };
    window.addEventListener('auth-change', listener);
    return () => window.removeEventListener('auth-change', listener);
  }
  return () => {};
};

export const loginWithEmail = (displayName: string, email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = displayName.trim();
  const uid = `local-${encodeURIComponent(normalizedEmail)}`;
  const user: User = {
    uid,
    email: normalizedEmail,
    displayName: normalizedName,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
  };
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
};

export const logout = () => {
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
};

export const auth = {
  get currentUser() {
    return getAuthAndUser();
  },
  signOut: logout
};

// Simple API Client for fetch
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    return response.json();
  },
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed`);
    return response.json();
  },
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed`);
    return response.json();
  }
};
