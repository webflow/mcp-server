export function formatResponse(response: unknown) {
  return {
    content: [{ type: "text" as "text", text: JSON.stringify(response) }],
  };
}

export function isApiError(
  error: unknown
): error is { status: number; message?: string } {
  return typeof error === "object" && error !== null && "status" in error;
}
