import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const updateAssetNameById = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update the name of an asset
   * @param id Asset ID
   * @param name New name for the asset
   * @param siteId ID of the site to update the asset name for
   * @returns Promise resolving with update result
   */
  const updateAssetNameById = (
    id: string,
    name: string,
    siteId: string
  ) => {
    return rpc.callTool("updateAssetNameById", {
      id,
      name,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "updateAssetNameById",
      withCommonDesignerRules(
        "Update asset name by id. this is helpful to update asset name by id."
      ),
      {
        id: z
          .string()
          .describe("The ID of the asset to update"),
        name: z
          .string()
          .describe("The new name for the asset"),
        siteId: z
          .string()
          .describe(
            "The ID of the site to update the asset in"
          ),
      },
      async ({ id, name, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updateAssetNameById(id, name, siteId)
            ),
          },
        ],
      })
    );
  }
  return updateAssetNameById;
};
