import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const createDomElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a DOM element with specified attributes
   * @param tag HTML tag name for the element
   * @param insertType Where to insert relative to selection ('before', 'after', 'append', 'prepend')
   * @param styleIds Array of style IDs to apply
   * @param autoSelectElementAfterCreation Whether to select the element after creation
   * @param siteId ID of the site to create the element in
   * @returns Promise resolving with element creation result
   */
  const createDomElement = (
    tag: string,
    insertType: "before" | "after" | "append" | "prepend",
    styleIds: string[],
    autoSelectElementAfterCreation: boolean,
    siteId: string
  ) => {
    return rpc.callTool("createDomElement", {
      tag,
      insertType,
      styleIds,
      autoSelectElementAfterCreation,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createDomElement",
      withCommonDesignerRules("Create DOM element."),
      {
        tag: z.string().describe("The HTML tag to create"),
        insertType: z
          .enum(["before", "after", "append", "prepend"])
          .describe(
            "The position to insert the element relative to the selected element. 'before' | 'after' | 'append' | 'prepend'"
          ),
        styleIds: z
          .array(z.string())
          .describe(
            "The array of style ids to apply to the element. pass empty array to apply no styles."
          ),
        autoSelectElementAfterCreation: z
          .boolean()
          .describe(
            "Whether to select the element after creation, remember this will be new cursor position, any future DOM manipulation will be done with respect to this new cursor position"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the element in"
          ),
      },
      async ({
        tag,
        insertType,
        autoSelectElementAfterCreation,
        styleIds,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createDomElement(
                tag,
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
  return createDomElement;
};
