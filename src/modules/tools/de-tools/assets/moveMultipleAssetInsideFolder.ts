import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const moveMultipleAssetInsideFolder = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Move multiple assets to a specified folder
   * @param assetIds Array of asset IDs to move
   * @param folderId Destination folder ID
   * @param siteId ID of the site to move the assets in
   * @returns Promise resolving with move operation results
   */
  const moveMultipleAssetInsideFolder = (
    assetIds: string[],
    folderId: string,
    siteId: string
  ) => {
    return rpc.callTool("moveMultipleAssetInsideFolder", {
      assetIds,
      folderId,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "moveMultipleAssetInsideFolder",
      withCommonDesignerRules(
        "Move multiple asset inside folder."
      ),
      {
        assetIds: z
          .array(z.string())
          .describe("The IDs of the assets to move"),
        folderId: z
          .string()
          .describe(
            "The ID of the folder to move the assets to"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to move the assets in"
          ),
      },
      async ({ assetIds, folderId, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await moveMultipleAssetInsideFolder(
                assetIds,
                folderId,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return moveMultipleAssetInsideFolder;
};
