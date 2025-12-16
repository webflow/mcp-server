import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod";
import { SiteIdSchema, DEElementIDSchema, DEElementSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export const registerDEElementTools = (server: McpServer, rpc: RPCType) => {
  const elementBuilderRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("element_builder", {
      siteId,
      actions: actions || [],
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
    action: any
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
      description:
        "Designer Tool - Element builder to create element on current active page. only create elements upto max 3 levels deep. divide your elements into smaller elements to create complex structures. recall this tool to create more elements. but max level is upto 3 levels. you can have as many children as you want. but max level is 3 levels.",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z.object({
            parent_element_id: z
              .object({
                component: z
                  .string()
                  .describe(
                    "The component id of the element to perform action on."
                  ),
                element: z
                  .string()
                  .describe(
                    "The element id of the element to perform action on."
                  ),
              })
              .describe(
                "The id of the parent element to create element on, you can find it from id field on element. e.g id:{component:123,element:456}."
              ),
            creation_position: z
              .enum(["append", "prepend"])
              .describe(
                "The position to create element on. append to the end of the parent element or prepend to the beginning of the parent element. as child of the parent element."
              ),
            element_schema: DEElementSchema.extend({
              children: z
                .array(
                  DEElementSchema.extend({
                    children: z
                      .array(
                        DEElementSchema.extend({
                          children: z
                            .array(
                              DEElementSchema.extend({
                                children: z.array(DEElementSchema).optional(),
                              })
                            )
                            .optional(),
                        })
                      )
                      .optional(),
                  })
                )
                .optional()
                .describe(
                  "The children of the element. only valid for container, section, div block, valid DOM elements."
                ),
            }).describe("element schema of element to create."),
          })
        ),
      },
    },
    async ({ actions, siteId }) => {
      try {
        return formatResponse(await elementBuilderRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "element_tool",
    {
      title: "Designer Element Tool",
      annotations: {
        readOnlyHint: false,
      },
      description:
        "Designer Tool - Element tool to perform actions like get all elements, get selected element, select element on current active page. and more",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z.object({
            get_all_elements: z
              .object({
                query: z.enum(["all"]).describe("Query to get all elements"),
                include_style_properties: z
                  .boolean()
                  .optional()
                  .describe("Include style properties"),
                include_all_breakpoint_styles: z
                  .boolean()
                  .optional()
                  .describe("Include all breakpoints styles"),
              })
              .optional()
              .describe("Get all elements on the current active page"),
            get_selected_element: z
              .boolean()
              .optional()
              .describe("Get selected element on the current active page"),
            select_element: z
              .object({
                ...DEElementIDSchema,
              })
              .optional()
              .describe("Select an element on the current active page"),
            add_or_update_attribute: z
              .object({
                ...DEElementIDSchema,
                attributes: z
                  .array(
                    z.object({
                      name: z
                        .string()
                        .describe(
                          "The name of the attribute to add or update."
                        ),
                      value: z
                        .string()
                        .describe(
                          "The value of the attribute to add or update."
                        ),
                    })
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
                    "The new #id of the element to update the id attribute to."
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
                "Set style on the element. it will remove all other styles on the element. and set only the styles passed in style_names."
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
                    "The link to set on the element. for page pass page id, for element pass json string of id object. e.g id:{component:123,element:456}. for email pass email address. for phone pass phone number. for file pass asset id. for url pass url."
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
                  .describe("The heading level to set on the element. 1 to 6."),
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
          })
        ),
      },
    },
    async ({ actions, siteId }) => {
      try {
        return formatResponse(await elementToolRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
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
          action
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
        return formatErrorResponse(new Error(message));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
};
