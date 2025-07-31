import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod";
import {
  DEElementIDSchema,
  SiteIdSchema,
} from "../schemas";
import {
  formatErrorResponse,
  formatResponse,
} from "../utils";

export function registerDEComponentsTools(
  server: McpServer,
  rpc: RPCType
) {
  const componentsToolRPCCall = async (
    siteId: string,
    actions: any
  ) => {
    return rpc.callTool("component_tool", {
      siteId,
      actions: actions || [],
    });
  };

  server.tool(
    "de_component_tool",
    "Designer tool - Component tool to perform actions like create component instances, get all components and more.",
    {
      ...SiteIdSchema,
      actions: z.array(
        z.object({
          check_if_inside_component_view: z
            .boolean()
            .optional()
            .describe(
              "Check if inside component view. this helpful to make changes to the component"
            ),
          transform_element_to_component: z
            .object({
              ...DEElementIDSchema,
              name: z
                .string()
                .describe("The name of the component"),
            })
            .optional()
            .describe(
              "Transform an element to a component"
            ),
          insert_component_instance: z
            .object({
              parent_element_id: DEElementIDSchema.id,
              component_id: z
                .string()
                .describe(
                  "The id of the component to insert"
                ),
              creation_position: z
                .enum(["append", "prepend"])
                .describe(
                  "The position to create component instance on. append to the end of the parent element or prepend to the beginning of the parent element. as child of the parent element."
                ),
            })
            .optional()
            .describe(
              "Insert a component on current active page."
            ),
          open_component_view: z
            .object({
              component_instance_id: DEElementIDSchema.id,
            })
            .optional()
            .describe(
              "Open a component instance view for changes or reading."
            ),
          close_component_view: z
            .boolean()
            .optional()
            .describe(
              "Close a component instance view. it will close and open the page view."
            ),
          get_all_components: z
            .boolean()
            .optional()
            .describe(
              "Get all components, only valid if you are connected to Webflow Designer."
            ),
          rename_component: z
            .object({
              component_id: z
                .string()
                .describe(
                  "The id of the component to rename"
                ),
              new_name: z
                .string()
                .describe("The name of the component"),
            })
            .optional()
            .describe("Rename a component."),
        })
      ),
    },
    async ({ siteId, actions }) => {
      try {
        return formatResponse(
          await componentsToolRPCCall(siteId, actions)
        );
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
