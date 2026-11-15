import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export type User = FirebaseUser;

export const onAuthStateChanged = firebaseOnAuthStateChanged;

export const loginWithGoogle = async () => {
  await signInWithPopup(auth, googleProvider);
};

export const logout = () => firebaseSignOut(auth);

const request = async (endpoint: string, init?: RequestInit) => {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...init, headers });
  if (!response.ok) throw new Error(`${init?.method || 'GET'} ${endpoint} failed`);
  return response.json();
};

export const apiClient = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data: unknown) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: unknown) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};
