import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const updateStyleById = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update a style's properties by ID
   * @param styleId Style ID to update
   * @param properties Array of property key-value pairs to add/update
   * @param propertiesToRemove Array of property keys to remove
   * @param siteId ID of the site to update the style in
   * @returns Promise resolving with style update result
   */
  const updateStyleById = (
    styleId: string,
    properties: { key: string; value: string }[],
    propertiesToRemove: string[],
    siteId: string
  ) => {
    return rpc.callTool("updateStyleById", {
      styleId,
      properties,
      propertiesToRemove,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "updateStyleById",
      withCommonDesignerRules(
        "Update style by id." +
          "1. you can pass propertiesToRemove as array of property keys to remove from the style. pass empty array to apply no propertiesToRemove. when you pass propertiesToRemove, it will remove the properties from the style first and then add the new properties." +
          "2. if you want to attach variable as value, please pass value:'variable-:id' or example properties: [{key:'color',value:'variable-123456-123-123'}]"
      ),
      {
        styleId: z
          .string()
          .describe("The ID of the style to update"),
        properties: z.array(
          z.object({
            key: z
              .string()
              .describe("The CSS property name"),
            value: z
              .string()
              .describe(
                "The value for the property, for example '#RRGGBB' for color type, '{ unit: 'px', value: 50 }' for size type, 50 for number type, or 'Verdana' for font-family type"
              ),
          })
        ),
        propertiesToRemove: z
          .array(z.string())
          .describe(
            "The array of property keys to remove from the style. pass empty array to apply no propertiesToRemove."
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to update the style in"
          ),
      },
      async ({
        styleId,
        properties,
        propertiesToRemove,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updateStyleById(
                styleId,
                properties,
                propertiesToRemove,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return updateStyleById;
};
