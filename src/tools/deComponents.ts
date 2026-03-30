import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod/v3";
import {
  DEElementIDSchema,
  SiteIdSchema,
} from "../schemas";
import {
  formatErrorResponse,
  formatResponse,
} from "../utils";

/**
 * ComponentSchema - Defines a component to insert with optional nested slot children.
 * The `slots.children` field accepts any valid ComponentSchema JSON objects.
 * Validation of nested children is performed server-side.
 */
const ComponentSchema = z.object({
  name: z
    .string()
    .describe("The name of the component to insert."),
  slots: z
    .array(
      z.object({
        name: z.string().describe("The name of the slot."),
        children: z
          .array(z.any())
          .describe(
            "Array of ComponentSchema objects (same shape: { name, slots? }).",
          ),
      }),
    )
    .optional()
    .describe("Slots to populate with child components."),
});

export function registerDEComponentsTools(
  server: McpServer,
  rpc: RPCType,
) {
  const componentsToolRPCCall = async (
    siteId: string,
    actions: any,
  ) => {
    return rpc.callTool("component_tool", {
      siteId,
      actions: actions || [],
    });
  };

  const ComponentSchemaValidator: z.ZodType = z.lazy(() =>
    z.object({
      name: z.string().min(1),
      slots: z
        .array(
          z.object({
            name: z.string().min(1),
            children: z.array(ComponentSchemaValidator),
          }),
        )
        .optional(),
    }),
  );

  const componentBuilderRPCCall = async (
    siteId: string,
    actions: any,
  ) => {
    const actionsArray = actions || [];
    for (const action of actionsArray) {
      if (action.component_schema) {
        const result =
          ComponentSchemaValidator.safeParse(
            action.component_schema,
          );
        if (!result.success) {
          throw new Error(
            `Invalid component_schema in action "${action.build_label}": ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
          );
        }
      }
    }
    return rpc.callTool("component_builder", {
      siteId,
      actions: actionsArray,
    });
  };

  server.registerTool(
    "de_component_tool",
    {
      title: "Designer Component Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Designer tool - Component tool to perform actions like create component instances, get all components and more.",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z
            .object({
              check_if_inside_component_view: z
                .boolean()
                .optional()
                .describe(
                  "Check if inside component view. this helpful to make changes to the component",
                ),
              transform_element_to_component: z
                .object({
                  ...DEElementIDSchema,
                  name: z
                    .string()
                    .describe("The name of the component"),
                  group: z
                    .string()
                    .optional()
                    .describe("Optional group/category for the component"),
                  description: z
                    .string()
                    .optional()
                    .describe("Optional description for the component"),
                })
                .optional()
                .describe(
                  "Transform an element to a component",
                ),
              insert_component_instance: z
                .object({
                  parent_element_id: DEElementIDSchema.id,
                  component_id: z
                    .string()
                    .describe(
                      "The id of the component to insert",
                    ),
                  creation_position: z
                    .enum(["append", "prepend"])
                    .describe(
                      "The position to create component instance on. append to the end of the parent element or prepend to the beginning of the parent element. as child of the parent element.",
                    ),
                })
                .optional()
                .describe(
                  "Insert a component on current active page.",
                ),
              open_component_view: z
                .object({
                  component_instance_id:
                    DEElementIDSchema.id,
                })
                .optional()
                .describe(
                  "Open a component instance view for changes or reading.",
                ),
              close_component_view: z
                .boolean()
                .optional()
                .describe(
                  "Close a component instance view. it will close and open the page view.",
                ),
              get_all_components: z
                .boolean()
                .optional()
                .describe(
                  "Get all components, only valid if you are connected to Webflow Designer.",
                ),
              get_component: z
                .object({
                  component_id: z
                    .string()
                    .optional()
                    .describe("The id of the component to get. Use this or name."),
                  name: z
                    .string()
                    .optional()
                    .describe("The name of the component. Use this or component_id."),
                  group: z
                    .string()
                    .optional()
                    .describe("Optional group to narrow the search when using name"),
                })
                .optional()
                .describe(
                  "Get a component by ID or by name. Provide component_id for ID lookup, or name (and optional group) for name lookup.",
                ),
              get_component_metadata: z
                .object({
                  component_id: z
                    .string()
                    .describe("The id of the component"),
                })
                .optional()
                .describe(
                  "Get the metadata (name, group, description) of a component",
                ),
              set_component_metadata: z
                .object({
                  component_id: z
                    .string()
                    .describe("The id of the component"),
                  name: z
                    .string()
                    .optional()
                    .describe("New name for the component"),
                  group: z
                    .string()
                    .optional()
                    .describe("New group for the component"),
                  description: z
                    .string()
                    .optional()
                    .describe("New description for the component"),
                })
                .optional()
                .describe(
                  "Update metadata (name, group, description) of a component",
                ),
              rename_component: z
                .object({
                  component_id: z
                    .string()
                    .describe(
                      "The id of the component to rename",
                    ),
                  new_name: z
                    .string()
                    .describe("The name of the component"),
                })
                .optional()
                .describe("Rename a component."),
              unregister_component: z
                .object({
                  component_id: z
                    .string()
                    .describe(
                      "The id of the component to unregister",
                    ),
                })
                .optional()
                .describe(
                  "Unregister a component. DANGEROUS ACTION. USE WITH CAUTION.",
                ),
              create_blank_component: z
                .object({
                  name: z
                    .string()
                    .describe("The name of the blank component to create"),
                  group: z
                    .string()
                    .optional()
                    .describe("Optional group/folder to place the component in"),
                  description: z
                    .string()
                    .optional()
                    .describe("Optional description for the component"),
                })
                .optional()
                .describe(
                  "Create a blank component with no root element. Equivalent to 'Create blank' in the Designer's New Component menu.",
                ),
              open_component_canvas: z
                .object({
                  component_id: z
                    .string()
                    .optional()
                    .describe("The id of the component to open in the canvas. Use this or component_instance_id."),
                  component_instance_id: z
                    .object({
                      component: z
                        .string()
                        .describe("The component id of the instance element."),
                      element: z
                        .string()
                        .describe("The element id of the instance element."),
                    })
                    .optional()
                    .describe("The element ID of a component instance to open in the canvas. Use this or component_id."),
                })
                .optional()
                .describe(
                  "Open a component's canvas directly by component ID or component instance element ID.",
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.check_if_inside_component_view,
                  d.transform_element_to_component,
                  d.insert_component_instance,
                  d.open_component_view,
                  d.close_component_view,
                  d.get_all_components,
                  d.get_component,
                  d.get_component_metadata,
                  d.set_component_metadata,
                  d.rename_component,
                  d.unregister_component,
                  d.create_blank_component,
                  d.open_component_canvas,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of check_if_inside_component_view, transform_element_to_component, insert_component_instance, open_component_view, close_component_view, get_all_components, get_component, get_component_metadata, set_component_metadata, rename_component, unregister_component, create_blank_component, open_component_canvas.",
              },
            ),
        ),
      },
    },
    async ({ siteId, actions }) => {
      try {
        return formatResponse(
          await componentsToolRPCCall(siteId, actions),
        );
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );

  server.registerTool(
    "component_builder",
    {
      annotations: {
        openWorldHint: true,
        readOnlyHint: false,
      },
      description:
        "Designer Tool - Component builder to insert component instances on the current active page. Supports inserting into an element (as a child) or into a component instance's slot. Use insert_in_element to add a component inside a container/div/section. Use insert_in_slot to add a component inside a specific slot of an existing component instance.",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z.object({
            build_label: z
              .string()
              .describe(
                "A label to identify this build action.",
              ),
            action_type: z
              .enum(["insert_in_element", "insert_in_slot"])
              .describe(
                "The type of insertion. insert_in_element: insert component as child of parent_element_id. insert_in_slot: insert component into a slot of a component instance identified by parent_element_id.",
              ),
            parent_element_id: z
              .object({
                component: z
                  .string()
                  .describe(
                    "The component id of the element to perform action on.",
                  ),
                element: z
                  .string()
                  .describe(
                    "The element id of the element to perform action on.",
                  ),
              })
              .describe(
                "The id of the parent element (for insert_in_element) or the component instance (for insert_in_slot). e.g id:{component:123,element:456}.",
              ),
            creation_position: z
              .enum(["append", "prepend"])
              .describe(
                "The position to insert the component. append to the end or prepend to the beginning.",
              ),
            component_schema: ComponentSchema.describe(
              "The component schema to insert. Use name to specify which component, and optionally slots to populate child components in the instance's slots.",
            ),
            slot_name: z
              .string()
              .optional()
              .describe(
                "The slot name to insert the component into. Required when action_type is insert_in_slot.",
              ),
            return_component_info: z
              .boolean()
              .optional()
              .describe(
                "Whether to return the component instance info after insertion.",
              ),
          }),
        ),
      },
    },
    async ({ actions, siteId }) => {
      try {
        return formatResponse(
          await componentBuilderRPCCall(siteId, actions),
        );
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
