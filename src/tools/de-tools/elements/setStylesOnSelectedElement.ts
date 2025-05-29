import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const setStylesOnSelectedElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Apply styles to the currently selected element
   * @param styleIds Array of style IDs to apply
   * @param siteId ID of the site to apply the styles to
   * @returns Promise resolving with style application result
   */
  const setStylesOnSelectedElement = (
    styleIds: string[],
    siteId: string
  ) => {
    return rpc.callTool("setStylesOnSelectedElement", {
      styleIds,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "setStylesOnSelectedElement",
      withCommonDesignerRules(
        "Set styles on selected element. you can pass styleIds as array of style ids to apply styles to the element. pass empty array to apply no styles."
      ),
      {
        styleIds: z
          .array(z.string())
          .describe(
            "The array of style ids to apply to the element. pass empty array to apply no styles."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to apply the styles to"
          ),
      },
      async ({ styleIds, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await setStylesOnSelectedElement(
                styleIds,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return setStylesOnSelectedElement;
};
