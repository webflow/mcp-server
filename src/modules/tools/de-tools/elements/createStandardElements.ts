import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const createStandardElements = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a standard element (BlockContainer, DivBlock, or Section)
   * @param type Type of standard element to create
   * @param insertType Where to insert relative to selection
   * @param autoSelectElementAfterCreation Whether to select the element after creation
   * @param styleIds Array of style IDs to apply
   * @param siteId ID of the site to create the element in
   * @returns Promise resolving with standard element creation result
   */
  const createStandardElements = (
    type: "BlockContainer" | "DivBlock" | "Section",
    insertType: "before" | "after" | "append" | "prepend",
    autoSelectElementAfterCreation: boolean,
    styleIds: string[],
    siteId: string
  ) => {
    return rpc.callTool("createStandardElement", {
      type,
      insertType,
      autoSelectElementAfterCreation,
      styleIds,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createStandardElement",
      withCommonDesignerRules("create standard element."),
      {
        type: z
          .enum(["BlockContainer", "DivBlock", "Section"])
          .describe(
            "The type of element to create, 'BlockContainer', 'DivBlock', 'Section'"
          ),
        styleIds: z
          .array(z.string())
          .describe(
            "The array of style ids to apply to the element. pass empty array to apply no styles."
          ),
        insertType: z
          .enum(["before", "after", "append", "prepend"])
          .describe(
            "The position to insert the element relative to the selected element. 'before' | 'after' | 'append' | 'prepend'"
          ),
        autoSelectElementAfterCreation: z
          .boolean()
          .describe(
            "Whether to select the element after creation, remember this will be new cursor position, any future DOM manipulation will be done with respect to this new cursor position "
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the element in"
          ),
      },
      async ({
        type,
        insertType,
        autoSelectElementAfterCreation,
        styleIds,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createStandardElements(
                type,
                insertType,
                autoSelectElementAfterCreation,
                styleIds,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return createStandardElements;
};
