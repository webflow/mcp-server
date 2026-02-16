import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod/v3";
import { requestOptions } from "../mcp";
import {
  OptionFieldSchema,
  ReferenceFieldSchema,
  SiteIdSchema,
  StaticFieldSchema,
  WebflowCollectionsCreateRequestSchema,
  WebflowCollectionsFieldUpdateSchema,
  // WebflowCollectionsItemsCreateItemLiveRequestSchema,
  WebflowCollectionsItemsListItemsRequestSortBySchema,
  WebflowCollectionsItemsListItemsRequestSortOrderSchema,
  // WebflowCollectionsItemsUpdateItemsLiveRequestSchema,
  WebflowCollectionsItemsUpdateItemsRequestSchema,
} from "../schemas";
import {
  Content,
  formatErrorResponse,
  formatResponse,
  textContent,
  toolResponse,
} from "../utils";
import { CollectionsCreateRequest, FieldCreate } from "webflow-api/api";
import { FieldUpdate } from "webflow-api/api/resources/collections/resources/fields";
import {
  //ItemsCreateItemLiveRequest,
  //ItemsUpdateItemsLiveRequest,
  ItemsDeleteItemsRequest,
  ItemsListItemsRequest,
  ItemsUpdateItemsRequest,
} from "webflow-api/api/resources/collections/resources/items";

