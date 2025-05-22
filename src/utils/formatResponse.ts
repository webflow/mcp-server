export function formatResponse(response: any) {
  return {
    content: [{ type: "text" as "text", text: JSON.stringify(response) }],
  };
}

// https://modelcontextprotocol.io/docs/concepts/tools#error-handling-2
export function formatErrorResponse(error: any) {
  return {
    isError: true,
    content: [
      {
        type: "text" as "text",
        text: JSON.stringify({
          name: error.name ?? "",
          message: error.message ?? "",
          error: error,
        }),
      },
    ],
  };
}
