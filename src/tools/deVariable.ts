import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod";
import { SiteIdSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export function registerDEVariableTools(server: McpServer, rpc: RPCType) {
  const variableToolRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("variable_tool", {
      siteId,
      actions: actions || [],
    });
  };

  server.registerTool(
    "variable_tool",
    {
      title: "Designer Variable Tool",
      annotations: {
        readOnlyHint: false,
      },
      description:
        "Designer Tool - Variable tool to perform actions like create variable, get all variables, update variable",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z.object({
            create_variable_collection: z
              .object({
                name: z
                  .string()
                  .describe("The name of the variable collection to create"),
              })
              .optional()
              .describe("Create a new variable collection"),
            create_variable_mode: z
              .object({
                variable_collection_id: z
                  .string()
                  .describe(
                    "The id of the variable collection to create the variable mode in"
                  ),
                name: z
                  .string()
                  .describe("The name of the variable mode to create"),
              })
              .optional()
              .describe("Create a new variable mode in a variable collection"),
            get_variable_collections: z
              .object({
                query: z
                  .enum(["all", "filtered"])
                  .describe("The query to get all variable collections"),
                filter_collections_by_ids: z
                  .array(z.string())
                  .optional()
                  .describe("The ids of the variable collections to filter by"),
              })
              .optional()
              .describe("Get all variable collections and its modes"),
            get_variables: z
              .object({
                variable_collection_id: z
                  .string()
                  .describe(
                    "The id of the variable collection to get the variables from"
                  ),
                include_all_modes: z
                  .boolean()
                  .optional()
                  .describe("Whether to include all modes or not"),
                filter_variables_by_ids: z
                  .array(z.string())
                  .optional()
                  .describe("The ids of the variables to filter by"),
              })
              .optional()
              .describe(
                "Get all variables in a variable collection and its modes"
              ),
            create_color_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_name: z.string(),
                value: z.object({
                  static_value: z.string().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Create a new color variable"),
            create_size_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_name: z.string(),
                value: z.object({
                  static_value: z
                    .object({
                      value: z.number(),
                      unit: z.string(),
                    })
                    .optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Create a new size variable"),
            create_number_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_name: z.string(),
                value: z.object({
                  static_value: z.number().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Create a new number variable"),
            create_percentage_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_name: z.string(),
                value: z.object({
                  static_value: z.number().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Create a new percentage variable"),
            create_font_family_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_name: z.string(),
                value: z.object({
                  static_value: z.string().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Create a new font family variable"),
            update_color_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_id: z.string(),
                mode_id: z.string().optional(),
                value: z.object({
                  static_value: z.string().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Update a color variable"),
            update_size_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_id: z.string(),
                mode_id: z.string().optional(),
                value: z.object({
                  static_value: z
                    .object({
                      value: z.number(),
                      unit: z.string(),
                    })
                    .optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Update a size variable"),
            update_number_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_id: z.string(),
                mode_id: z.string().optional(),
                value: z.object({
                  static_value: z.number().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Update a number variable"),
            update_percentage_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_id: z.string(),
                mode_id: z.string().optional(),
                value: z.object({
                  static_value: z.number().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Update a percentage variable"),
            update_font_family_variable: z
              .object({
                variable_collection_id: z.string(),
                variable_id: z.string(),
                mode_id: z.string().optional(),
                value: z.object({
                  static_value: z.string().optional(),
                  existing_variable_id: z.string().optional(),
                }),
              })
              .optional()
              .describe("Update a font family variable"),
          })
        ),
      },
    },
    async ({ siteId, actions }) => {
      try {
        return formatResponse(await variableToolRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
