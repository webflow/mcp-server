import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const renameComponentName = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Rename a component
   * @param componentId Component ID
   * @param newName New name for the component
   * @param siteId ID of the site to rename the component in
   * @returns Promise resolving with rename operation result
   */
  const renameComponentName = (
    componentId: string,
    newName: string,
    siteId: string
  ) => {
    return rpc.callTool("renameComponentName", {
      componentId,
      newName,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "renameComponentName",
      withCommonDesignerRules("Rename component name."),
      {
        componentId: z
          .string()
          .describe(
            "The ID of the component to rename, you can find it from id field on element."
          ),
        newName: z
          .string()
          .describe(
            "The new name for the component, you can pass newName to rename the component name."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to rename the component in"
          ),
      },
      async ({ componentId, newName, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await renameComponentName(
                componentId,
                newName,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return renameComponentName;
};
