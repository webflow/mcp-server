import { WEBFLOW_API_BASE } from "../config";
import { requestOptions } from "../mcp";
import { type TextContent, textContent } from "./formatResponse";

export function buildQuery(
  params: Record<string, string | number | undefined>
): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
      )
      .join("&")
  );
}

export async function apiRequest(
  method: string,
  path: string,
  getToken: () => string,
  body?: Record<string, unknown>
): Promise<TextContent> {
  const token = getToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...requestOptions.headers,
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${WEBFLOW_API_BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      name: "WebflowApiError",
      status: response.status,
      ...error,
    });
  }

  return textContent(await response.json());
}

