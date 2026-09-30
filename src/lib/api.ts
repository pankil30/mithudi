import { useAuth } from '@/store/auth';

const BASE = (process.env.NEXT_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
  /** True when the API could not be reached at all (offline, server down, proxy error). */
  get isNetwork() {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = useAuth.getState().token;
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body == null ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('We could not reach the store. Check your connection and try again.', 0);
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // A non-JSON response (e.g. the dev proxy's error page) means the API is not reachable.
    if (!res.ok) throw new ApiError('The store is temporarily unavailable. Please try again shortly.', res.status >= 500 ? 503 : res.status);
  }

  if (!res.ok) {
    if (res.status === 401 && token) useAuth.getState().signOut();
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(
      (typeof msg === 'string' && msg.replace(/^[a-z]+\./, '')) || 'Something went wrong. Please try again.',
      res.status,
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
