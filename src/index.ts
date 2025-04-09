#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer, createWebflowClient, registerTools } from "./mcp";

// Configure and run local MCP server (stdio transport)
async function run() {
  const server = createMcpServer();
  const client = createWebflowClient();
  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
