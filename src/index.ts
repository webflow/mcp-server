#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebflowClient } from "webflow-api";
import { createMcpServer, registerTools } from "./mcp";

// Verify WEBFLOW_TOKEN exists
if (!process.env.WEBFLOW_TOKEN) {
  throw new Error("WEBFLOW_TOKEN is missing");
}

// Create a Webflow client
const webflowClient = new WebflowClient({
  accessToken: process.env.WEBFLOW_TOKEN,
});

// Return the Webflow client
function getClient() {
  return webflowClient;
}

// Configure and run local MCP server (stdio transport)
async function run() {
  const server = createMcpServer();
  registerTools(server, getClient);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
