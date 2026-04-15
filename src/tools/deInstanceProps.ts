import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod/v3";
import { DEElementIDSchema, SiteIdSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export function registerDEInstancePropsTools(server: McpServer, rpc: RPCType) {
  const instancePropsToolRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("instance_props_tool", {
      siteId,
      actions: actions || [],
    });
  };

  server.registerTool(
    "instance_props_tool",
    {
      title: "Designer Instance Props Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Designer tool - Get, search, and set component instance properties (props). Use this to read prop values, search props by value type, and set static values or data bindings on component instances.",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z
            .object({
              get_instance_props: z
                .object({
                  ...DEElementIDSchema,
                })
                .optional()
                .describe(
                  "Get a quick summary of all props on a component instance. Returns propId, value, and hasOverride for each prop.",
                ),
              search_instance_props: z
                .object({
                  ...DEElementIDSchema,
                  value_type: z
                    .enum([
                      "string",
                      "textContent",
                      "richText",
                      "boolean",
                      "color",
                      "date",
                      "link",
                      "url",
                      "email",
                      "phone",
                      "file",
                      "videoUrl",
                      "video",
                      "image",
                      "imageAsset",
                      "cmsImage",
                      "imageSet",
                      "number",
                      "enum",
                      "option",
                      "slot",
                      "reference",
                      "referenceSet",
                      "variant",
                      "variableMode",
                      "filter",
                      "sort",
                      "selectedItems",
                      "visibility",
                      "booleanFilter",
                      "altText",
                      "id",
                    ])
                    .optional()
                    .describe(
                      "Optional filter to only return props of a specific value type.",
                    ),
                })
                .optional()
                .describe(
                  "Search instance props with full detail including display labels, binding metadata, and resolved values. Optionally filter by value type.",
                ),
              set_instance_props: z
                .object({
                  ...DEElementIDSchema,
                  props: z
                    .array(
                      z.object({
                        propId: z.string().describe("The prop ID to set."),
                        value: z
                          .any()
                          .describe(
                            "The value to set. Can be a static value (string, number, boolean, null to reset), or a binding object ({ sourceType: 'cms', collectionId, fieldId } or { sourceType: 'prop', propId } or { sourceType: 'page', fieldKey }).",
                          ),
                      }),
                    )
                    .describe(
                      "Array of prop entries to set on the component instance.",
                    ),
                })
                .optional()
                .describe(
                  "Set property values on a component instance. Supports static values, data bindings, and resetting overrides (value: null).",
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.get_instance_props,
                  d.search_instance_props,
                  d.set_instance_props,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of get_instance_props, search_instance_props, set_instance_props.",
              },
            ),
        ),
      },
    },
    async ({ siteId, actions }) => {
      try {
        return formatResponse(await instancePropsToolRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
