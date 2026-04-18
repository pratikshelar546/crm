import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5003";

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ApiEnvelope<T> = { data: T; error?: unknown | null };

export function unwrapData<T>(payload: ApiEnvelope<T>): T {
  return payload.data;
}

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as
      | { error?: { message?: string }; message?: string }
      | undefined;
    const msg = body?.error && typeof body.error === "object" ? (body.error as { message?: string }).message : undefined;
    if (typeof msg === "string" && msg.length > 0) return msg;
    if (typeof body?.message === "string") return body.message;
    return err.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
