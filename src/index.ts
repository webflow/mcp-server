#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebflowClient } from "webflow-api";
import {
  createMcpServer,
  registerDesignerTools,
  registerLocalTools,
  registerMiscTools,
  registerTools,
} from "./mcp";
import { initDesignerAppBridge } from "./modules/designerAppBridge";

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
  const { callTool } = await initDesignerAppBridge({ getClient });
  registerMiscTools(server);
  registerTools(server, getClient, getAccessToken);
  registerDesignerTools(server, {
    callTool,
    getClient,
    getAccessToken,
  });

  //Only valid for OSS MCP Version.
  registerLocalTools(server, {
    callTool,
    getClient,
    getAccessToken,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
