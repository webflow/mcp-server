export function isApiError(
  error: unknown
): error is { status: number; message?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  );
}
