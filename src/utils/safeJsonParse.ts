/**
 * Safely parse a JSON string or return the original object
 * @param value Value that might be a JSON string
 * @returns Parsed object or original value
 */
export const safeJsonParse = <T>(value: string | T): T => {
  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch (e) {
    // Could add logging here
    return value as unknown as T;
  }
};
