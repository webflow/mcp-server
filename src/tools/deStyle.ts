import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod/v3";
import { SiteIdSchema } from "../schemas";
import { formatErrorResponse, formatResponse, supportDEStyles } from "../utils";

export function registerDEStyleTools(server: McpServer, rpc: RPCType) {
  const styleToolRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("style_tool", {
      siteId,
      actions: actions || [],
    });
  };

  server.registerTool(
    "style_tool",
    {
      title: "Designer Style Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Designer Tool - Style tool to perform actions like create style, get all styles, update styles",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z.object({
            create_style: z
              .object({
                name: z.string().describe("The name of the style"),
                properties: z
                  .array(
                    z.object({
                      property_name: z
                        .string()
                        .describe("The name of the property"),
                      property_value: z
                        .string()
                        .optional()
                        .describe("The value of the property"),
                      variable_as_value: z
                        .string()
                        .optional()
                        .describe("The variable id to use as the value"),
                    })
                  )
                  .describe(
                    "The properties of the style. if you are looking to link a variable as the value, then use the variable_as_value field. but do not use both property_value and variable_as_value"
                  ),
                parent_style_name: z
                  .string()
                  .optional()
                  .describe(
                    "The name of the parent style to create the new style in. this will use to create combo class"
                  ),
              })
              .optional()
              .describe("Create a new style"),
            get_styles: z
              .object({
                skip_properties: z
                  .boolean()
                  .optional()
                  .describe(
                    "Whether to skip the properties of the style. to get minimal data."
                  ),
                include_all_breakpoints: z
                  .boolean()
                  .optional()
                  .describe(
                    "Whether to include all breakpoints styles or not. very data intensive."
                  ),
                query: z
                  .enum(["all", "filtered"])
                  .describe("The query to get all styles or filtered styles"),
                filter_ids: z
                  .array(z.string())
                  .optional()
                  .describe(
                    "The ids of the styles to filter by. should be used with query filtered"
                  ),
              })
              .optional()
              .describe("Get all styles"),
            update_style: z
              .object({
                style_name: z
                  .string()
                  .describe("The name of the style to update"),
                breakpoint_id: z
                  .enum([
                    "xxl",
                    "xl",
                    "large",
                    "main",
                    "medium",
                    "small",
                    "tiny",
                  ])
                  .optional()
                  .describe("The breakpoint to update the style for"),
                pseudo: z
                  .enum([
                    "noPseudo",
                    "nth-child(odd)",
                    "nth-child(even)",
                    "first-child",
                    "last-child",
                    "hover",
                    "active",
                    "pressed",
                    "visited",
                    "focus",
                    "focus-visible",
                    "focus-within",
                    "placeholder",
                    "empty",
                    "before",
                    "after",
                  ])
                  .optional()
                  .describe("The pseudo class to update the style for"),
                properties: z
                  .array(
                    z.object({
                      property_name: z
                        .string()
                        .describe("The name of the property"),
                      property_value: z
                        .string()
                        .optional()
                        .describe("The value of the property"),
                      variable_as_value: z
                        .string()
                        .optional()
                        .describe("The variable id to use as the value"),
                    })
                  )
                  .optional()
                  .describe("The properties to update or add to the style for"),
                remove_properties: z
                  .array(z.string())
                  .optional()
                  .describe("The properties to remove from the style"),
              })
              .optional()
              .describe("Update a style"),
          })
        ),
      },
    },
    async ({ siteId, actions }) => {
      try {
        return formatResponse(await styleToolRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "de_learn_more_about_styles",
    {
      title: "Designer Learn More About Webflow Styles",
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
      description:
        "Designer tool - Learn more about styles supported by Webflow Designer." +
        "Please do not use any other styles which is not supported by Webflow Designer." +
        "Please use the long-form alias of a CSS property when managing styles. For example, the property row-gap has a long-form alias of grid-row-gap, margin has long-form alias of margin-top, margin-right, margin-bottom, margin-left, etc.",
      inputSchema: {},
    },
    async ({}) => formatResponse(supportDEStyles)
  );
}
