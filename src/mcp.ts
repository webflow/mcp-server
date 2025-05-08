import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import {
  registerCmsTools,
  registerPagesTools,
  registerScriptsTools,
  registerSiteTools,
} from "./tools";

const packageJson = require("../package.json") as any;

// Create an MCP server
export function createMcpServer() {
  return new McpServer({
    name: packageJson.name,
    version: packageJson.version,
  });
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
  registerCmsTools(server, getClient);
  registerPagesTools(server, getClient);
  registerScriptsTools(server, getClient);
  registerSiteTools(server, getClient);
}
