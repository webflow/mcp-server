import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";
export const getAllAssetFoldersOnSite = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all asset folders from the site
   * @param siteId ID of the site to get the asset folders from
   * @returns Promise resolving with folders data
   */
  const getAllAssetFoldersOnSite = (siteId: string) => {
    return rpc.callTool("getAllAssetFoldersOnSite", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllAssetFoldersOnSite",
      withCommonDesignerRules(
        "Get all asset folders on site."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the asset folders from"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllAssetFoldersOnSite(siteId)
            ),
          },
        ],
      })
    );
  }
  return getAllAssetFoldersOnSite;
};
