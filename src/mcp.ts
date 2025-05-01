#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";

const packageJson = require("../package.json") as any;

// Create an MCP server
export function createMcpServer() {
  return new McpServer({
    name: packageJson.name,
    version: packageJson.version,
  });
}

// Common request options, including User-Agent header
const requestOptions = {
  headers: {
    "User-Agent": `Webflow MCP Server/${packageJson.version}`,
  },
};

// Register tools
export function registerTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  // -- SITES --

  // GET https://api.webflow.com/v2/sites
  server.tool(
    "sites_list",
    "List all sites accessible to the authenticated user. Returns basic site information including site ID, name, and last published date.",
    async () => {
      const response = await getClient().sites.list(requestOptions);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // GET https://api.webflow.com/v2/sites/:site_id
  server.tool(
    "sites_get",
    "Get detailed information about a specific site including its settings, domains, and publishing status.",
    {
      site_id: z.string(),
    },
    async ({ site_id }) => {
      const response = await getClient().sites.get(site_id, requestOptions);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // POST https://api.webflow.com/v2/sites/:site_id/publish
  server.tool(
    "sites_publish",
    "Publish a site to specified domains. This will make the latest changes live on the specified domains.",
    {
      site_id: z.string(),
      customDomains: z.string().array().optional(),
      publishToWebflowSubdomain: z.boolean().optional().default(false),
    },
    async ({ site_id, customDomains, publishToWebflowSubdomain }) => {
      const response = await getClient().sites.publish(
        site_id,
        {
          customDomains,
          publishToWebflowSubdomain,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // -- PAGES --

  // GET https://api.webflow.com/v2/sites/:site_id/pages
  server.tool(
    "pages_list",
    "List all pages within a site. Returns page metadata including IDs, titles, and slugs.",
    {
      site_id: z.string(),
      localeId: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
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
      page_id: z.string(),
      localeId: z.string().optional(),
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
    id: z.string(),
    siteId: z.string().optional(),
    title: z.string().optional(),
    slug: z.string().optional(),
    parentId: z.string().optional(),
    collectionId: z.string().optional(),
    createdOn: z.date().optional(),
    lastUpdated: z.date().optional(),
    archived: z.boolean().optional(),
    draft: z.boolean().optional(),
    canBranch: z.boolean().optional(),
    isBranch: z.boolean().optional(),
    isMembersOnly: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    openGraph: z
      .object({
        title: z.string().optional(),
        titleCopied: z.boolean().optional(),
        description: z.string().optional(),
        descriptionCopied: z.boolean().optional(),
      })
      .optional(),
    localeId: z.string().optional(),
    publishedPath: z.string().optional(),
  });

  // PUT https://api.webflow.com/v2/pages/:page_id
  server.tool(
    "pages_update_page_settings",
    "Update page settings including SEO metadata, Open Graph data, slug, and publishing status.",
    {
      page_id: z.string(),
      localeId: z.string().optional(),
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
      page_id: z.string(),
      localeId: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
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
      z.object({
        nodeId: z.string(),
        text: z.string(),
      }),
      z.object({
        nodeId: z.string(),
        propertyOverrides: z.array(
          z.object({
            propertyId: z.string(),
            text: z.string(),
          })
        ),
      }),
    ])
    .array();

  // POST https://api.webflow.com/v2/pages/:page_id/dom
  server.tool(
    "pages_update_static_content",
    "Update static content on a page by modifying text nodes and property overrides.",
    {
      page_id: z.string(),
      localeId: z.string(),
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

  // -- CMS --

  // GET https://api.webflow.com/v2/sites/:site_id/collections
  server.tool(
    "collections_list",
    "List all CMS collections in a site. Returns collection metadata including IDs, names, and schemas.",
    {
      site_id: z.string(),
    },
    async ({ site_id }) => {
      const response = await getClient().collections.list(
        site_id,
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // GET https://api.webflow.com/v2/collections/:collection_id
  server.tool(
    "collections_get",
    "Get detailed information about a specific CMS collection including its schema and field definitions.",
    {
      collection_id: z.string(),
    },
    async ({ collection_id }) => {
      const response = await getClient().collections.get(
        collection_id,
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  const StaticFieldSchema = z.object({
    id: z.string().optional(),
    isEditable: z.boolean().optional(),
    isRequired: z.boolean().optional(),
    type: z.union([
      z.literal("Color"),
      z.literal("DateTime"),
      z.literal("Email"),
      z.literal("File"),
      z.literal("Image"),
      z.literal("Link"),
      z.literal("MultiImage"),
      z.literal("Number"),
      z.literal("Phone"),
      z.literal("PlainText"),
      z.literal("RichText"),
      z.literal("Switch"),
      z.literal("Video"),
    ]),
    displayName: z.string(),
    helpText: z.string().optional(),
  });

  const OptionFieldSchema = z.object({
    id: z.string().optional(),
    isEditable: z.boolean().optional(),
    isRequired: z.boolean().optional(),
    type: z.literal("Option"),
    displayName: z.string(),
    helpText: z.string().optional(),
    metadata: z.object({
      options: z.array(
        z.object({
          name: z.string(),
          id: z.string().optional(),
        })
      ),
    }),
  });

  const ReferenceFieldSchema = z.object({
    id: z.string().optional(),
    isEditable: z.boolean().optional(),
    isRequired: z.boolean().optional(),
    type: z.union([z.literal("MultiReference"), z.literal("Reference")]),
    displayName: z.string(),
    helpText: z.string().optional(),
    metadata: z.object({
      collectionId: z.string(),
    }),
  });

  // request: Webflow.CollectionsCreateRequest
  // NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
  const WebflowCollectionsCreateRequestSchema = z.object({
    displayName: z.string(),
    singularName: z.string(),
    slug: z.string().optional(),
  });

  // POST https://api.webflow.com/v2/sites/:site_id/collections
  server.tool(
    "collections_create",
    "Create a new CMS collection in a site with specified name and schema.",
    {
      site_id: z.string(),
      request: WebflowCollectionsCreateRequestSchema,
    },
    async ({ site_id, request }) => {
      const response = await getClient().collections.create(
        site_id,
        request,
        requestOptions
      );
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/fields
  server.tool(
    "collection_fields_create_static",
    "Create a new static field in a CMS collection (e.g., text, number, date, etc.).",
    {
      collection_id: z.string(),
      request: StaticFieldSchema,
    },
    async ({ collection_id, request }) => {
      const response = await getClient().collections.fields.create(
        collection_id,
        request,
        requestOptions
      );
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/fields
  server.tool(
    "collection_fields_create_option",
    "Create a new option field in a CMS collection with predefined choices.",
    {
      collection_id: z.string(),
      request: OptionFieldSchema,
    },
    async ({ collection_id, request }) => {
      const response = await getClient().collections.fields.create(
        collection_id,
        request,
        requestOptions
      );
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/fields
  server.tool(
    "collection_fields_create_reference",
    "Create a new reference field in a CMS collection that links to items in another collection.",
    {
      collection_id: z.string(),
      request: ReferenceFieldSchema,
    },
    async ({ collection_id, request }) => {
      const response = await getClient().collections.fields.create(
        collection_id,
        request,
        requestOptions
      );
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );

  // request: Webflow.collections.FieldUpdate
  const WebflowCollectionsFieldUpdateSchema = z.object({
    isRequired: z.boolean().optional(),
    displayName: z.string().optional(),
    helpText: z.string().optional(),
  });

  // PATCH https://api.webflow.com/v2/collections/:collection_id/fields/:field_id
  server.tool(
    "collection_fields_update",
    "Update properties of an existing field in a CMS collection.",
    {
      collection_id: z.string(),
      field_id: z.string(),
      request: WebflowCollectionsFieldUpdateSchema,
    },
    async ({ collection_id, field_id, request }) => {
      const response = await getClient().collections.fields.update(
        collection_id,
        field_id,
        request,
        requestOptions
      );
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );

  // request: Webflow.collections.ItemsCreateItemLiveRequest
  const WebflowCollectionsItemsCreateItemLiveRequestSchema = z.object({
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          cmsLocaleId: z.string().optional(),
          lastPublished: z.string().optional(),
          lastUpdated: z.string().optional(),
          createdOn: z.string().optional(),
          isArchived: z.boolean().optional(),
          isDraft: z.boolean().optional(),
          fieldData: z.record(z.any()).and(
            z.object({
              name: z.string(),
              slug: z.string(),
            })
          ),
        })
      )
      .optional(),
  });

  // POST https://api.webflow.com/v2/collections/:collection_id/items/live
  // NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
  server.tool(
    "collections_items_create_item_live",
    "Create and publish new items in a CMS collection directly to the live site.",
    {
      collection_id: z.string(),
      request: WebflowCollectionsItemsCreateItemLiveRequestSchema,
    },
    async ({ collection_id, request }) => {
      const response = await getClient().collections.items.createItemLive(
        collection_id,
        request,
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // request: Webflow.collections.ItemsUpdateItemsLiveRequest
  const WebflowCollectionsItemsUpdateItemsLiveRequestSchema = z.object({
    items: z
      .array(
        z.object({
          id: z.string(),
          cmsLocaleId: z.string().optional(),
          lastPublished: z.string().optional(),
          lastUpdated: z.string().optional(),
          createdOn: z.string().optional(),
          isArchived: z.boolean().optional(),
          isDraft: z.boolean().optional(),
          fieldData: z
            .record(z.any())
            .and(
              z.object({
                name: z.string().optional(),
                slug: z.string().optional(),
              })
            )
            .optional(),
        })
      )
      .optional(),
  });

  // PATCH https://api.webflow.com/v2/collections/:collection_id/items/live
  server.tool(
    "collections_items_update_items_live",
    "Update and publish existing items in a CMS collection directly to the live site.",
    {
      collection_id: z.string(),
      request: WebflowCollectionsItemsUpdateItemsLiveRequestSchema,
    },
    async ({ collection_id, request }) => {
      const response = await getClient().collections.items.updateItemsLive(
        collection_id,
        request,
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // GET https://api.webflow.com/v2/collections/:collection_id/items
  server.tool(
    "collections_items_list_items",
    "List items in a CMS collection with optional filtering and sorting.",
    {
      collection_id: z.string(),
      cmsLocaleId: z.string().optional(),
      offset: z.number().optional(),
      limit: z.number().optional(),
      name: z.string().optional(),
      slug: z.string().optional(),
      sortBy: z.enum(["lastPublished", "name", "slug"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    },
    async ({
      collection_id,
      cmsLocaleId,
      offset,
      limit,
      name,
      slug,
      sortBy,
      sortOrder,
    }) => {
      const response = await getClient().collections.items.listItems(
        collection_id,
        {
          cmsLocaleId,
          offset,
          limit,
          name,
          slug,
          sortBy,
          sortOrder,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // CollectionItemPostSingle
  const CollectionItemPostSingleSchema = z.object({
    id: z.string().optional(),
    cmsLocaleId: z.string().optional(),
    lastPublished: z.string().optional(),
    lastUpdated: z.string().optional(),
    createdOn: z.string().optional(),
    isArchived: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    fieldData: z.record(z.any()).and(
      z.object({
        name: z.string(),
        slug: z.string(),
      })
    ),
  });

  // request: Webflow.collections.ItemsCreateItemRequest
  // NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
  const WebflowCollectionsItemsCreateItemRequestSchema = z.object({
    items: z.array(CollectionItemPostSingleSchema).optional(),
  });

  // POST https://api.webflow.com/v2/collections/:collection_id/items
  server.tool(
    "collections_items_create_item",
    "Create new items in a CMS collection as drafts.",
    {
      collection_id: z.string(),
      request: WebflowCollectionsItemsCreateItemRequestSchema,
    },
    async ({ collection_id, request }) => {
      const response = await getClient().collections.items.createItem(
        collection_id,
        request,
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // CollectionItemWithIdInput
  const CollectionItemWithIdInputSchema = z.object({
    id: z.string(),
    cmsLocaleId: z.string().optional(),
    lastPublished: z.string().optional(),
    lastUpdated: z.string().optional(),
    createdOn: z.string().optional(),
    isArchived: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    fieldData: z.record(z.any()).and(
      z.object({
        name: z.string(),
        slug: z.string(),
      })
    ),
  });

  // request: Webflow.collections.ItemsUpdateItemsRequest
  const WebflowCollectionsItemsUpdateItemsRequestSchema = z.object({
    items: z.array(CollectionItemWithIdInputSchema).optional(),
  });

  // PATCH https://api.webflow.com/v2/collections/:collection_id/items
  server.tool(
    "collections_items_update_items",
    "Update existing items in a CMS collection as drafts.",
    {
      collection_id: z.string(),
      request: WebflowCollectionsItemsUpdateItemsRequestSchema,
    },
    async ({ collection_id, request }) => {
      const response = await getClient().collections.items.updateItems(
        collection_id,
        request,
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/items/publish
  server.tool(
    "collections_items_publish_items",
    "Publish draft items in a CMS collection to make them live.",
    {
      collection_id: z.string(),
      itemIds: z.array(z.string()),
    },
    async ({ collection_id, itemIds }) => {
      const response = await getClient().collections.items.publishItem(
        collection_id,
        {
          itemIds: itemIds,
        },
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );
}
