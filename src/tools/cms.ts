import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";
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
  server.tool(
    "collections_list",
    "List all CMS collections in a site. Returns collection metadata including IDs, names, and schemas.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
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
  server.tool(
    "collections_get",
    "Get detailed information about a specific CMS collection including its schema and field definitions.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
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
  server.tool(
    "collections_create",
    "Create a new CMS collection in a site with specified name and schema.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
      request: WebflowCollectionsCreateRequestSchema,
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
  server.tool(
    "collection_fields_create_static",
    "Create a new static field in a CMS collection (e.g., text, number, date, etc.).",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      request: StaticFieldSchema,
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
  server.tool(
    "collection_fields_create_option",
    "Create a new option field in a CMS collection with predefined choices.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      request: OptionFieldSchema,
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
  server.tool(
    "collection_fields_create_reference",
    "Create a new reference field in a CMS collection that links to items in another collection.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      request: ReferenceFieldSchema,
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
  server.tool(
    "collection_fields_update",
    "Update properties of an existing field in a CMS collection.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      field_id: z.string().describe("Unique identifier for the Field."),
      request: WebflowCollectionsFieldUpdateSchema,
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
  server.tool(
    "collections_items_create_item_live",
    "Create and publish new items in a CMS collection directly to the live site.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      request: WebflowCollectionsItemsCreateItemLiveRequestSchema,
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
  server.tool(
    "collections_items_update_items_live",
    "Update and publish existing items in a CMS collection directly to the live site.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      request: WebflowCollectionsItemsUpdateItemsLiveRequestSchema,
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
  server.tool(
    "collections_items_list_items",
    "List items in a CMS collection with optional filtering and sorting.",
    {
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
        .describe("Maximum number of records to be returned (max limit: 100)"),
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
  server.tool(
    "collections_items_create_item",
    "Create new items in a CMS collection as drafts.",
    {
      collection_id: z.string(),
      request: WebflowCollectionsItemsCreateItemRequestSchema,
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
  server.tool(
    "collections_items_update_items",
    "Update existing items in a CMS collection as drafts.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      request: WebflowCollectionsItemsUpdateItemsRequestSchema,
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
  server.tool(
    "collections_items_publish_items",
    "Publish draft items in a CMS collection to make them live.",
    {
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      itemIds: z
        .array(z.string())
        .describe("Array of item IDs to be published."),
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
    server.tool(
      "collections_items_delete_item",
      "Delete an item in a CMS collection. Items will only be deleted in the primary locale unless a cmsLocaleId is included in the request. ",
      {
        collection_id: z.string().describe("Unique identifier for the Collection."),
        itemId: z.string().describe("Item ID to be deleted."),
        cmsLocaleIds: z.string().optional().describe("Unique identifier for the locale of the CMS Item."),
      },
      async ({ collection_id, itemId, cmsLocaleIds }) => {
        try {
        const response = await getClient().collections.items.deleteItem(
          collection_id,
          itemId,
          { cmsLocaleId: cmsLocaleIds},
          requestOptions
        );
        return formatResponse(error.message ?? "No custom code found");
      } catch (error) {
        return formatErrorResponse(error);
      }
      }
    );
}
