export async function parseRequest(request: Request) {
  const _request = request.clone();
  const url = new URL(_request.url);
  const query = Object.fromEntries(
    url.searchParams.entries()
  );

  const headers = _request.headers;
  const method = _request.method.toUpperCase() as
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "OPTIONS"
    | "HEAD";
  const contentType = headers.get("content-type") || "";

  let body: Record<string, any> | null = null;

  if (["POST", "PUT", "PATCH"].includes(method)) {
    if (contentType.includes("application/json")) {
      body = await _request.json();
    } else if (
      contentType.includes(
        "application/x-www-form-urlencoded"
      )
    ) {
      const text = await _request.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else if (
      contentType.includes("multipart/form-data")
    ) {
      const formData = await _request.formData();
      body = Object.fromEntries(formData.entries());
    }
  }

  return {
    method,
    query,
    headers,
    body,
    url,
    pathname: url.pathname,
    contentType,
  };
}

export const parseQuery = (request: Request) => {
  const _request = request.clone();
  const url = new URL(_request.url);
  const query = Object.fromEntries(
    url.searchParams.entries()
  );
  return query;
};
