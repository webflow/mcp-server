import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";

import {
  formatErrorResponse,
  formatResponse,
} from "../utils/formatResponse";
export function registerLocalDeMCPConnectionTools(
  server: McpServer,
  rpc: RPCType
) {
  const localDeMCPConnectionToolRPCCall = async () => {
    return rpc.callTool("local_de_mcp_connection_tool", {});
  };

  server.tool(
    "get_designer_app_connection_info",
    "Get Webflow MCP App Connection Info. if user ask to get Webflow MCP app connection info, use this tool",
    {},
    async () => {
      try {
        return formatResponse(
          await localDeMCPConnectionToolRPCCall()
        );
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
