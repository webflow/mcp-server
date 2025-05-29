import { WebflowClient } from "webflow-api";
import { registerCmsTools } from "./cms";
import { registerPagesTools } from "./pages";
import { registerScriptsTools } from "./scripts";
import { registerSiteTools } from "./sites";
import { registerAiChatTools } from "./aiChat";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolConfig } from "../../../utils/getToolConfig";

// Register tools
export function registerDataTools(
  server: McpServer,
  getClient: () => WebflowClient,
  toolConfig: ToolConfig
) {
  const { isCMSEnabled, isCustomCodeEnabled } = toolConfig;
  registerSiteTools(server, getClient);
  registerPagesTools(server, getClient);
  if (isCMSEnabled) {
    registerCmsTools(server, getClient);
  }

  if (isCustomCodeEnabled) {
    registerScriptsTools(server, getClient);
  }
}