export function registerCmsTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const getCollectionList = async (arg: { siteId: string }) => {
    const response = await getClient().collections.list(
      arg.siteId,
      requestOptions
    );
    return response;
  };
  const getCollectionDetails = async (arg: { collection_id: string }) => {
    const response = await getClient().collections.get(
      arg.collection_id,
      requestOptions
    );
    return response;
  };

  const createCollection = async (arg: {
    siteId: string;
    request: CollectionsCreateRequest;
  }) => {
    const response = await getClient().collections.create(
      arg.siteId,
      arg.request,
      requestOptions
    );
    return response;
  };

  const createCollectionStaticField = async (arg: {
    collection_id: string;
    request: FieldCreate;
  }) => {
    const response = await getClient().collections.fields.create(
      arg.collection_id,
      arg.request,
      requestOptions
    );
    return response;
  };

  const createCollectionOptionField = async (arg: {
    collection_id: string;
    request: FieldCreate;
  }) => {
    const response = await getClient().collections.fields.create(
      arg.collection_id,
      arg.request,
      requestOptions
    );
    return response;
  };
  const createCollectionReferenceField = async (arg: {
    collection_id: string;
    request: FieldCreate;
  }) => {
    const response = await getClient().collections.fields.create(
      arg.collection_id,
      arg.request,
      requestOptions
    );
    return response;
  };

  const updateCollectionField = async (arg: {
    collection_id: string;
    field_id: string;
    request: FieldUpdate;
  }) => {
    const response = await getClient().collections.fields.update(
      arg.collection_id,
      arg.field_id,
      arg.request,
      requestOptions
    );
    return response;
  };

  // const createCollectionItemsLive = async (arg:{collection_id:string, request: ItemsCreateItemLiveRequest})=>{
  //   const response = await getClient().collections.items.createItemLive(
  //     arg.collection_id,
  //     arg.request,
  //     requestOptions
  //   );
  //   return response;
  // }
  // const updateCollectionItemsLive = async (arg:{collection_id:string, request: ItemsUpdateItemsLiveRequest})=>{
  //   const response = await getClient().collections.items.updateItemsLive(
  //     arg.collection_id,
  //     arg.request,
  //     requestOptions
  //   );
  //   return response;
  // }

  const listCollectionItems = async (arg: {
    collection_id: string;
    request: ItemsListItemsRequest;
  }) => {
    const response = await getClient().collections.items.listItems(
      arg.collection_id,
      arg.request,
      requestOptions
    );
    return response;
  };

  const createCollectionItems = async (arg: {
    collection_id: string;
    request: {
      cmsLocaleIds?: string[];
      isArchived?: boolean;
      isDraft?: boolean;
      fieldData: {
        name: string;
        slug: string;
        [key: string]: any;
      }[];
    };
  }) => {
    const response = await getClient().collections.items.createItems(
      arg.collection_id,
      {
        cmsLocaleIds: arg.request.cmsLocaleIds,
        isArchived: arg.request.isArchived,
        isDraft: arg.request.isDraft,
        fieldData: arg.request.fieldData,
      },
      requestOptions
    );
    return response;
  };

  const updateCollectionItems = async (arg: {
    collection_id: string;
    request: ItemsUpdateItemsRequest;
  }) => {
    const response = await getClient().collections.items.updateItems(
      arg.collection_id,
      arg.request,
      requestOptions
    );
    return response;
  };
  const publishCollectionItems = async (arg: {
    collection_id: string;
    request: {
      itemIds: string[];
    };
  }) => {
    const response = await getClient().collections.items.publishItem(
      arg.collection_id,
      {
        itemIds: arg.request.itemIds,
      },
      requestOptions
    );
    return response;
  };
  const deleteCollectionItems = async (arg: {
    collection_id: string;
    request: ItemsDeleteItemsRequest;
  }) => {
    const response = await getClient().collections.items.deleteItems(
      arg.collection_id,
      arg.request,
      requestOptions
    );
    return response;
  };

  server.registerTool(
    "data_cms_tool",
    {
      title: "Data CMS Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Data tool - CMS tool to perform actions like get collection list, get collection details, create collection, create collection fields (static/option/reference), update collection field, list collection items, create collection items, update collection items, publish collection items, and delete collection items",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // GET https://api.webflow.com/v2/sites/:site_id/collections
              get_collection_list: z
                .object({
                  ...SiteIdSchema,
                })
                .optional()
                .describe(
                  "List all CMS collections in a site. Returns collection metadata including IDs, names, and schemas."
                ),
              // GET https://api.webflow.com/v2/collections/:collection_id
              get_collection_details: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                })
                .optional()
                .describe(
                  "Get detailed information about a specific CMS collection including its schema and field definitions."
                ),
              // POST https://api.webflow.com/v2/sites/:site_id/collections
              create_collection: z
                .object({
                  ...SiteIdSchema,
                  request: WebflowCollectionsCreateRequestSchema,
                })
                .optional()
                .describe(
                  "Create a new CMS collection in a site with specified name and schema."
                ),
              // POST https://api.webflow.com/v2/collections/:collection_id/fields
              create_collection_static_field: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request: StaticFieldSchema,
                })
                .optional()
                .describe(
                  "Create a new static field in a CMS collection (e.g., text, number, date, etc.)."
                ),
              // POST https://api.webflow.com/v2/collections/:collection_id/fields
              create_collection_option_field: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request: OptionFieldSchema,
                })
                .optional()
                .describe(
                  "Create a new option field in a CMS collection with predefined choices."
                ),
              // POST https://api.webflow.com/v2/collections/:collection_id/fields
              create_collection_reference_field: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request: ReferenceFieldSchema,
                })
                .optional()
                .describe(
                  "Create a new reference field in a CMS collection that links to items in another collection."
                ),
              // PATCH https://api.webflow.com/v2/collections/:collection_id/fields/:field_id
              update_collection_field: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  field_id: z
                    .string()
                    .describe("Unique identifier for the Field."),
                  request: WebflowCollectionsFieldUpdateSchema,
                })
                .optional()
                .describe(
                  "Update properties of an existing field in a CMS collection."
                ),
              // // POST https://api.webflow.com/v2/collections/:collection_id/items/live
              // //NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
              // create_collection_items_live:z.object({
              //   collection_id: z.string().describe("Unique identifier for the Collection."),
              //   request: WebflowCollectionsItemsCreateItemLiveRequestSchema,
              // }).optional().describe("Create and publish new items in a CMS collection directly to the live site."),
              // // PATCH https://api.webflow.com/v2/collections/:collection_id/items/live
              // update_collection_items_live:z.object({
              //   collection_id: z.string().describe("Unique identifier for the Collection."),
              //   request: WebflowCollectionsItemsUpdateItemsLiveRequestSchema,
              // }).optional().describe("Update and publish existing items in a CMS collection directly to the live site."),
              // GET https://api.webflow.com/v2/collections/:collection_id/items
              list_collection_items: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request: z
                    .object({
                      cmsLocaleId: z
                        .string()
                        .optional()
                        .describe(
                          "Unique identifier for the locale of the CMS Item."
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
                      name: z
                        .string()
                        .optional()
                        .describe("Name of the field."),
                      slug: z
                        .string()
                        .optional()
                        .describe(
                          "URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."
                        ),
                      sortBy:
                        WebflowCollectionsItemsListItemsRequestSortBySchema,
                      sortOrder:
                        WebflowCollectionsItemsListItemsRequestSortOrderSchema,
                    })
                    .optional()
                    .describe("Filter and sort items in a CMS collection."),
                })
                .optional()
                .describe(
                  "List items in a CMS collection with optional filtering and sorting."
                ),
              // POST https://api.webflow.com/v2/collections/:collection_id/items/bulk
              create_collection_items: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request: z
                    .object({
                      cmsLocaleIds: z
                        .array(z.string())
                        .optional()
                        .describe(
                          "Unique identifier for the locale of the CMS Item."
                        ),
                      isArchived: z
                        .boolean()
                        .optional()
                        .describe("Indicates if the item is archived."),
                      isDraft: z
                        .boolean()
                        .optional()
                        .describe("Indicates if the item is a draft."),
                      fieldData: z
                        .array(
                          z.record(z.any()).and(
                            z.object({
                              name: z.string().describe("Name of the field."),
                              slug: z
                                .string()
                                .describe(
                                  "URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."
                                ),
                            })
                          )
                        )
                        .describe("Data of the item."),
                    })
                    .describe("Array of items to be created."),
                })
                .optional()
                .describe("Create new items in a CMS collection as drafts."),
              //PATCH https://api.webflow.com/v2/collections/:collection_id/items
              update_collection_items: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request:
                    WebflowCollectionsItemsUpdateItemsRequestSchema.describe(
                      "Array of items to be updated."
                    ),
                })
                .optional()
                .describe(
                  "Update existing items in a CMS collection as drafts."
                ),
              // POST https://api.webflow.com/v2/collections/:collection_id/items/publish
              publish_collection_items: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request: z
                    .object({
                      itemIds: z
                        .array(z.string())
                        .describe("Array of item IDs to be published."),
                    })
                    .describe("Array of items to be published."),
                })
                .optional()
                .describe(
                  "Publish existing items in a CMS collection as drafts."
                ),
              // DEL https://api.webflow.com/v2/collections/:collection_id/items
              delete_collection_items: z
                .object({
                  collection_id: z
                    .string()
                    .describe("Unique identifier for the Collection."),
                  request: z
                    .object({
                      items: z
                        .array(
                          z.object({
                            id: z.string().describe("Item ID to be deleted."),
                            cmsLocaleIds: z
                              .array(z.string())
                              .optional()
                              .describe(
                                "Unique identifier for the locale of the CMS Item."
                              ),
                          })
                        )
                        .describe("Array of items to be deleted."),
                    })
                    .describe("Array of items to be deleted."),
                })
                .optional()
                .describe(
                  "Delete existing items in a CMS collection as drafts."
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.get_collection_list,
                  d.get_collection_details,
                  d.create_collection,
                  d.create_collection_static_field,
                  d.create_collection_option_field,
                  d.create_collection_reference_field,
                  d.update_collection_field,
                  d.list_collection_items,
                  d.create_collection_items,
                  d.update_collection_items,
                  d.publish_collection_items,
                  d.delete_collection_items,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of get_collection_list, get_collection_details, create_collection, create_collection_static_field, create_collection_option_field, create_collection_reference_field, update_collection_field, list_collection_items, create_collection_items, update_collection_items, publish_collection_items, delete_collection_items.",
              }
            )
        ),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.get_collection_list) {
            const content = await getCollectionList(action.get_collection_list);
            result.push(textContent(content));
          }
          if (action.get_collection_details) {
            const content = await getCollectionDetails(
              action.get_collection_details
            );
            result.push(textContent(content));
          }
          if (action.create_collection) {
            const content = await createCollection(action.create_collection);
            result.push(textContent(content));
          }
          if (action.create_collection_static_field) {
            const content = await createCollectionStaticField(
              action.create_collection_static_field
            );
            result.push(textContent(content));
          }
          if (action.create_collection_option_field) {
            const content = await createCollectionOptionField(
              action.create_collection_option_field
            );
            result.push(textContent(content));
          }
          if (action.create_collection_reference_field) {
            const content = await createCollectionReferenceField(
              action.create_collection_reference_field
            );
            result.push(textContent(content));
          }
          if (action.update_collection_field) {
            const content = await updateCollectionField(
              action.update_collection_field
            );
            result.push(textContent(content));
          }
          // else if(action.create_collection_items_live){
          //   const content = await createCollectionItemsLive(action.create_collection_items_live);
          //   result.push(textContent(content));
          // }
          // else if(action.update_collection_items_live){
          //   const content = await updateCollectionItemsLive(action.update_collection_items_live);
          //   result.push(textContent(content));
          // }

          if (action.list_collection_items) {
            const content = await listCollectionItems({
              collection_id: action.list_collection_items.collection_id,
              request: action.list_collection_items.request || {},
            });
            result.push(textContent(content));
          }
          if (action.create_collection_items) {
            const content = await createCollectionItems({
              collection_id: action.create_collection_items.collection_id,
              request: action.create_collection_items.request,
            });
            result.push(textContent(content));
          }
          if (action.update_collection_items) {
            const content = await updateCollectionItems({
              collection_id: action.update_collection_items.collection_id,
              request: action.update_collection_items.request,
            });
            result.push(textContent(content));
          }
          if (action.publish_collection_items) {
            const content = await publishCollectionItems({
              collection_id: action.publish_collection_items.collection_id,
              request: action.publish_collection_items.request,
            });
            result.push(textContent(content));
          }
          if (action.delete_collection_items) {
            const content = await deleteCollectionItems({
              collection_id: action.delete_collection_items.collection_id,
              request: action.delete_collection_items.request,
            });
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
