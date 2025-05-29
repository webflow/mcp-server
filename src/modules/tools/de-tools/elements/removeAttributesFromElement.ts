import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const removeAttributesFromElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Remove attributes from the currently selected element
   * @param attributesNames Array of attribute names to remove
   * @param siteId ID of the site to remove the attributes from
   * @returns Promise resolving with attribute removal result
   */
  const removeAttributesFromElement = (
    attributesNames: string[],
    siteId: string
  ) => {
    return rpc.callTool("removeAttributesFromElement", {
      attributesNames,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "removeAttributesFromElement",
      withCommonDesignerRules(
        "Remove attributes from element."
      ),
      {
        attributesNames: z
          .array(z.string())
          .min(1)
          .describe(
            "The array of attribute names to remove from the element. for example if you wanted to remove data-id from element. pass ['data-id'] as array of string."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to remove the attributes from"
          ),
      },
      async ({ attributesNames, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await removeAttributesFromElement(
                attributesNames,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return removeAttributesFromElement;
};
