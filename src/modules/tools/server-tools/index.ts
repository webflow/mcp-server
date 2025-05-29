import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { EnvWithOAuthProvider } from "../../../types/env";
import { MCPProps } from "../../../types/props";
import { initLogout } from "../../mcp/logout";
import { initToolConfig } from "../../mcp/tool-config";

export const initServerTools = (
  server: McpServer,
  env: EnvWithOAuthProvider,
  props: MCPProps
) => {
  //init logout
  initLogout(server, env, props);
  //init tool config
  initToolConfig(server, env, props);
};
