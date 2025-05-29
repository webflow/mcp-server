import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const selectElementOnCurrentActivePage = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Select an element on the current active page
   * @param component Component ID
   * @param element Element ID
   * @param siteId ID of the site to select the element on
   * @returns Promise resolving with element selection result
   */
  const selectElementOnCurrentActivePage = (
    component: string,
    element: string,
    siteId: string
  ) => {
    return rpc.callTool(
      "selectElementOnCurrentActivePage",
      {
        component,
        element,
        siteId,
      }
    );
  };

  if (!skipToolRegistration) {
    server.tool(
      "selectElementOnCurrentActivePage",
      withCommonDesignerRules(
        "select element on current active page. you can find component and element ids from id field on element. e.g id:{component:123,element:456}."
      ),
      {
        component: z
          .string()
          .describe(
            "The component id of the element to select, you can find it from id field on element. e.g id:{component:123,element:456}."
          ),
        element: z
          .string()
          .describe(
            "The element id of the element to select, you can find it from id field on element. e.g id:{component:123,element:456}."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to select the element on"
          ),
      },
      async ({ component, element, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await selectElementOnCurrentActivePage(
                component,
                element,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return selectElementOnCurrentActivePage;
};
