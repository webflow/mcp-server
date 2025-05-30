import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const enterIntoComponentView = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Enter into component view mode for a specific component
   * @param component Component ID
   * @param element Element ID
   * @param siteId ID of the site to enter into component view on
   * @returns Promise resolving with component view entry result
   */
  const enterIntoComponentView = (
    component: string,
    element: string,
    siteId: string
  ) => {
    return rpc.callTool("enterIntoComponentView", {
      component,
      element,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "enterIntoComponentView",
      withCommonDesignerRules(
        "Enter into component view to edit/update component." +
          "1. Page may have components. with type ComponentInstance. make sure you are passing correct component and element id which is already present on page." +
          "2. this tool is helpful to Focus the Designer on a component definition in order to make changes." +
          "3. this tool will enter into component view to edit/update component. once you enter you can use getAllElementOnCurrentActivePage tool to get all elements on the component."
      ),
      {
        component: z
          .string()
          .describe(
            "The ID of the component to enter into component view, you can find it from id field on element. e.g id:{component:123,element:456}."
          ),
        element: z
          .string()
          .describe(
            "The ID of the element to enter into component view, you can find it from id field on element. e.g id:{component:123,element:456}."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to enter into component view"
          ),
      },
      async ({ component, element, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await enterIntoComponentView(
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
  return enterIntoComponentView;
};
