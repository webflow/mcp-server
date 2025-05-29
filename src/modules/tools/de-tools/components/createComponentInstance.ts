import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const createComponentInstance = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create an instance of a component
   * @param componentId Component definition ID
   * @param insertType Where to insert relative to selection
   * @param autoSelectElementAfterCreation Whether to select the element after creation
   * @param siteId ID of the site to create the component instance in
   * @returns Promise resolving with component instance creation result
   */
  const createComponentInstance = (
    componentId: string,
    insertType: string,
    autoSelectElementAfterCreation: boolean,
    siteId: string
  ) => {
    return rpc.callTool("createComponentInstance", {
      componentId,
      insertType,
      autoSelectElementAfterCreation,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createComponentInstance",
      withCommonDesignerRules(
        "Create component instance. you can pass componentId, insertType and autoSelectElementAfterCreation to create component instance. please refer componentId from component definition."
      ),
      {
        componentId: z
          .string()
          .describe(
            "The ID of the component to create instance, you can find it from id field on element. e.g id:{component:123,element:456}."
          ),
        insertType: z.enum([
          "before",
          "after",
          "append",
          "prepend",
        ]),
        autoSelectElementAfterCreation: z
          .boolean()
          .describe(
            "Whether to select the element after creation, remember this will be new cursor position, any future DOM manipulation will be done with respect to this new cursor position"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the component instance in"
          ),
      },
      async ({
        componentId,
        insertType,
        autoSelectElementAfterCreation,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createComponentInstance(
                componentId,
                insertType,
                autoSelectElementAfterCreation,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return createComponentInstance;
};
