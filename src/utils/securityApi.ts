import type { ApiResponse } from "../types/wrapper";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const API_PREFIX = "/api/security";
const API_ROUTING_URL = `${API_BASE}${API_PREFIX}`;

export async function securityRequest<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_ROUTING_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    // ignore invalid json
  }

  if (!response.ok || !payload?.isSuccess) {
    const message = payload?.resMessage || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function securityGet<T>(path: string): Promise<ApiResponse<T>> {
  return securityRequest<T>(path, { method: "GET" });
}

export async function securityPost<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return securityRequest<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
