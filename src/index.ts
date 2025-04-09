#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebflowClient } from "webflow-api";
import { createMcpServer, registerTools } from "./mcp";

// Configure and run local MCP server (stdio transport)
async function run() {
  // Verify WEBFLOW_TOKEN
  if (!process.env.WEBFLOW_TOKEN) {
    throw new Error("WEBFLOW_TOKEN is missing");
  }

  const server = createMcpServer();
  const webflowClient = new WebflowClient({
    accessToken: process.env.WEBFLOW_TOKEN,
  });
  registerTools(server, webflowClient);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
