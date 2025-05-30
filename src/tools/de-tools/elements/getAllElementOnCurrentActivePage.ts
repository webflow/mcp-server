import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";
export const getAllElementOnCurrentActivePage = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all elements on the currently active page
   * @param siteId ID of the site to get the elements for
   * @returns Promise resolving with elements data
   */
  const getAllElementOnCurrentActivePage = (
    siteId: string
  ) => {
    return rpc.callTool(
      "getAllElementOnCurrentActivePage",
      {
        siteId,
      }
    );
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllElementOnCurrentActivePage",
      withCommonDesignerRules(
        "Get all elements on the currently active page."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the elements for"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllElementOnCurrentActivePage(siteId)
            ),
          },
        ],
      })
    );
  }
  return getAllElementOnCurrentActivePage;
};
