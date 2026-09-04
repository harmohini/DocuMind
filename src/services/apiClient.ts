import { API_BASE_URL } from '../config/api';
import { getLocalUserId } from '../utils/userId';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  headers.set('X-User-ID', getLocalUserId());

  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

  return fetch(url, {
    ...options,
    headers
  });
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetchWithAuth('/health');
    return response.ok;
  } catch {
    return false;
  }
}
