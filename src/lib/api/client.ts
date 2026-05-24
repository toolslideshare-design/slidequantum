/**
 * API client placeholder for future backend integration.
 * Replace BASE_URL when your API is ready.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...init } = options;

  let url = `${BASE_URL}${endpoint}`;

  if (params) {
    const search = new URLSearchParams(params);
    url += `?${search.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
