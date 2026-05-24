export type AdminApiErrorBody = {
  error?: string;
  storageError?: boolean;
};

export type AdminRequestResult<T> =
  | { ok: true; data: T; status: number }
  | {
      ok: false;
      error: string;
      status: number;
      isStorageError: boolean;
    };

function defaultErrorMessage(status: number): string {
  if (status === 401) return "You are not authorized. Please log in again.";
  if (status === 503) {
    return "Production storage is not configured. Connect Upstash Redis on Vercel and redeploy.";
  }
  if (status >= 500) {
    return "Server error. Please try again in a moment.";
  }
  return "Request failed. Please try again.";
}

export async function parseAdminResponse<T>(
  response: Response
): Promise<AdminRequestResult<T>> {
  let body: AdminApiErrorBody & Partial<T> = {};

  try {
    body = (await response.json()) as AdminApiErrorBody & Partial<T>;
  } catch {
    body = {};
  }

  if (!response.ok) {
    return {
      ok: false,
      error: body.error ?? defaultErrorMessage(response.status),
      status: response.status,
      isStorageError: Boolean(body.storageError) || response.status === 503,
    };
  }

  return {
    ok: true,
    data: body as T,
    status: response.status,
  };
}

export async function submitAdminJsonRequest<T>({
  url,
  method,
  body,
  fallbackError,
}: {
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  fallbackError: string;
}): Promise<AdminRequestResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await parseAdminResponse<T>(response);

    if (!result.ok && !result.error) {
      return {
        ok: false,
        error: fallbackError,
        status: result.status,
        isStorageError: result.isStorageError,
      };
    }

    return result;
  } catch {
    return {
      ok: false,
      error: "Network error. Check your connection and try again.",
      status: 0,
      isStorageError: false,
    };
  }
}

export async function submitAdminFormRequest<T>({
  url,
  formData,
  fallbackError,
}: {
  url: string;
  formData: FormData;
  fallbackError: string;
}): Promise<AdminRequestResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const result = await parseAdminResponse<T>(response);

    if (!result.ok && !result.error) {
      return {
        ok: false,
        error: fallbackError,
        status: result.status,
        isStorageError: result.isStorageError,
      };
    }

    return result;
  } catch {
    return {
      ok: false,
      error: "Network error. Check your connection and try again.",
      status: 0,
      isStorageError: false,
    };
  }
}
