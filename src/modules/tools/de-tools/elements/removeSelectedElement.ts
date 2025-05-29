import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const removeSelectedElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Remove the currently selected element
   * @param siteId ID of the site to remove the element from
   * @returns Promise resolving with removal result
   */
  const removeSelectedElement = (siteId: string) => {
    return rpc.callTool("removeSelectedElement", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "removeSelectedElement",
      withCommonDesignerRules(
        "Remove selected element. always ask user consent before removing the element."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to remove the element from"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await removeSelectedElement(siteId)
            ),
          },
        ],
      })
    );
  }
  return removeSelectedElement;
};
