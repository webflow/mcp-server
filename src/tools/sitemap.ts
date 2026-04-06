import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";
import {
  type TextContent,
  apiRequest,
  buildQuery,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils";

// --- Handler functions ---

async function handleListItemsSitemapStatus(
  params: {
    collection_id: string;
    type?: "staged" | "live";
    cmsLocaleId?: string;
    limit?: number;
    offset?: number;
  },
  getToken: () => string
): Promise<TextContent> {
  const { collection_id, type, cmsLocaleId, limit, offset } = params;
  const liveSuffix = type === "live" ? "/live" : "";
  const query = buildQuery({ cmsLocaleId, limit, offset });
  return apiRequest(
    "GET",
    `/beta/sitemap/collections/${collection_id}/items${liveSuffix}${query}`,
    getToken
  );
}

async function handleGetItemSitemapStatus(
  params: {
    collection_id: string;
    item_id: string;
    type?: "staged" | "live";
    cmsLocaleId?: string;
  },
  getToken: () => string
): Promise<TextContent> {
  const { collection_id, item_id, type, cmsLocaleId } = params;
  const liveSuffix = type === "live" ? "/live" : "";
  const query = buildQuery({ cmsLocaleId });
  return apiRequest(
    "GET",
    `/beta/sitemap/collections/${collection_id}/items/${item_id}${liveSuffix}${query}`,
    getToken
  );
}

async function handleUpdateItemSitemapStatus(
  params: {
    collection_id: string;
    item_id: string;
    includeInSitemap: boolean;
    cmsLocaleId?: string;
  },
  getToken: () => string
): Promise<TextContent> {
  const { collection_id, item_id, includeInSitemap, cmsLocaleId } = params;
  const body: Record<string, unknown> = { includeInSitemap };
  if (cmsLocaleId) body.cmsLocaleId = cmsLocaleId;
  return apiRequest(
    "PATCH",
    `/beta/sitemap/collections/${collection_id}/items/${item_id}`,
    getToken,
    body
  );
}

async function handleBulkUpdateItemsSitemapStatus(
  params: {
    collection_id: string;
    items: Array<{
      id: string;
      includeInSitemap: boolean;
      cmsLocaleId?: string;
    }>;
  },
  getToken: () => string
): Promise<TextContent> {
  const { collection_id, items } = params;
  return apiRequest(
    "PATCH",
    `/beta/sitemap/collections/${collection_id}/items`,
    getToken,
    { items }
  );
}

async function handleGetPageSitemapStatus(
  params: {
    page_id: string;
    localeId?: string;
  },
  getToken: () => string
): Promise<TextContent> {
  const { page_id, localeId } = params;
  const query = buildQuery({ localeId });
  return apiRequest(
    "GET",
    `/beta/sitemap/pages/${page_id}${query}`,
    getToken
  );
}

async function handleUpdatePageSitemapStatus(
  params: {
    page_id: string;
    includeInSitemap: boolean;
    localeId?: string;
  },
  getToken: () => string
): Promise<TextContent> {
  const { page_id, includeInSitemap, localeId } = params;
  const query = buildQuery({ localeId });
  return apiRequest(
    "PATCH",
    `/beta/sitemap/pages/${page_id}${query}`,
    getToken,
    { includeInSitemap }
  );
}

async function handleListPagesSitemapStatus(
  params: {
    site_id: string;
    localeId?: string;
    limit?: number;
    offset?: number;
  },
  getToken: () => string
): Promise<TextContent> {
  const { site_id, localeId, limit, offset } = params;
  const query = buildQuery({ localeId, limit, offset });
  return apiRequest(
    "GET",
    `/beta/sites/${site_id}/sitemap/pages${query}`,
    getToken
  );
}

async function handleBulkUpdatePagesSitemapStatus(
  params: {
    site_id: string;
    localeId?: string;
    pages: Array<{
      id: string;
      includeInSitemap: boolean;
    }>;
  },
  getToken: () => string
): Promise<TextContent> {
  const { site_id, localeId, pages } = params;
  const query = buildQuery({ localeId });
  return apiRequest(
    "PATCH",
    `/beta/sites/${site_id}/sitemap/pages${query}`,
    getToken,
    { pages }
  );
}

export function registerSitemapTools(
  server: McpServer,
  getToken: () => string
) {
  server.registerTool(
    "data_sitemap_tool",
    {
      title: "Data Sitemap Indexing Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
      },
      description:
        "Data tool - Manage sitemap indexing status for CMS collection items and static pages. Read and update whether pages and collection items appear in a site's generated sitemap. All endpoints are under the /beta namespace. Folder pages, collection template pages, and utility pages are not supported for page endpoints.",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // 1. GET /beta/sitemap/collections/{collection_id}/items[/live]
              list_items_sitemap_status: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the CMS collection."),
                  type: z
                    .enum(["staged", "live"])
                    .optional()
                    .describe(
                      'Whether to list staged or live (published) items. Defaults to "staged".'
                    ),
                  cmsLocaleId: z
                    .string()
                    .optional()
                    .describe("Filter by CMS locale ID."),
                  limit: z
                    .number()
                    .optional()
                    .describe(
                      "Maximum number of items to return (max 100)."
                    ),
                  offset: z
                    .number()
                    .optional()
                    .describe("Number of items to skip for pagination."),
                })
                .optional()
                .describe(
                  "List sitemap indexing status for all items in a collection. Returns each item's ID, slug, name, and includeInSitemap flag with pagination."
                ),

              // 2. GET /beta/sitemap/collections/{collection_id}/items/{item_id}[/live]
              get_item_sitemap_status: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the CMS collection."),
                  item_id: z
                    .string()
                    .describe("Unique identifier for the collection item."),
                  type: z
                    .enum(["staged", "live"])
                    .optional()
                    .describe(
                      'Whether to get staged or live (published) status. Defaults to "staged".'
                    ),
                  cmsLocaleId: z
                    .string()
                    .optional()
                    .describe("Filter by CMS locale ID."),
                })
                .optional()
                .describe(
                  "Get sitemap indexing status for a single collection item."
                ),

              // 3. PATCH /beta/sitemap/collections/{collection_id}/items/{item_id}
              update_item_sitemap_status: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the CMS collection."),
                  item_id: z
                    .string()
                    .describe("Unique identifier for the collection item."),
                  includeInSitemap: z
                    .boolean()
                    .describe(
                      "Whether to include the item in the sitemap."
                    ),
                  cmsLocaleId: z
                    .string()
                    .optional()
                    .describe(
                      "Target a specific locale. Omit for primary locale."
                    ),
                })
                .optional()
                .describe(
                  "Update sitemap indexing status for a single collection item (staged). Publish the site afterward for changes to go live."
                ),

              // 4. PATCH /beta/sitemap/collections/{collection_id}/items
              bulk_update_items_sitemap_status: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the CMS collection."),
                  items: z
                    .array(
                      z.object({
                        id: z.string().describe("Collection item ID."),
                        includeInSitemap: z
                          .boolean()
                          .describe(
                            "Whether to include the item in the sitemap."
                          ),
                        cmsLocaleId: z
                          .string()
                          .optional()
                          .describe(
                            "Target a specific locale. Omit for primary locale."
                          ),
                      })
                    )
                    .max(100)
                    .describe(
                      "Array of items to update (max 100). Each must have an id and includeInSitemap."
                    ),
                })
                .optional()
                .describe(
                  "Bulk update sitemap indexing status for up to 100 collection items (staged). Publish the site afterward for changes to go live."
                ),

              // 5. GET /beta/sitemap/pages/{page_id}
              get_page_sitemap_status: z
                .object({
                  page_id: z
                    .string()
                    .describe("Unique identifier for the page."),
                  localeId: z
                    .string()
                    .optional()
                    .describe("Filter by locale ID."),
                })
                .optional()
                .describe(
                  "Get sitemap indexing status for a single static page. Does not work for folder pages, collection template pages, or utility pages."
                ),

              // 6. PATCH /beta/sitemap/pages/{page_id}
              update_page_sitemap_status: z
                .object({
                  page_id: z
                    .string()
                    .describe("Unique identifier for the page."),
                  includeInSitemap: z
                    .boolean()
                    .describe(
                      "Whether to include the page in the sitemap."
                    ),
                  localeId: z
                    .string()
                    .optional()
                    .describe("Target a specific locale's setting."),
                })
                .optional()
                .describe(
                  "Update sitemap indexing status for a single static page. Does not work for folder pages, collection template pages, or utility pages."
                ),

              // 7. GET /beta/sites/{site_id}/sitemap/pages
              list_pages_sitemap_status: z
                .object({
                  site_id: z
                    .string()
                    .describe(
                      "Unique identifier for the site. DO NOT ASSUME site id. ALWAYS ask user for site id if not already provided or known."
                    ),
                  localeId: z
                    .string()
                    .optional()
                    .describe("Return locale-specific indexing status."),
                  limit: z
                    .number()
                    .optional()
                    .describe(
                      "Maximum number of pages to return (max 100)."
                    ),
                  offset: z
                    .number()
                    .optional()
                    .describe("Number of pages to skip for pagination."),
                })
                .optional()
                .describe(
                  "List sitemap indexing status for all supported pages on a site. Excludes folder pages, collection template pages, and utility pages."
                ),

              // 8. PATCH /beta/sites/{site_id}/sitemap/pages
              bulk_update_pages_sitemap_status: z
                .object({
                  site_id: z
                    .string()
                    .describe(
                      "Unique identifier for the site. DO NOT ASSUME site id. ALWAYS ask user for site id if not already provided or known."
                    ),
                  localeId: z
                    .string()
                    .optional()
                    .describe("Applies to all pages in the batch."),
                  pages: z
                    .array(
                      z.object({
                        id: z.string().describe("Page ID."),
                        includeInSitemap: z
                          .boolean()
                          .describe(
                            "Whether to include the page in the sitemap."
                          ),
                      })
                    )
                    .max(100)
                    .describe(
                      "Array of pages to update (max 100). Each must have an id and includeInSitemap."
                    ),
                })
                .optional()
                .describe(
                  "Bulk update sitemap indexing status for up to 100 pages. Does not work for folder pages, collection template pages, or utility pages."
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.list_items_sitemap_status,
                  d.get_item_sitemap_status,
                  d.update_item_sitemap_status,
                  d.bulk_update_items_sitemap_status,
                  d.get_page_sitemap_status,
                  d.update_page_sitemap_status,
                  d.list_pages_sitemap_status,
                  d.bulk_update_pages_sitemap_status,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one sitemap indexing action: list_items_sitemap_status, get_item_sitemap_status, update_item_sitemap_status, bulk_update_items_sitemap_status, get_page_sitemap_status, update_page_sitemap_status, list_pages_sitemap_status, or bulk_update_pages_sitemap_status.",
              }
            )
        ),
      },
    },
    async ({ actions }) => {
      type ActionResult = {
        action: string;
        result: "pass" | "error";
        data?: unknown;
        error?: { name: string; message: string; status?: number };
      };

      const actionHandlers: Record<string, (params: any) => Promise<TextContent>> = {
        list_items_sitemap_status: (p) => handleListItemsSitemapStatus(p, getToken),
        get_item_sitemap_status: (p) => handleGetItemSitemapStatus(p, getToken),
        update_item_sitemap_status: (p) => handleUpdateItemSitemapStatus(p, getToken),
        bulk_update_items_sitemap_status: (p) => handleBulkUpdateItemsSitemapStatus(p, getToken),
        get_page_sitemap_status: (p) => handleGetPageSitemapStatus(p, getToken),
        update_page_sitemap_status: (p) => handleUpdatePageSitemapStatus(p, getToken),
        list_pages_sitemap_status: (p) => handleListPagesSitemapStatus(p, getToken),
        bulk_update_pages_sitemap_status: (p) => handleBulkUpdatePagesSitemapStatus(p, getToken),
      };

      const grouped: ActionResult[] = [];

      for (const action of actions) {
        for (const [label, handler] of Object.entries(actionHandlers)) {
          const params = (action as any)[label];
          if (!params) continue;

          try {
            const content = await handler(params);
            const data = JSON.parse(content.text);
            grouped.push({ action: label, result: "pass", data });
          } catch (error) {
            const err = error as any;
            grouped.push({
              action: label,
              result: "error",
              error: {
                name: err.name ?? "",
                message: err.message ?? "",
                ...(err.status ? { status: err.status } : {}),
              },
            });
          }
        }
      }

      if (grouped.length === 0) {
        return formatErrorResponse(
          new Error("No valid sitemap indexing action was provided.")
        );
      }

      return toolResponse([textContent(grouped)]);
    }
  );
}
