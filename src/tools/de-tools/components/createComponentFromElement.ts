import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const createComponentFromElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a component from an existing element
   * @param componentName Name for the new component
   * @param component Component ID
   * @param element Element ID
   * @param siteId ID of the site to create the component in
   * @returns Promise resolving with component creation result
   */
  const createComponentFromElement = (
    componentName: string,
    component: string,
    element: string,
    siteId: string
  ) => {
    return rpc.callTool("createComponentFromElement", {
      name: componentName,
      component,
      element,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createComponentFromElement",
      withCommonDesignerRules(
        "Create component from element. you can pass componentName, component and element to create component from element. do not use duplicate component name. it will return error."
      ),
      {
        componentName: z
          .string()
          .describe("The name of the new component"),
        component: z
          .string()
          .describe(
            "The ID of the component to create, you can find it from id field on element. e.g id:{component:123,element:456}."
          ),
        element: z
          .string()
          .describe(
            "The ID of the element to create component from, you can find it from id field on element. e.g id:{component:123,element:456}."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the component in"
          ),
      },
      async ({
        componentName,
        component,
        element,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createComponentFromElement(
                componentName,
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
  return createComponentFromElement;
};
