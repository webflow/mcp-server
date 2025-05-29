import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";
export const createTextElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a text element (Heading, TextBlock, or Paragraph)
   * @param siteId ID of the site to create the text element in
   * @param type Type of text element to create
   * @param insertType Where to insert relative to selection
   * @param autoSelectElementAfterCreation Whether to select the element after creation
   * @param styleIds Array of style IDs to apply
   * @param text Text content for the element
   * @param headingLevel Heading level (1-6) for Heading elements
   * @returns Promise resolving with text element creation result
   */
  const createTextElement = (
    siteId: string,
    type: "Heading" | "TextBlock" | "Paragraph",
    insertType: "before" | "after" | "append" | "prepend",
    styleIds: string[],
    text: string,
    headingLevel: number = 0
  ) => {
    return rpc.callTool("createTextElement", {
      type,
      insertType,
      autoSelectElementAfterCreation: false,
      styleIds,
      text,
      headingLevel,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createTextElement",
      withCommonDesignerRules("create text elements."),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the element in"
          ),
        type: z
          .enum(["Heading", "TextBlock", "Paragraph"])
          .describe(
            "The type of element to create, 'Heading', 'TextBlock', 'Paragraph'"
          ),
        text: z
          .string()
          .describe(
            "The text content to be set on the element."
          ),
        styleIds: z
          .array(z.string())
          .describe(
            "The array of style ids to apply to the element. pass empty array to apply no styles."
          ),
        headingLevel: z
          .number()
          .min(0)
          .max(6)
          .default(0)
          .describe(
            "The heading level for Heading elements, default is 0. 1 is for h1, 2 is for h2, 3 is for h3, 4 is for h4, 5 is for h5, 6 is for h6. if you are not creating heading element pass 0."
          ),
        insertType: z
          .enum(["before", "after", "append", "prepend"])
          .describe(
            "The position to insert the element relative to the selected element. 'before' | 'after' | 'append' | 'prepend'"
          ),
      },
      async ({
        siteId,
        type,
        insertType,

        styleIds,
        text,
        headingLevel,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createTextElement(
                siteId,
                type,
                insertType,
                styleIds,
                text,
                headingLevel
              )
            ),
          },
        ],
      })
    );
  }
  return createTextElement;
};
