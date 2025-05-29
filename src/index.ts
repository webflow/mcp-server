#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebflowClient } from "webflow-api";
import { createMcpServer, registerTools } from "./modules/mcp";
import { handleRoutes } from "./modules/routes";
import {
  serveMCP,
  WFDesignerMCP,
} from "./modules/mcp/index";
import { WFDesignerRPC } from "./modules/rpc/index";
import { corsHeaders } from "./utils/corsHeaders";
import { EnvWithOAuthProvider } from "./types/env";
// Export the MCP agent DO and the RPC DO
export { WFDesignerMCP, WFDesignerRPC };



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
