import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod/v3";
import { SiteIdSchema, DEElementIDSchema, DEElementSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export const registerDEElementTools = (server: McpServer, rpc: RPCType) => {
  const ElementSchemaValidator: z.ZodType = z.lazy(() =>
    DEElementSchema.extend({
      children: z.array(ElementSchemaValidator).optional(),
    }),
  );

  const elementBuilderRPCCall = async (siteId: string, actions: any) => {
    const actionsArray = actions || [];
    for (const action of actionsArray) {
      if (action.element_schema) {
        const result = ElementSchemaValidator.safeParse(action.element_schema);
        if (!result.success) {
          throw new Error(
            `Invalid element_schema: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
          );
        }
      }
    }
    return rpc.callTool("element_builder", {
      siteId,
      actions: actionsArray,
    });
  };

  const elementToolRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("element_tool", {
      siteId,
      actions: actions || [],
    });
  };

  const elementSnapshotToolRPCCall = async (
    siteId: string,
    action: any,
  ): Promise<
    | {
        status: string;
        message: string;
        data: null;
      }
    | {
        status: string;
        message: string;
        data: string;
      }
  > => {
    return rpc.callTool("element_snapshot_tool", {
      siteId,
      action: action || {},
    });
  };

  server.registerTool(
    "element_builder",
    {
      annotations: {
        openWorldHint: true,
        readOnlyHint: false,
      },
      description:
        "Designer Tool - Element builder to create element on current active page.",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z.object({
            build_label: z
              .string()
              .optional()
              .describe(
                "A label to identify this build action in the results.",
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
                "The id of the parent element to create element on, you can find it from id field on element. e.g id:{component:123,element:456}.",
              ),
            creation_position: z
              .enum(["append", "prepend", "before", "after"])
              .describe(
                "The position to create element on. append/prepend insert as child of the parent element. before/after insert as sibling adjacent to the target element.",
              ),
            element_schema: DEElementSchema.extend({
              children: z
                .array(z.any())
                .optional()
                .describe(
                  "Array of ElementSchema objects (same shape as element_schema with optional children)..",
                ),
            }).describe(
              "ElementSchema - element schema of element to create. Children are recursive ElementSchema objects.",
            ),
            return_element_info: z
              .boolean()
              .optional()
              .describe(
                "Whether to return full element info for the created element. Defaults to false.",
              ),
          }),
        ),
      },
    },
    async ({ actions, siteId }) => {
      try {
        return formatResponse(await elementBuilderRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );

  server.registerTool(
    "element_tool",
    {
      title: "Designer Element Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Designer Tool - Element tool to perform actions like get all elements, get selected element, select element on current active page. and more",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z
            .object({
              get_all_elements: z
                .boolean()
                .optional()
                .describe("Get all elements on the current active page"),

              get_selected_element: z
                .object({
                  children_depth: z
                    .number()
                    .min(-1)
                    .describe(
                      "The depth of children to include. 0 for no children. -1 for all children. X for X levels deep.",
                    ),
                })
                .optional()
                .describe("Get selected element on the current active page"),
              select_element: z
                .object({
                  ...DEElementIDSchema,
                })
                .optional()
                .describe("Select an element on the current active page"),
              remove_element: z
                .object({
                  ...DEElementIDSchema,
                })
                .optional()
                .describe(
                  "Remove an element from the current active page. DANGEROUS ACTION. USE WITH CAUTION.",
                ),
              add_or_update_attribute: z
                .object({
                  ...DEElementIDSchema,
                  attributes: z
                    .array(
                      z.object({
                        name: z
                          .string()
                          .describe(
                            "The name of the attribute to add or update.",
                          ),
                        value: z
                          .string()
                          .describe(
                            "The value of the attribute to add or update.",
                          ),
                      }),
                    )
                    .describe("The attributes to add or update."),
                })
                .optional()
                .describe("Add or update an attribute on the element"),
              remove_attribute: z
                .object({
                  ...DEElementIDSchema,
                  attribute_names: z
                    .array(z.string())
                    .describe("The names of the attributes to remove."),
                })
                .optional()
                .describe("Remove an attribute from the element"),
              update_id_attribute: z
                .object({
                  ...DEElementIDSchema,
                  new_id: z
                    .string()
                    .describe(
                      "The new #id of the element to update the id attribute to.",
                    ),
                })
                .optional()
                .describe("Update the #id attribute of the element"),
              set_text: z
                .object({
                  ...DEElementIDSchema,
                  text: z.string().describe("The text to set on the element."),
                })
                .optional()
                .describe("Set text on the element"),
              set_style: z
                .object({
                  ...DEElementIDSchema,
                  style_names: z
                    .array(z.string())
                    .describe("The style names to set on the element."),
                })
                .optional()
                .describe(
                  "Set style on the element. it will remove all other styles on the element. and set only the styles passed in style_names.",
                ),
              set_link: z
                .object({
                  ...DEElementIDSchema,
                  linkType: z
                    .enum(["url", "file", "page", "element", "email", "phone"])
                    .describe("The type of the link to update."),
                  link: z
                    .string()
                    .describe(
                      "The link to set on the element. for page pass page id, for element pass json string of id object. e.g id:{component:123,element:456}. for email pass email address. for phone pass phone number. for file pass asset id. for url pass url.",
                    ),
                })
                .optional()
                .describe("Set link on the element"),
              set_heading_level: z
                .object({
                  ...DEElementIDSchema,
                  heading_level: z
                    .number()
                    .min(1)
                    .max(6)
                    .describe(
                      "The heading level to set on the element. 1 to 6.",
                    ),
                })
                .optional()
                .describe("Set heading level on the heading element."),
              set_image_asset: z
                .object({
                  ...DEElementIDSchema,
                  image_asset_id: z
                    .string()
                    .describe("The image asset id to set on the element."),
                })
                .optional()
                .describe("Set image asset on the image element"),
              query_elements: z
                .object({
                  queries: z.array(
                    z.object({
                      label: z
                        .string()
                        .optional()
                        .describe(
                          "A label to identify this query in the results.",
                        ),
                      element_id: z
                        .object({
                          component: z.string(),
                          element: z.string(),
                        })
                        .optional()
                        .describe(
                          "Filter by element ID. Exact match. Bypasses other filters — returns the element directly.",
                        ),
                      element_filter: z
                        .object({
                          type: z
                            .string()
                            .optional()
                            .describe(
                              'Filter by element type. Exact match. e.g. "Heading", "Image", "Link", "Block", "DOM", "FormForm".',
                            ),
                          text: z
                            .string()
                            .optional()
                            .describe(
                              "Filter by text content. Case-insensitive substring match.",
                            ),
                          style: z
                            .string()
                            .optional()
                            .describe(
                              "Filter by style/class name. Case-insensitive substring match against any applied style name.",
                            ),
                          tag: z
                            .string()
                            .optional()
                            .describe(
                              'Filter by HTML tag. For Block/DOM elements. Case-insensitive exact match. e.g. "section", "nav", "div".',
                            ),
                          attribute_name: z
                            .string()
                            .optional()
                            .describe(
                              "Filter by attribute name. Case-insensitive exact match on attribute key.",
                            ),
                          attribute_value: z
                            .string()
                            .optional()
                            .describe(
                              "Filter by attribute value. Used with attribute_name. Case-insensitive substring match.",
                            ),
                        })
                        .optional()
                        .describe(
                          "Filter by element properties. Cannot be combined with component_filter.",
                        ),
                      component_filter: z
                        .object({
                          component_name: z
                            .string()
                            .optional()
                            .describe(
                              "Filter by component name. Case-insensitive substring match.",
                            ),
                          slot_name: z
                            .string()
                            .optional()
                            .describe(
                              "Filter by slot name. Case-insensitive substring match.",
                            ),
                        })
                        .optional()
                        .describe(
                          "Filter by component properties. Cannot be combined with element_filter.",
                        ),
                      scope_element_id: z
                        .object({
                          component: z.string(),
                          element: z.string(),
                        })
                        .optional()
                        .describe(
                          "Scope search to descendants of this element (element itself excluded).",
                        ),
                      return_parent: z
                        .enum(["parent", "ancestor"])
                        .optional()
                        .describe(
                          'Instead of returning matched elements, return their parent. "parent" = immediate parent. "ancestor" = any ancestor whose subtree contains matches.',
                        ),
                      children_depth: z
                        .number()
                        .optional()
                        .describe(
                          "Include N levels of children in each result. 0 = no children (default), -1 = all.",
                        ),
                      limit: z
                        .number()
                        .min(1)
                        .max(200)
                        .optional()
                        .describe(
                          "Max results for this query. Default: 50, Max: 200.",
                        ),
                    }),
                  ),
                })
                .optional()
                .describe(
                  "Query elements on the current active page. Supports filtering by type, text, style, tag, attributes, component name, slot name. Supports scoped search, parent lookup, and multiple queries per call.",
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.get_all_elements,
                  d.get_selected_element,
                  d.select_element,
                  d.add_or_update_attribute,
                  d.remove_attribute,
                  d.update_id_attribute,
                  d.set_text,
                  d.set_style,
                  d.set_link,
                  d.set_heading_level,
                  d.set_image_asset,
                  d.remove_element,
                  d.query_elements,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of get_all_elements, get_selected_element, select_element, add_or_update_attribute, remove_attribute, update_id_attribute, set_text, set_style, set_link, set_heading_level, set_image_asset, query_elements.",
              },
            ),
        ),
      },
    },
    async ({ actions, siteId }) => {
      try {
        return formatResponse(await elementToolRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );

  const whtmlBuilderRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("whtml_builder", {
      siteId,
      actions: actions || [],
    });
  };

  server.registerTool(
    "whtml_builder",
    {
      annotations: {
        openWorldHint: true,
        readOnlyHint: false,
      },
      description:
        "Designer Tool - WHTML builder to insert elements from HTML and CSS strings on the current active page. Accepts HTML markup and optional CSS rules, constructs WHTML, and inserts into a parent element.",
      inputSchema: {
        ...SiteIdSchema,
        actions: z
          .array(
            z.object({
              build_label: z
                .string()
                .describe(
                  "A label to identify this build action in the results.",
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
                  "The id of the parent element to insert WHTML into. e.g id:{component:123,element:456}.",
                ),
              creation_position: z
                .enum(["append", "prepend", "before", "after"])
                .describe(
                  "The position to insert the element. append/prepend insert as child of the parent element. before/after insert as sibling adjacent to the target element.",
                ),
              html: z
                .string()
                .min(1)
                .describe(
                  "HTML markup string to insert. Must not contain <style> tags. CSS should be provided via the css parameter instead.",
                ),
              css: z
                .string()
                .optional()
                .describe(
                  "Optional CSS rules to apply. Must not contain <style> tags. Provide raw CSS rules only (e.g. '.my-class { color: red; }').",
                ),
              get_children_info: z
                .boolean()
                .optional()
                .describe(
                  "Whether to return children info of the inserted element. Defaults to false.",
                ),
              children_depth: z
                .number()
                .optional()
                .describe(
                  "Depth of children to include when get_children_info is true. Defaults to 1.",
                ),
            }),
          )
          .min(1)
          .max(5),
      },
    },
    async ({ actions, siteId }) => {
      try {
        return formatResponse(await whtmlBuilderRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );

  server.registerTool(
    "element_snapshot_tool",
    {
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
      description:
        "Designer Tool - Element snapshot tool to perform actions like get element snapshot. helpful to get element snapshot for debugging and more and visual feedback.",
      inputSchema: {
        ...SiteIdSchema,
        action: z.object({
          id: DEElementIDSchema.id,
        }),
      },
    },
    async ({ action, siteId }) => {
      try {
        const { status, message, data } = await elementSnapshotToolRPCCall(
          siteId,
          action,
        );
        if (status === "success" && data) {
          return {
            content: [
              {
                type: "image",
                data: data.replace("data:image/png;base64,", ""),
                mimeType: "image/png",
              },
            ],
          };
        }
        return formatErrorResponse(
          new Error(
            message ||
            `Element snapshot failed with status: ${status}. Response: ${JSON.stringify({ status, message, data })}`
          )
        );
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
};
