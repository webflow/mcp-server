import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";
export const getAllStylesOnSite = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all styles defined in the site
   * @param siteId ID of the site to get the styles from
   * @returns Promise resolving with styles data
   */
  const getAllStylesOnSite = (siteId: string) => {
    return rpc.callTool("getAllStylesOnSite", { siteId });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllStylesOnSite",
      withCommonDesignerRules(
        "Get all styles on the currently connected webflow site."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the styles from"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllStylesOnSite(siteId)
            ),
          },
        ],
      })
    );
  }
  return getAllStylesOnSite;
};
