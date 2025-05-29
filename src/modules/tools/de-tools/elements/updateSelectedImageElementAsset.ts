import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const updateSelectedImageElementAsset = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update the asset of the currently selected image element
   * @param assetId New asset ID
   * @param siteId ID of the site to update the asset for
   * @returns Promise resolving with update result
   */
  const updateSelectedImageElementAsset = (
    assetId: string,
    siteId: string
  ) => {
    return rpc.callTool("updateSelectedImageElementAsset", {
      assetId,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "updateSelectedImageElementAsset",
      withCommonDesignerRules(
        "Update selected image element asset. you can pass assetId to update the image asset on the selected element. make sure to select an image element first using selectElementOnCurrentActivePage. this tool will return the updated element info."
      ),
      {
        assetId: z
          .string()
          .describe(
            "The ID of the new asset to set on the selected image element"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to update the asset for"
          ),
      },
      async ({ assetId, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updateSelectedImageElementAsset(
                assetId,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return updateSelectedImageElementAsset;
};
