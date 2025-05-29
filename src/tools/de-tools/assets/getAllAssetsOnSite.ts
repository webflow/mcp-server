import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";
export const getAllAssetsOnSite = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all assets from the currently connected site
   * @param siteId ID of the site to get the assets from
   * @returns Promise resolving with assets data
   */
  const getAllAssetsOnSite = (siteId: string) => {
    return rpc.callTool("getAllAssetsOnSite", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllAssetsOnSite",
      withCommonDesignerRules(
        "Get all assets on the currently connected site."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the assets from"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllAssetsOnSite(siteId)
            ),
          },
        ],
      })
    );
  }
  return getAllAssetsOnSite;
};
