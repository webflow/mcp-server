import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";
export const getDefaultVariableCollection = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get the default variable collection
   * @param siteId ID of the site to get the default variable collection from
   * @returns Promise resolving with default variable collection data
   */
  const getDefaultVariableCollection = (siteId: string) => {
    return rpc.callTool("getDefaultVariableCollection", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getDefaultVariableCollection",
      withCommonDesignerRules(
        "Get the default variable collection on the site."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the default variable collection from"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getDefaultVariableCollection(siteId)
            ),
          },
        ],
      })
    );
  }
  return getDefaultVariableCollection;
};
