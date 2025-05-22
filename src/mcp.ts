import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import {
  registerAiChatTools,
  registerCmsTools,
  registerComponentsTools,
  registerPagesTools,
  registerScriptsTools,
  registerSiteTools,
} from "./tools";

const packageJson = require("../package.json") as any;

// Create an MCP server
export function createMcpServer() {
  return new McpServer(
    {
      name: packageJson.name,
      version: packageJson.version,
    },
    {
      instructions: `These tools give you access to the Webflow's Data API. If you are ever unsure about anything Webflow API-related, use the "ask_webflow_ai" tool.`,
    }
  );
}

// Common request options, including User-Agent header
export const requestOptions = {
  headers: {
    "User-Agent": `Webflow MCP Server/${packageJson.version}`,
  },
};

// Register tools
export function registerTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  registerAiChatTools(server);
  registerCmsTools(server, getClient);
  registerComponentsTools(server, getClient);
  registerPagesTools(server, getClient);
  registerScriptsTools(server, getClient);
  registerSiteTools(server, getClient);
}
