import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EnvWithOAuthProvider } from "../../../types/env";
import { MCPProps } from "../../../types/props";

export const initToolConfig = (
  server: McpServer,
  env: EnvWithOAuthProvider,
  props: MCPProps
) => {
  const getToolConfig = () => {
    const toolConfig = props.toolConfig;
    return { ...toolConfig };
  };
  server.tool(
    "get_tool_config",
    "Get the tool config for the Webflow MCP",
    {},
    async ({}, extra) => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(getToolConfig()),
          },
          {
            type: "text",
            text: "Note : to enable/disable tools, please revoke MCP access and request again with the tools you need.",
          },
        ],
      };
    }
  );
  return getToolConfig;
};
