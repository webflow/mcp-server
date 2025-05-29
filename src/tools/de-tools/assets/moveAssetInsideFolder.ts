import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const moveAssetInsideFolder = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Move an asset to a specified folder
   * @param assetId Asset ID to move
   * @param folderId Destination folder ID
   * @param siteId ID of the site to move the asset in
   * @returns Promise resolving with move operation result
   */
  const moveAssetInsideFolder = (
    assetId: string,
    folderId: string,
    siteId: string
  ) => {
    return rpc.callTool("moveAssetInsideFolder", {
      assetId,
      folderId,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "moveAssetInsideFolder",
      withCommonDesignerRules(
        "Move asset inside folder. this is helpful to move asset inside folder."
      ),
      {
        assetId: z
          .string()
          .describe("The ID of the asset to move"),
        folderId: z
          .string()
          .describe(
            "The ID of the folder to move the asset to"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to move the asset in"
          ),
      },
      async ({ assetId, folderId, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await moveAssetInsideFolder(
                assetId,
                folderId,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return moveAssetInsideFolder;
};
