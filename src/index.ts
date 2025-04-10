#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer, registerTools } from "./mcp";
import { WebflowClient } from "webflow-api";

// Create a Webflow client
function getClient() {
  // Verify WEBFLOW_TOKEN
  if (!process.env.WEBFLOW_TOKEN) {
    throw new Error("WEBFLOW_TOKEN is missing");
  }
  return new WebflowClient({
    accessToken: process.env.WEBFLOW_TOKEN,
  });
}

// Configure and run local MCP server (stdio transport)
async function run() {
  const server = createMcpServer();
  registerTools(server, getClient);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
