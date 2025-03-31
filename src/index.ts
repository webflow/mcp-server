#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";

// Verify WEBFLOW_TOKEN
if (!process.env.WEBFLOW_TOKEN) {
  throw new Error("WEBFLOW_TOKEN is missing");
}

// Create a Webflow client
const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_TOKEN,
});

// Create an MCP server
const server = new McpServer({
  name: "webflow-mcp-server",
  version: "1.0.0",
});

//
// SITES
//

// GET https://api.webflow.com/v2/sites
server.tool("sites-list", async () => {
  const response = await client.sites.list();
  return {
    content: [{ type: "text", text: JSON.stringify(response) }],
  };
});

// GET https://api.webflow.com/v2/sites/:site_id
server.tool(
  "sites-get",
  {
    site_id: z.string(),
  },
  async ({ site_id }) => {
    const response = await client.sites.get(site_id);
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// POST https://api.webflow.com/v2/sites/:site_id/publish
server.tool(
  "sites-publish",
  {
    site_id: z.string(),
    customDomains: z.string().array().optional(),
    publishToWebflowSubdomain: z.boolean().optional().default(false),
  },
  async ({ site_id, customDomains, publishToWebflowSubdomain }) => {
    const response = await client.sites.publish(site_id, {
      customDomains,
      publishToWebflowSubdomain,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

//
// PAGES
//

// GET https://api.webflow.com/v2/sites/:site_id/pages
server.tool(
  "pages-list",
  {
    site_id: z.string(),
    localeId: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  },
  async ({ site_id, localeId, limit, offset }) => {
    const response = await client.pages.list(site_id, {
      localeId,
      limit,
      offset,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// GET https://api.webflow.com/v2/pages/:page_id
server.tool(
  "pages-get-metadata",
  {
    page_id: z.string(),
    localeId: z.string().optional(),
  },
  async ({ page_id, localeId }) => {
    const response = await client.pages.getMetadata(page_id, { localeId });
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
  "pages-update-page-settings",
  {
    page_id: z.string(),
    localeId: z.string().optional(),
    body: WebflowPageSchema,
  },
  async ({ page_id, localeId, body }) => {
    const response = await client.pages.updatePageSettings(page_id, {
      localeId,
      body,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// GET https://api.webflow.com/v2/pages/:page_id/dom
server.tool(
  "pages-get-content",
  {
    page_id: z.string(),
    localeId: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  },
  async ({ page_id, localeId, limit, offset }) => {
    const response = await client.pages.getContent(page_id, {
      localeId,
      limit,
      offset,
    });
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
  "pages-update-static-content",
  {
    page_id: z.string(),
    localeId: z.string(),
    nodes: WebflowPageDomWriteNodesItemSchema,
  },
  async ({ page_id, localeId, nodes }) => {
    const response = await client.pages.updateStaticContent(page_id, {
      localeId,
      nodes,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

//
// CMS
//

// GET https://api.webflow.com/v2/sites/:site_id/collections
server.tool(
  "collections-list",
  {
    site_id: z.string(),
  },
  async ({ site_id }) => {
    const response = await client.collections.list(site_id);
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// GET https://api.webflow.com/v2/collections/:collection_id
server.tool(
  "collections-get",
  {
    collection_id: z.string(),
  },
  async ({ collection_id }) => {
    const response = await client.collections.get(collection_id);
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
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
  "collections-items-create-item-live",
  {
    collection_id: z.string(),
    request: WebflowCollectionsItemsCreateItemLiveRequestSchema,
  },
  async ({ collection_id, request }) => {
    const response = await client.collections.items.createItemLive(
      collection_id,
      request
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
  "collections-items-update-items-live",
  {
    collection_id: z.string(),
    request: WebflowCollectionsItemsUpdateItemsLiveRequestSchema,
  },
  async ({ collection_id, request }) => {
    const response = await client.collections.items.updateItemsLive(
      collection_id,
      request
    );
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// GET https://api.webflow.com/v2/collections/:collection_id/items
server.tool(
  "collections-items-list-items",
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
    const response = await client.collections.items.listItems(collection_id, {
      cmsLocaleId,
      offset,
      limit,
      name,
      slug,
      sortBy,
      sortOrder,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// CollectionItemPostSingle
export const CollectionItemPostSingleSchema = z.object({
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
  "collections-items-create-item",
  {
    collection_id: z.string(),
    request: WebflowCollectionsItemsCreateItemRequestSchema,
  },
  async ({ collection_id, request }) => {
    const response = await client.collections.items.createItem(
      collection_id,
      request
    );
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// CollectionItemWithIdInput
export const CollectionItemWithIdInputSchema = z.object({
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
  "collections-items-update-items",
  {
    collection_id: z.string(),
    request: WebflowCollectionsItemsUpdateItemsRequestSchema,
  },
  async ({ collection_id, request }) => {
    const response = await client.collections.items.updateItems(
      collection_id,
      request
    );
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// POST https://api.webflow.com/v2/collections/:collection_id/items/publish
server.tool(
  "collections-items-publish-items",
  {
    collection_id: z.string(),
    itemIds: z.array(z.string()),
  },
  async ({ collection_id, itemIds }) => {
    const response = await client.collections.items.publishItem(collection_id, {
      itemIds: itemIds,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
