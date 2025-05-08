import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";
import { requestOptions } from "../mcp";

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
      const response = await getClient().pages.list(
        site_id,
        {
          localeId,
          limit,
          offset,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
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
      const response = await getClient().pages.getMetadata(
        page_id,
        {
          localeId,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // body: Webflow.Page
  const WebflowPageSchema = z.object({
    id: z.string().describe("Unique identifier for a Page."),
    siteId: z.string().optional().describe("Unique identifier for the Site."),
    title: z.string().optional().describe("Title of the page."),
    slug: z
      .string()
      .optional()
      .describe("Slug of the page (derived from title)."),
    parentId: z
      .string()
      .optional()
      .describe("Unique identifier for the parent folder."),
    collectionId: z
      .string()
      .optional()
      .describe(
        "Unique identifier for the linked collection, NULL id the Page is not part of a collection."
      ),
    createdOn: z.date().optional().describe("Date when the page was created."),
    lastUpdated: z
      .date()
      .optional()
      .describe("Date when the page was last updated."),
    archived: z
      .boolean()
      .optional()
      .describe("Indicates if the page is archived."),
    draft: z.boolean().optional().describe("Indicates if the page is a draft."),
    canBranch: z
      .boolean()
      .optional()
      .describe("Indicates if the page can be branched."),
    isBranch: z
      .boolean()
      .optional()
      .describe("Indicates if the page is Branch of another page."),
    isMembersOnly: z
      .boolean()
      .optional()
      .describe(
        "Indicates whether the Page is restricted by Memberships Controls."
      ),
    seo: z
      .object({
        title: z
          .string()
          .optional()
          .describe("The Page title shown in search engine results."),
        description: z
          .string()
          .optional()
          .describe("The Page description shown in search engine results."),
      })
      .optional()
      .describe("SEO-related fields for the page."),
    openGraph: z
      .object({
        title: z
          .string()
          .optional()
          .describe("The title supplied to Open Graph annotations."),
        titleCopied: z
          .boolean()
          .optional()
          .describe(
            "Indicates the Open Graph title was copied from the SEO title."
          ),
        description: z
          .string()
          .optional()
          .describe("The description supplied to Open Graph annotations."),
        descriptionCopied: z
          .boolean()
          .optional()
          .describe(
            "Indicates the Open Graph description was copied from the SEO description."
          ),
      })
      .optional(),
    localeId: z
      .string()
      .optional()
      .describe(
        "Unique identifier for the page locale. Applicable when using localization."
      ),
    publishedPath: z
      .string()
      .optional()
      .describe("Relative path of the published page."),
  });

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
      const response = await getClient().pages.updatePageSettings(
        page_id,
        {
          localeId,
          body,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
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
      const response = await getClient().pages.getContent(
        page_id,
        {
          localeId,
          limit,
          offset,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // nodes: Webflow.PageDomWriteNodesItem[]
  const WebflowPageDomWriteNodesItemSchema = z
    .union([
      z
        .object({
          nodeId: z.string().describe("Unique identifier for the node."),
          text: z
            .string()
            .describe(
              "HTML content of the node, including the HTML tag. The HTML tags must be the same as what’s returned from the Get Content endpoint."
            ),
        })
        .describe("Text node to be updated."),
      z
        .object({
          nodeId: z.string().describe("Unique identifier for the node."),
          propertyOverrides: z.array(
            z
              .object({
                propertyId: z
                  .string()
                  .describe("Unique identifier for the property."),
                text: z
                  .string()
                  .describe(
                    "Value used to override a component property; must be type-compatible to prevent errors."
                  ),
              })
              .describe(
                "Properties to override for this locale’s component instances."
              )
          ),
        })
        .describe("Update text property overrides of a component instance."),
    ])
    .array();

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
      const response = await getClient().pages.updateStaticContent(
        page_id,
        {
          localeId,
          nodes,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );
}
