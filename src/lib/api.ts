const ACCESS = 'voltedge_access_token';
const REFRESH = 'voltedge_refresh_token';

export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (raw?.replace(/\/$/, '') || 'http://localhost:8000').trim();
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS, access);
  localStorage.setItem(REFRESH, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  store_id: string | null;
  region_id: string | null;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: ApiUser;
};

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail || `Login failed (${res.status})`);
  return data as LoginResponse;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAccessToken();
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
