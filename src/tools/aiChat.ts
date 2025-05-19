const BASE_URL = "https://webflow-ai.docs.buildwithfern.com/";

export async function postChat(message: string) {
  const response = await fetch(`${BASE_URL}/api/fern-docs/search/v2/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: message }],
      url: "https://buildwithfern.com/learn",
      filters: [],
      source: "mcp",
    }),
  });

  const result = await streamToString(response);
  return result;
}

async function streamToString(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("!reader");
  }

  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Convert the Uint8Array to a string and append
    result += new TextDecoder().decode(value);
  }

  return result;
}
