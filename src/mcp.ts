import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import {
  registerDataTools,
  registerDesignerTools,
} from "./tools";
import { initDesignerAppBridge } from "./designerAppBridge";
import { ToolConfig } from "./utils/getToolConfig";

const packageJson = require("../package.json") as any;

// Create an MCP server
export function createMcpServer() {
  return new McpServer(
    {
      name: packageJson.name,
      version: packageJson.version,
    },
    {
      instructions: `These tools give you access to the Webflow's Data And Designer API. If you are ever unsure about anything Webflow API-related, use the "ask_webflow_ai" tool.`,
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
export async function registerTools(
  server: McpServer,
  getClient: () => WebflowClient,
  toolConfig: ToolConfig
) {
  const rpc = await initDesignerAppBridge();
  registerDataTools(server, getClient, toolConfig);
  registerDesignerTools(server, rpc, toolConfig);
}
