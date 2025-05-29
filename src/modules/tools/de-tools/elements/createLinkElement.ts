import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { safeJsonParse } from "../../../../utils/jsonUtils.js";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";
export const createLinkElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a link element (Button or TextLink)
   * @param type Type of link element to create
   * @param insertType Where to insert relative to selection
   * @param autoSelectElementAfterCreation Whether to select the element after creation
   * @param styleIds Array of style IDs to apply
   * @param text Text content for the link
   * @param linkType Type of link (url, page, pageSection, email, phone, file, none)
   * @param linkData Link-specific data as a JSON string
   * @param siteId ID of the site to create the link element in
   * @returns Promise resolving with link element creation result
   */
  const createLinkElement = (
    type: "Button" | "TextLink" | "LinkBlock",
    insertType: "before" | "after" | "append" | "prepend",
    styleIds: string[],
    text: string,
    linkType:
      | "url"
      | "page"
      | "pageSection"
      | "email"
      | "phone"
      | "file"
      | "none",
    linkData: string | object,
    siteId: string
  ) => {
    return rpc.callTool("createLinkElement", {
      type,
      insertType,
      styleIds,
      text,
      linkType,
      linkData:
        typeof linkData === "string"
          ? safeJsonParse(linkData)
          : linkData,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createLinkElement",
      withCommonDesignerRules(
        "create link elements." +
          "1. while creating Button and TextLink it will be created with a default example text, if you pass empty string it will automatically generate a default text"
      ),
      {
        type: z
          .enum(["Button", "TextLink", "LinkBlock"])
          .describe(
            "The type of element to create, 'Button' or 'TextLink' or 'LinkBlock', TextLink will have default text, if you wanted to create empty link element then pass 'LinkBlock' for example card with link on it."
          ),
        styleIds: z
          .array(z.string())
          .describe(
            "The array of style ids to apply to the element. pass empty array to apply no styles."
          ),
        text: z
          .string()
          .describe(
            "The text content to be set on the element."
          ),
        insertType: z
          .enum(["before", "after", "append", "prepend"])
          .describe(
            "The position to insert the element relative to the selected element. 'before' | 'after' | 'append' | 'prepend'"
          ),
        linkType: z
          .enum([
            "url",
            "page",
            "pageSection",
            "email",
            "phone",
            "file",
            "none",
          ])
          .describe(
            "The type of link to create, 'url' | 'page' | 'pageSection' | 'email' | 'phone' | 'file' | 'none'"
          ),
        linkData: z
          .string()
          .describe(
            "linkData is a json object. but pass valid json as string format. here are the examples of for type url pass {'href':'https://example.com'}, for type page pass {'pageId':'webflow-page-id'}, for type pageSection pass {'component':'123',element:'123'} this if you wanted to scroll to element on page, for type email pass {'href':'example@example.com'}, for type phone pass {'href':'+1234567890'}, for type file pass {'assetId':'123'} this if you wanted to attach file, for type none pass 'null' as string. "
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the link element in"
          ),
      },
      async ({
        type,
        insertType,
        styleIds,
        text,
        linkType,
        linkData,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createLinkElement(
                type,
                insertType,
                styleIds,
                text,
                linkType,
                linkData,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return createLinkElement;
};
