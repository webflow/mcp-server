import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const createAssetFolderOnSite = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a new asset folder on the site
   * @param name Name for the new folder
   * @param siteId ID of the site to create the asset folder on
   * @returns Promise resolving with folder creation result
   */
  const createAssetFolderOnSite = (
    name: string,
    siteId: string
  ) => {
    return rpc.callTool("createAssetFolderOnSite", {
      name,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createAssetFolderOnSite",
      withCommonDesignerRules(
        "Create asset folder on site."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the asset folder on"
          ),
        name: z
          .string()
          .describe(
            "The name of the asset folder to create"
          ),
      },
      async ({ name, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createAssetFolderOnSite(name, siteId)
            ),
          },
        ],
      })
    );
  }
  return createAssetFolderOnSite;
};
