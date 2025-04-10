import { McpAgent } from "agents/mcp";
import { createMcpServer, registerTools } from "./mcp";
import { WebflowClient } from "webflow-api";

// Configure remote MCP server (SSE transport) for use in a Cloudflare Worker
export class WebflowMcpAgent extends McpAgent {
  server = createMcpServer();

  accessToken?: string;
  getClient = () => {
    return new WebflowClient({
      accessToken: this.accessToken ?? "",
    });
  };

  async init() {
    registerTools(this.server, this.getClient);
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams.entries());
      if (!params.accessToken) {
        throw new Error("accessToken is required");
      }
      this.accessToken = params.accessToken;
    } catch (error) {
      console.error(error);
    }
    return super.fetch(request);
  }
}

export default WebflowMcpAgent.mount("/sse", {
  binding: "MCP_OBJECT", // This should match your Durable Object binding name in wrangler.jsonc
  corsOptions: {
    origin: "*",
    methods: "GET, POST, OPTIONS",
    headers: "Content-Type, Authorization",
  },
});
