import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const createImageElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create an image element with a specified asset
   * @param assetId Asset ID for the image
   * @param insertType Where to insert relative to selection
   * @param styleIds Array of style IDs to apply
   * @param autoSelectElementAfterCreation Whether to select the element after creation
   * @param siteId ID of the site to create the image element in
   * @returns Promise resolving with image element creation result
   */
  const createImageElement = (
    assetId: string,
    insertType: "before" | "after" | "append" | "prepend",
    styleIds: string[],
    autoSelectElementAfterCreation: boolean,
    siteId: string
  ) => {
    return rpc.callTool("createImageElement", {
      assetId,
      insertType,
      styleIds,
      autoSelectElementAfterCreation,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createImageElement",
      withCommonDesignerRules("Create image element."),
      {
        assetId: z
          .string()
          .describe("The asset id of the image to create"),
        insertType: z
          .enum(["before", "after", "append", "prepend"])
          .describe(
            "The position to insert the element relative to the selected element. 'before' | 'after' | 'append' | 'prepend'"
          ),
        autoSelectElementAfterCreation: z
          .boolean()
          .describe(
            "Whether to select the element after creation, remember this will be new cursor position, any future DOM manipulation will be done with respect to this new cursor position"
          ),
        styleIds: z
          .array(z.string())
          .describe(
            "The array of style ids to apply to the element. pass empty array to apply no styles."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the element in"
          ),
      },
      async ({
        assetId,
        insertType,
        autoSelectElementAfterCreation,
        styleIds,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createImageElement(
                assetId,
                insertType,
                styleIds,
                autoSelectElementAfterCreation,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return createImageElement;
};
