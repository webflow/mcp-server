import { McpAgent } from "agents/mcp";
import { createMcpServer, createWebflowClient, registerTools } from "./mcp";

// Configure remote MCP server (SSE transport) for use in a Cloudflare Worker
export class WebflowMcpAgent extends McpAgent {
  server = createMcpServer();

  async init() {
    const client = createWebflowClient();
    registerTools(this.server, client);
  }
}

export default {}; // TODO
