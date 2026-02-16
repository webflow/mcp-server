import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod/v3";
import { SiteIdSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export function registerDEPagesTools(server: McpServer, rpc: RPCType) {
  const pageToolRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("page_tool", {
      siteId,
      actions: actions || [],
    });
  };

  server.registerTool(
    "de_page_tool",
    {
      title: "Designer Page Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Designer Tool - Page tool to perform actions like create page, create page folder, get current page, switch page",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z
            .object({
              create_page: z
                .object({
                  page_name: z
                    .string()
                    .describe("The name of the page to create"),
                  meta_title: z
                    .string()
                    .describe("The meta title of the page to create"),
                  meta_description: z
                    .string()
                    .optional()
                    .describe("The meta description of the page to create"),
                  page_parent_folder_id: z
                    .string()
                    .optional()
                    .describe(
                      "The id of the parent page folder to create the page in"
                    ),
                })
                .optional()
                .describe("Create new page"),
              create_page_folder: z
                .object({
                  page_folder_name: z
                    .string()
                    .describe("The name of the page folder to create"),
                  page_folder_parent_id: z
                    .string()
                    .optional()
                    .describe(
                      "The id of the parent page folder to create the page folder in"
                    ),
                })
                .optional()
                .describe("Create new page folder"),

              get_current_page: z
                .boolean()
                .optional()
                .describe("Get current page active on webflow designer"),
              switch_page: z
                .object({
                  page_id: z
                    .string()
                    .describe("The id of the page to switch to"),
                })
                .optional()
                .describe("Switch to a page on webflow designer"),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.create_page,
                  d.create_page_folder,
                  d.get_current_page,
                  d.switch_page,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of create_page, create_page_folder, get_current_page, switch_page.",
              }
            )
        ),
      },
    },
    async ({ siteId, actions }) => {
      try {
        return formatResponse(await pageToolRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
