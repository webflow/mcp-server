import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";
export const getAllVariableCollections = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all variable collections from the site
   * @param siteId ID of the site to get the variable collections from
   * @returns Promise resolving with variable collections data
   */
  const getAllVariableCollections = (siteId: string) => {
    return rpc.callTool("getAllVariableCollections", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllVariableCollections",
      withCommonDesignerRules(
        "Get all variable collections on the site."
      ),
      {
        siteId: z.string(),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllVariableCollections(siteId)
            ),
          },
        ],
      })
    );
  }
  return getAllVariableCollections;
};
