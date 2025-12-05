import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod/v3";
import { requestOptions } from "../mcp";
import {
  OptionFieldSchema,
  ReferenceFieldSchema,
  StaticFieldSchema,
  WebflowCollectionsCreateRequestSchema,
  WebflowCollectionsFieldUpdateSchema,
  WebflowCollectionsItemsCreateItemLiveRequestSchema,
  WebflowCollectionsItemsCreateItemRequestSchema,
  WebflowCollectionsItemsListItemsRequestSortBySchema,
  WebflowCollectionsItemsListItemsRequestSortOrderSchema,
  WebflowCollectionsItemsUpdateItemsLiveRequestSchema,
  WebflowCollectionsItemsUpdateItemsRequestSchema,
} from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export function registerCmsTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  // GET https://api.webflow.com/v2/sites/:site_id/collections
  server.registerTool(
    "collections_list",
    {
      title: "List Collections",
      description:
        "List all CMS collections in a site. Returns collection metadata including IDs, names, and schemas.",
      inputSchema: z.object({
        site_id: z.string().describe("Unique identifier for the Site."),
      }),
    },
    async ({ site_id }) => {
      try {
        const response = await getClient().collections.list(
          site_id,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET https://api.webflow.com/v2/collections/:collection_id
  server.registerTool(
    "collections_get",
    {
      title: "Get Collection",
      description:
        "Get detailed information about a specific CMS collection including its schema and field definitions.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
      }),
    },
    async ({ collection_id }) => {
      try {
        const response = await getClient().collections.get(
          collection_id,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/sites/:site_id/collections
  server.registerTool(
    "collections_create",
    {
      title: "Create Collection",
      description:
        "Create a new CMS collection in a site with specified name and schema.",
      inputSchema: z.object({
        site_id: z.string().describe("Unique identifier for the Site."),
        request: WebflowCollectionsCreateRequestSchema,
      }),
    },
    async ({ site_id, request }) => {
      try {
        const response = await getClient().collections.create(
          site_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/fields
  server.registerTool(
    "collection_fields_create_static",
    {
      title: "Create Static Field",
      description:
        "Create a new static field in a CMS collection (e.g., text, number, date, etc.).",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        request: StaticFieldSchema,
      }),
    },
    async ({ collection_id, request }) => {
      try {
        const response = await getClient().collections.fields.create(
          collection_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/fields
  server.registerTool(
    "collection_fields_create_option",
    {
      title: "Create Option Field",
      description:
        "Create a new option field in a CMS collection with predefined choices.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        request: OptionFieldSchema,
      }),
    },
    async ({ collection_id, request }) => {
      try {
        const response = await getClient().collections.fields.create(
          collection_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/fields
  server.registerTool(
    "collection_fields_create_reference",
    {
      title: "Create Reference Field",
      description:
        "Create a new reference field in a CMS collection that links to items in another collection.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        request: ReferenceFieldSchema,
      }),
    },
    async ({ collection_id, request }) => {
      try {
        const response = await getClient().collections.fields.create(
          collection_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // PATCH https://api.webflow.com/v2/collections/:collection_id/fields/:field_id
  server.registerTool(
    "collection_fields_update",
    {
      title: "Update Collection Field",
      description:
        "Update properties of an existing field in a CMS collection.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        field_id: z.string().describe("Unique identifier for the Field."),
        request: WebflowCollectionsFieldUpdateSchema,
      }),
    },
    async ({ collection_id, field_id, request }) => {
      try {
        const response = await getClient().collections.fields.update(
          collection_id,
          field_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/items/live
  // NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
  server.registerTool(
    "collections_items_create_item_live",
    {
      title: "Create Item Live",
      description:
        "Create and publish new items in a CMS collection directly to the live site.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        request: WebflowCollectionsItemsCreateItemLiveRequestSchema,
      }),
    },
    async ({ collection_id, request }) => {
      try {
        const response = await getClient().collections.items.createItemLive(
          collection_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // PATCH https://api.webflow.com/v2/collections/:collection_id/items/live
  server.registerTool(
    "collections_items_update_items_live",
    {
      title: "Update Items Live",
      description:
        "Update and publish existing items in a CMS collection directly to the live site.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        request: WebflowCollectionsItemsUpdateItemsLiveRequestSchema,
      }),
    },
    async ({ collection_id, request }) => {
      try {
        const response = await getClient().collections.items.updateItemsLive(
          collection_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET https://api.webflow.com/v2/collections/:collection_id/items
  server.registerTool(
    "collections_items_list_items",
    {
      title: "List Collection Items",
      description:
        "List items in a CMS collection with optional filtering and sorting.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        cmsLocaleId: z
          .string()
          .optional()
          .describe("Unique identifier for the locale of the CMS Item."),
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
        name: z.string().optional().describe("Name of the field."),
        slug: z
          .string()
          .optional()
          .describe(
            "URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."
          ),
        sortBy: WebflowCollectionsItemsListItemsRequestSortBySchema,
        sortOrder: WebflowCollectionsItemsListItemsRequestSortOrderSchema,
      }),
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
      try {
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
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/items
  server.registerTool(
    "collections_items_create_item",
    {
      title: "Create Collection Item",
      description: "Create new items in a CMS collection as drafts.",
      inputSchema: z.object({
        collection_id: z.string(),
        request: WebflowCollectionsItemsCreateItemRequestSchema,
      }),
    },
    async ({ collection_id, request }) => {
      try {
        const response = await getClient().collections.items.createItem(
          collection_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // PATCH https://api.webflow.com/v2/collections/:collection_id/items
  server.registerTool(
    "collections_items_update_items",
    {
      title: "Update Collection Items",
      description: "Update existing items in a CMS collection as drafts.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        request: WebflowCollectionsItemsUpdateItemsRequestSchema,
      }),
    },
    async ({ collection_id, request }) => {
      try {
        const response = await getClient().collections.items.updateItems(
          collection_id,
          request,
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/collections/:collection_id/items/publish
  server.registerTool(
    "collections_items_publish_items",
    {
      title: "Publish Collection Items",
      description: "Publish draft items in a CMS collection to make them live.",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        itemIds: z
          .array(z.string())
          .describe("Array of item IDs to be published."),
      }),
    },
    async ({ collection_id, itemIds }) => {
      try {
        const response = await getClient().collections.items.publishItem(
          collection_id,
          {
            itemIds: itemIds,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // DEL https://api.webflow.com/v2/collections/:collection_id/items/
  server.registerTool(
    "collections_items_delete_item",
    {
      title: "Delete Collection Item",
      description:
        "Delete an item in a CMS collection. Items will only be deleted in the primary locale unless a cmsLocaleId is included in the request. ",
      inputSchema: z.object({
        collection_id: z
          .string()
          .describe("Unique identifier for the Collection."),
        itemId: z.string().describe("Item ID to be deleted."),
        cmsLocaleIds: z
          .string()
          .optional()
          .describe("Unique identifier for the locale of the CMS Item."),
      }),
    },
    async ({ collection_id, itemId, cmsLocaleIds }) => {
      try {
        const response = await getClient().collections.items.deleteItem(
          collection_id,
          itemId,
          { cmsLocaleId: cmsLocaleIds },
          requestOptions
        );
        return formatResponse(JSON.stringify("Item deleted"));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
