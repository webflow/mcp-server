import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EnvWithOAuthProvider } from "../../../types/env";
import { MCPProps } from "../../../types/props";

export const initLogout = (
  server: McpServer,
  env: EnvWithOAuthProvider,
  props: MCPProps
) => {
  const logout = async () => {
    const grants = await env.OAUTH_KV.list({
      prefix: `grant:${props.user.id}`,
    });

    const tokens = await env.OAUTH_KV.list({
      prefix: `token:${props.user.id}`,
    });

    if (grants.keys.length > 0) {
      for (const grant of grants.keys) {
        await env.OAUTH_KV.delete(grant.name);
      }
    }
    if (tokens.keys.length > 0) {
      for (const token of tokens.keys) {
        await env.OAUTH_KV.delete(token.name);
      }
    }
  };
  server.tool(
    "revoke_webflow_mcp_access",
    "Revoke access to Webflow MCP server, always ask user before calling this tool",
    {},
    async ({}, extra) => {
      await logout();
      return {
        content: [
          {
            type: "text",
            text: "You are logged out from Webflow MCP server. please refersh MCP from your IDE MCP settings.",
          },
        ],
      };
    }
  );

  return logout;
};
