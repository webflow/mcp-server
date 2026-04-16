#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebflowClient } from "webflow-api";
import {
  createMcpServer,
  registerMiscTools,
  registerTools,
} from "./mcp";
import { PageAutomationClient } from "./modules/pageAutomationClient";
import { registerPageAutomationTools } from "./modules/dynamicToolRegistration";

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

// Return the Webflow access token
function getAccessToken() {
  if (!process.env.WEBFLOW_TOKEN) {
    throw new Error("WEBFLOW_TOKEN is missing");
  }
  return process.env.WEBFLOW_TOKEN || "";
}

// Configure and run local MCP server (stdio transport)
async function run() {
  const server = createMcpServer();
  registerMiscTools(server);
  registerTools(server, getClient, getAccessToken);

  // Register page-automation tools via REST API (graceful degradation on failure)
  const pageAutomationApiUrl =
    process.env.PAGE_AUTOMATION_API_URL || "https://api.webflow.com";
  const client = new PageAutomationClient(pageAutomationApiUrl);
  try {
    await registerPageAutomationTools(server, client, getAccessToken());
  } catch (err) {
    console.warn(
      "[page-automation] Failed to register tools — data API tools are still available.",
      err instanceof Error ? err.message : err,
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
