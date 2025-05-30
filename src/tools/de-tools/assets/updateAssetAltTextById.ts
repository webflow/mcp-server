import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const updateAssetAltTextById = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update the alt text of an asset
   * @param id Asset ID
   * @param altText New alt text for the asset
   * @param siteId ID of the site to update the asset for
   * @returns Promise resolving with update result
   */
  const updateAssetAltTextById = (
    id: string,
    altText: string,
    siteId: string
  ) => {
    return rpc.callTool("updateAssetAltTextById", {
      id,
      altText,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "updateAssetAltTextById",
      withCommonDesignerRules(
        "Update asset alt text by id. this is helpful to update asset alt text by id."
      ),
      {
        id: z
          .string()
          .describe("The ID of the asset to update"),
        altText: z
          .string()
          .describe("The new alt text for the asset"),
        siteId: z
          .string()
          .describe(
            "The ID of the site to update the asset in"
          ),
      },
      async ({ id, altText, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updateAssetAltTextById(
                id,
                altText,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return updateAssetAltTextById;
};
