import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";
import { requestOptions } from "../mcp";
import {
  WebflowPageDomWriteNodesItemSchema,
  WebflowPageSchema,
} from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export function registerPagesTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  // GET https://api.webflow.com/v2/sites/:site_id/pages
  server.tool(
    "pages_list",
    "List all pages within a site. Returns page metadata including IDs, titles, and slugs.",
    {
      site_id: z
        .string()
        .describe("The site’s unique ID, used to list its pages."),
      localeId: z
        .string()
        .optional()
        .describe(
          "Unique identifier for a specific locale. Applicable when using localization."
        ),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of records to be returned (max limit: 100)"),
      offset: z
        .number()
        .optional()
        .describe(
          "Offset used for pagination if the results have more than limit records."
        ),
    },
    async ({ site_id, localeId, limit, offset }) => {
      try {
        const response = await getClient().pages.list(
          site_id,
          {
            localeId,
            limit,
            offset,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET https://api.webflow.com/v2/pages/:page_id
  server.tool(
    "pages_get_metadata",
    "Get metadata for a specific page including SEO settings, Open Graph data, and page status (draft/published).",
    {
      page_id: z.string().describe("Unique identifier for the page."),
      localeId: z
        .string()
        .optional()
        .describe(
          "Unique identifier for a specific locale. Applicable when using localization."
        ),
    },
    async ({ page_id, localeId }) => {
      try {
        const response = await getClient().pages.getMetadata(
          page_id,
          {
            localeId,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // PUT https://api.webflow.com/v2/pages/:page_id
  server.tool(
    "pages_update_page_settings",
    "Update page settings including SEO metadata, Open Graph data, slug, and publishing status.",
    {
      page_id: z.string().describe("Unique identifier for the page."),
      localeId: z
        .string()
        .optional()
        .describe(
          "Unique identifier for a specific locale. Applicable when using localization."
        ),
      body: WebflowPageSchema,
    },
    async ({ page_id, localeId, body }) => {
      try {
        const response = await getClient().pages.updatePageSettings(
          page_id,
          {
            localeId,
            body,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET https://api.webflow.com/v2/pages/:page_id/dom
  server.tool(
    "pages_get_content",
    "Get the content structure and data for a specific page including all elements and their properties.",
    {
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
        .describe("Maximum number of records to be returned (max limit: 100)"),
      offset: z
        .number()
        .optional()
        .describe(
          "Offset used for pagination if the results have more than limit records."
        ),
    },
    async ({ page_id, localeId, limit, offset }) => {
      try {
        const response = await getClient().pages.getContent(
          page_id,
          {
            localeId,
            limit,
            offset,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/pages/:page_id/dom
  server.tool(
    "pages_update_static_content",
    "Update content on a static page in secondary locales by modifying text nodes and property overrides.",
    {
      page_id: z.string().describe("Unique identifier for the page."),
      localeId: z
        .string()
        .describe(
          "Unique identifier for a specific locale. Applicable when using localization."
        ),
      nodes: WebflowPageDomWriteNodesItemSchema,
    },
    async ({ page_id, localeId, nodes }) => {
      try {
        const response = await getClient().pages.updateStaticContent(
          page_id,
          {
            localeId,
            nodes,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
