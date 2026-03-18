import type { CommonResponse } from "../types/auth";

const API_BASE_URL = import.meta.env["VITE_SOME_KEY_API_BASE_URL"] as string | undefined;

export class ApiRequestError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

interface RequestOptions<B> {
  body?: B;
  errorFactory?: (message: string, status?: number) => Error;
  headers?: HeadersInit;
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = encodeURIComponent(name);
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${encodedName}=`));

  if (!cookie) {
    return null;
  }

  const [, value = ""] = cookie.split("=");
  return decodeURIComponent(value);
}

function expireCookie(name: string, path: string) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") {
    return;
  }

  ["SESSION", "JSESSIONID", "XSRF-TOKEN"].forEach((name) => {
    expireCookie(name, "/");
    expireCookie(name, "/api");
  });
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // In development, always call the current frontend origin so Vite can
  // intercept `/api/*` and forward it through the configured dev proxy.
  if (import.meta.env.DEV) {
    return new URL(normalizedPath, window.location.origin).toString();
  }

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  const baseUrl = new URL(API_BASE_URL);
  const basePath = baseUrl.pathname.endsWith("/") ? baseUrl.pathname.slice(0, -1) : baseUrl.pathname;

  baseUrl.pathname = `${basePath}${normalizedPath}`;

  return baseUrl.toString();
}

function createAuthHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers ?? {});
  const xsrfToken = getCookieValue("XSRF-TOKEN");

  if (!nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "*/*");
  }

  if (xsrfToken && !nextHeaders.has("X-XSRF-TOKEN")) {
    nextHeaders.set("X-XSRF-TOKEN", xsrfToken);
  }

  return nextHeaders;
}

function createDefaultHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers ?? {});

  if (!nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "*/*");
  }

  return nextHeaders;
}

async function executeRequest<T, B>(
  path: string,
  method: "GET" | "POST",
  shouldIncludeCookies: boolean,
  options?: RequestOptions<B>,
): Promise<CommonResponse<T>> {
  const createError = options?.errorFactory ?? ((message: string, status?: number) => new ApiRequestError(message, status));

  try {
    const response = await fetch(buildApiUrl(path), {
      method,
      ...(shouldIncludeCookies ? { credentials: "include" as const } : {}),
      headers: shouldIncludeCookies ? createAuthHeaders(options?.headers) : createDefaultHeaders(options?.headers),
      ...(options?.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });

    let result: CommonResponse<T> | null = null;

    try {
      result = (await response.json()) as CommonResponse<T>;
    } catch {
      result = null;
    }

    if (!response.ok || !result?.success) {
      const message = result?.message || "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      throw createError(message, response.status);
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      throw createError("네트워크 연결을 확인해주세요.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw createError("알 수 없는 오류가 발생했습니다.");
  }
}

export function getWithCookies<T>(path: string, options?: Omit<RequestOptions<never>, "body">) {
  return executeRequest<T, never>(path, "GET", true, options);
}

export function postWithCookies<T, B>(path: string, body: B, options?: Omit<RequestOptions<B>, "body">) {
  return executeRequest<T, B>(path, "POST", true, {
    ...options,
    body,
  });
}

export function getWithoutCookies<T>(path: string, options?: Omit<RequestOptions<never>, "body">) {
  return executeRequest<T, never>(path, "GET", false, options);
}

export function postWithoutCookies<T, B>(path: string, body: B, options?: Omit<RequestOptions<B>, "body">) {
  return executeRequest<T, B>(path, "POST", false, {
    ...options,
    body,
  });
}
