import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const getAssetById = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get information about a specific asset by ID
   * @param id Asset ID
   * @param siteId ID of the site to get the asset from
   * @returns Promise resolving with asset data
   */
  const getAssetById = (id: string, siteId: string) => {
    return rpc.callTool("getAssetById", { id, siteId });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAssetById",
      withCommonDesignerRules("Get asset by id."),
      {
        id: z
          .string()
          .describe("The ID of the asset to get"),
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the asset from"
          ),
      },
      async ({ id, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAssetById(id, siteId)
            ),
          },
        ],
      })
    );
  }
  return getAssetById;
};
