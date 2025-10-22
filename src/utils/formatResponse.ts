export type TextContent = {
  type: "text";
  text: string;
}

export type ImageContent = {
  type: "image";
  data: string;
  mimeType: string;
}

export type Content = TextContent | ImageContent;

export type ToolResponse = {
  content: Content[];
}

export function formatResponse(response: any): ToolResponse {
  return {
    content: [{ type: "text" as "text", text: JSON.stringify(response) }],
  };
}

export function textContent(response: any): TextContent {
  return {
    type: "text",
    text: JSON.stringify(response)
  };
}

export function imageContent(data: string, mimeType: string): ImageContent {
  return {
    type: "image",
    data,
    mimeType,
  };
}

export function toolResponse(contentItems: Content[]): ToolResponse {
  return {
    content: contentItems,
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
