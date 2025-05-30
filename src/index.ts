#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebflowClient } from "webflow-api";
import { createMcpServer, registerTools } from "./mcp";
import { getToolConfig } from "./utils/getToolConfig";

// Verify WEBFLOW_TOKEN exists
if (!process.env.WEBFLOW_TOKEN) {
  throw new Error("WEBFLOW_TOKEN is missing");
}
//Verify APP_PORT exists
if (!process.env.APP_PORT) {
  throw new Error("APP_PORT is missing");
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
  const toolConfig = getToolConfig(
    process.env.TOOL_CONFIG || ""
  );
  const server = createMcpServer();
  await registerTools(server, getClient, toolConfig);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
