import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";
import { requestOptions } from "../mcp";

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
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
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
    id: z.string().optional().describe("Unique identifier for the Field."),
    isEditable: z
      .boolean()
      .optional()
      .describe("Indicates if the field is editable."),
    isRequired: z
      .boolean()
      .optional()
      .describe("Indicates if the field is required."),
    type: z
      .union([
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
      ])
      .describe("Type of the field. Choose of these appropriate field types."),
    displayName: z.string().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
  });

  const OptionFieldSchema = z.object({
    id: z.string().optional().describe("Unique identifier for the Field."),
    isEditable: z
      .boolean()
      .optional()
      .describe("Indicates if the field is editable."),
    isRequired: z
      .boolean()
      .optional()
      .describe("Indicates if the field is required."),
    type: z
      .literal("Option")
      .describe('Type of the field. Set this to "Option".'),
    displayName: z.string().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
    metadata: z.object({
      options: z.array(
        z
          .object({
            name: z.string().describe("Name of the option."),
            id: z
              .string()
              .optional()
              .describe("Unique identifier for the option."),
          })
          .describe("Array of options for the field.")
      ),
    }),
  });

  const ReferenceFieldSchema = z.object({
    id: z.string().optional().describe("Unique identifier for the Field."),
    isEditable: z
      .boolean()
      .optional()
      .describe("Indicates if the field is editable."),
    isRequired: z
      .boolean()
      .optional()
      .describe("Indicates if the field is required."),
    type: z
      .union([z.literal("MultiReference"), z.literal("Reference")])
      .describe("Type of the field. Choose of these appropriate field types."),
    displayName: z.string().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
    metadata: z
      .object({
        collectionId: z.string(),
      })
      .describe(
        "ID of the referenced collection. Use this only for Reference and MultiReference fields."
      ),
  });

  // request: Webflow.CollectionsCreateRequest
  // NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
  const WebflowCollectionsCreateRequestSchema = z.object({
    displayName: z
      .string()
      .describe(
        "Name of the collection. Each collection must have a unique name within the site."
      ),
    singularName: z.string().describe("Singular name of the collection."),
    slug: z
      .string()
      .optional()
      .describe("Slug of the collection in the site URL structure. "),
  });

  // POST https://api.webflow.com/v2/sites/:site_id/collections
  server.tool(
    "collections_create",
    "Create a new CMS collection in a site with specified name and schema.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
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
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
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
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
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
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
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
  const WebflowCollectionsFieldUpdateSchema = z
    .object({
      isRequired: z
        .boolean()
        .optional()
        .describe("Indicates if the field is required in a collection."),
      displayName: z.string().optional().describe("Name of the field."),
      helpText: z.string().optional().describe("Help text for the field."),
    })
    .describe("Request schema to update collection field metadata.");

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
          cmsLocaleId: z
            .string()
            .optional()
            .describe("Unique identifier for the locale of the CMS Item."),
          lastPublished: z
            .string()
            .optional()
            .describe("Date when the item was last published."),
          lastUpdated: z
            .string()
            .optional()
            .describe("Date when the item was last updated."),
          createdOn: z
            .string()
            .optional()
            .describe("Date when the item was created."),
          isArchived: z
            .boolean()
            .optional()
            .describe("Indicates if the item is archived."),
          isDraft: z
            .boolean()
            .optional()
            .describe("Indicates if the item is a draft."),
          fieldData: z.record(z.any()).and(
            z.object({
              name: z.string().describe("Name of the field."),
              slug: z
                .string()
                .describe(
                  "URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."
                ),
            })
          ),
        })
      )
      .optional()
      .describe("Array of items to be created."),
  });

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
          cmsLocaleId: z
            .string()
            .optional()
            .describe("Unique identifier for the locale of the CMS Item."),
          lastPublished: z
            .string()
            .optional()
            .describe("Date when the item was last published."),
          lastUpdated: z
            .string()
            .optional()
            .describe("Date when the item was last updated."),
          createdOn: z
            .string()
            .optional()
            .describe("Date when the item was created."),
          isArchived: z
            .boolean()
            .optional()
            .describe("Indicates if the item is archived."),
          isDraft: z
            .boolean()
            .optional()
            .describe("Indicates if the item is a draft."),
          fieldData: z
            .record(z.any())
            .and(
              z.object({
                name: z.string().optional().describe("Name of the field."),
                slug: z
                  .string()
                  .optional()
                  .describe(
                    "URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."
                  ),
              })
            )
            .optional()
            .describe("Array of items to be updated."),
        })
      )
      .optional(),
  });

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
      sortBy: z
        .enum(["lastPublished", "name", "slug"])
        .optional()
        .describe(
          "Field to sort the items by. Allowed values: lastPublished, name, slug."
        ),
      sortOrder: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Order to sort the items by. Allowed values: asc, desc."),
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
  const CollectionItemWithIdInputSchema = z
    .object({
      id: z.string().describe("Unique identifier for the item."),
      cmsLocaleId: z
        .string()
        .optional()
        .describe("Unique identifier for the locale of the CMS Item."),
      lastPublished: z
        .string()
        .optional()
        .describe("Date when the item was last published."),
      lastUpdated: z
        .string()
        .optional()
        .describe("Date when the item was last updated."),
      createdOn: z
        .string()
        .optional()
        .describe("Date when the item was created."),
      isArchived: z
        .boolean()
        .optional()
        .describe("Indicates if the item is archived."),
      isDraft: z
        .boolean()
        .optional()
        .describe("Indicates if the item is a draft."),
      fieldData: z.record(z.any()).and(
        z.object({
          name: z.string().optional().describe("Name of the field."),
          slug: z
            .string()
            .optional()
            .describe(
              "URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."
            ),
        })
      ),
    })
    .describe("Collection item update request schema.");

  // request: Webflow.collections.ItemsUpdateItemsRequest
  const WebflowCollectionsItemsUpdateItemsRequestSchema = z.object({
    items: z.array(CollectionItemWithIdInputSchema).optional(),
  });

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
      collection_id: z
        .string()
        .describe("Unique identifier for the Collection."),
      itemIds: z
        .array(z.string())
        .describe("Array of item IDs to be published."),
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
