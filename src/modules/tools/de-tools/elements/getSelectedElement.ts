import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const getSelectedElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get the currently selected element in Webflow Designer
   * @param siteId ID of the site to get the selected element for
   * @returns Promise resolving with selected element data
   */
  const getSelectedElement = (siteId: string) => {
    return rpc.callTool("getSelectedElement", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getSelectedElement",
      withCommonDesignerRules(
        "Get the selected element on current active page. user may use different terms like selected element, selected component, selected element on page, etc."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the selected element for"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getSelectedElement(siteId)
            ),
          },
        ],
      })
    );
  }
  return getSelectedElement;
};
