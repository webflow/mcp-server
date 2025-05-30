import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const createStyle = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a new style with specified properties
   * @param name Name for the new style
   * @param properties Array of property key-value pairs
   * @param siteId ID of the site to create the style in
   * @returns Promise resolving with style creation result
   */
  const createStyle = (
    name: string,
    properties: { key: string; value: string }[],
    siteId: string
  ) => {
    return rpc.callTool("createStyle", {
      name,
      properties,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createStyle",
      withCommonDesignerRules(
        "Create a new style." +
          "1. you can pass name as style name." +
          "2. if need to create new style for applying to element. create style with name as element id and properties as element styles. eg. name = style-123, properties = [{key:'color',value:'#000000',}, {key:'font-size',value:'16px'}] all css properties are supported. this tool is helpful to create new style for applying to element." +
          "3. if you want to attach variable as value, please pass value:'variable-:id' or example properties: [{key:'color',value:'variable-123456-123-123'}]"
      ),
      {
        name: z
          .string()
          .describe(
            "The name of the new style, for example 'Primary Color' or 'Font Size'"
          ),
        properties: z.array(
          z.object({
            key: z
              .string()
              .describe("The CSS property name"),
            value: z
              .string()
              .describe("The value for the property"),
          })
        ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the style in"
          ),
      },
      async ({ name, properties, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createStyle(name, properties, siteId)
            ),
          },
        ],
      })
    );
  }
  return createStyle;
};
