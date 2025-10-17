import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";
import { requestOptions } from "../mcp";
import {
  WebflowPageDomWriteNodesItemSchema,
  WebflowPageSchema,
} from "../schemas";
import {
  type Content,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils";

export function registerPagesTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const listPages = async (arg: {
    site_id: string;
    localeId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await getClient().pages.list(
      arg.site_id,
      {
        localeId: arg.localeId,
        limit: arg.limit,
        offset: arg.offset,
      },
      requestOptions
    );
    return response;
  };

  const getPageMetadata = async (arg: {
    page_id: string;
    localeId?: string;
  }) => {
    const response = await getClient().pages.getMetadata(
      arg.page_id,
      {
        localeId: arg.localeId,
      },
      requestOptions
    );
    return response;
  };

  const updatePageSettings = async (arg: {
    page_id: string;
    localeId?: string;
    body: any;
  }) => {
    const response = await getClient().pages.updatePageSettings(
      arg.page_id,
      {
        localeId: arg.localeId,
        body: arg.body,
      },
      requestOptions
    );
    return response;
  };

  const getPageContent = async (arg: {
    page_id: string;
    localeId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await getClient().pages.getContent(
      arg.page_id,
      {
        localeId: arg.localeId,
        limit: arg.limit,
        offset: arg.offset,
      },
      requestOptions
    );
    return response;
  };

  const updateStaticContent = async (arg: {
    page_id: string;
    localeId: string;
    nodes: any;
  }) => {
    const response = await getClient().pages.updateStaticContent(
      arg.page_id,
      {
        localeId: arg.localeId,
        nodes: arg.nodes,
      },
      requestOptions
    );
    return response;
  };

  server.tool(
    "data_pages_tool",
    "Data tool - Pages tool to perform actions like list pages, get page metadata, update page settings, get page content, and update static content",
    {
      actions: z.array(
        z.object({
          // GET https://api.webflow.com/v2/sites/:site_id/pages
          list_pages: z
            .object({
              site_id: z
                .string()
                .describe("The site's unique ID, used to list its pages."),
              localeId: z
                .string()
                .optional()
                .describe(
                  "Unique identifier for a specific locale. Applicable when using localization."
                ),
              limit: z
                .number()
                .optional()
                .describe(
                  "Maximum number of records to be returned (max limit: 100)"
                ),
              offset: z
                .number()
                .optional()
                .describe(
                  "Offset used for pagination if the results have more than limit records."
                ),
            })
            .optional()
            .describe(
              "List all pages within a site. Returns page metadata including IDs, titles, and slugs."
            ),
          // GET https://api.webflow.com/v2/pages/:page_id
          get_page_metadata: z
            .object({
              page_id: z.string().describe("Unique identifier for the page."),
              localeId: z
                .string()
                .optional()
                .describe(
                  "Unique identifier for a specific locale. Applicable when using localization."
                ),
            })
            .optional()
            .describe(
              "Get metadata for a specific page including SEO settings, Open Graph data, and page status (draft/published)."
            ),
          // PUT https://api.webflow.com/v2/pages/:page_id
          update_page_settings: z
            .object({
              page_id: z.string().describe("Unique identifier for the page."),
              localeId: z
                .string()
                .optional()
                .describe(
                  "Unique identifier for a specific locale. Applicable when using localization."
                ),
              body: WebflowPageSchema,
            })
            .optional()
            .describe(
              "Update page settings including SEO metadata, Open Graph data, slug, and publishing status."
            ),
          // GET https://api.webflow.com/v2/pages/:page_id/dom
          get_page_content: z
            .object({
              page_id: z.string().describe("Unique identifier for the page."),
              localeId: z
                .string()
                .optional()
                .describe(
                  "Unique identifier for a specific locale. Applicable when using localization."
                ),
              limit: z
                .number()
                .optional()
                .describe(
                  "Maximum number of records to be returned (max limit: 100)"
                ),
              offset: z
                .number()
                .optional()
                .describe(
                  "Offset used for pagination if the results have more than limit records."
                ),
            })
            .optional()
            .describe(
              "Get the content structure and data for a specific page including all elements and their properties for localization."
            ),
          // POST https://api.webflow.com/v2/pages/:page_id/dom
          update_static_content: z
            .object({
              page_id: z.string().describe("Unique identifier for the page."),
              localeId: z
                .string()
                .describe(
                  "Unique identifier for a specific locale. Applicable when using localization."
                ),
              nodes: WebflowPageDomWriteNodesItemSchema,
            })
            .optional()
            .describe(
              "Update content on a static page in secondary locales by modifying text nodes and property overrides."
            ),
        })
      ),
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_pages) {
            const content = await listPages(action.list_pages);
            result.push(textContent(content));
          }
          if (action.get_page_metadata) {
            const content = await getPageMetadata(action.get_page_metadata);
            result.push(textContent(content));
          }
          if (action.update_page_settings) {
            const content = await updatePageSettings(
              action.update_page_settings
            );
            result.push(textContent(content));
          }
          if (action.get_page_content) {
            const content = await getPageContent(action.get_page_content);
            result.push(textContent(content));
          }
          if (action.update_static_content) {
            const content = await updateStaticContent(
              action.update_static_content
            );
            result.push(textContent(content));
          }
        }
        return toolResponse(result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
