/**
 * Centralized API client with automatic JWT token validation, refresh, and authentication handling.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getValidToken(): Promise<string> {
  if (typeof window === 'undefined') return '';
  
  let token = localStorage.getItem('td_token');
  if (token && token !== 'null' && token !== 'undefined') {
    try {
      const checkRes = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (checkRes.ok) {
        return token;
      }
    } catch (e) {
      console.warn("Token check failed, attempting auto-login:", e);
    }
  }

  // If token is missing, null, or expired, auto-authenticate with default credentials
  try {
    const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@acmeai.com', password: 'password123' })
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      localStorage.setItem('td_token', data.access_token);
      localStorage.setItem('td_user', JSON.stringify(data));
      return data.access_token;
    }
  } catch (e) {
    console.error("Auto-login error:", e);
  }

  return token || '';
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getValidToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  let response = await fetch(url, { ...options, headers });

  // If 401 Unauthorized occurs, invalidate local token, re-authenticate, and retry once
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('td_token');
    const newToken = await getValidToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    }
  }

  return response;
}
