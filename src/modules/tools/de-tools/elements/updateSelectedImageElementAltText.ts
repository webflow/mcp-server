import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const updateSelectedImageElementAltText = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update the alt text of the currently selected image element
   * @param altText New alt text
   * @param siteId ID of the site to update the alt text for
   * @returns Promise resolving with update result
   */
  const updateSelectedImageElementAltText = (
    altText: string,
    siteId: string
  ) => {
    return rpc.callTool(
      "updateSelectedImageElementAltText",
      {
        altText,
        siteId,
      }
    );
  };

  if (!skipToolRegistration) {
    server.tool(
      "updateSelectedImageElementAltText",
      withCommonDesignerRules(
        "Update selected image element alt text. you can pass altText to update the alt text on the selected element. make sure to select an image element first using selectElementOnCurrentActivePage."
      ),
      {
        altText: z
          .string()
          .describe(
            "The new alt text for the selected image element"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to update the alt text for"
          ),
      },
      async ({ altText, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updateSelectedImageElementAltText(
                altText,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return updateSelectedImageElementAltText;
};
