#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { ScriptApplyLocation } from "webflow-api/api/types/ScriptApplyLocation";

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
  server.tool("sites_list", async () => {
    const response = await getClient().sites.list(requestOptions);
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  });

  // GET https://api.webflow.com/v2/sites/:site_id
  server.tool(
    "sites_get",
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

  const WebflowPageSchema2 = z.object({
  })
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
  // -- Custom Code --

  // GET https://api.webflow.com/v2/sites/:site_id/registered_scripts
  server.tool(
    "site_registered_scripts_list",
    {
      site_id: z.string(),
    },
    async ({ site_id }) => {
      const response = await getClient().scripts.list(
        site_id,
        requestOptions
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    }
  );

    // GET https://api.webflow.com/v2/sites/:site_id/custom_code
    server.tool(
      "site_applied_scripts_list",
      {
        site_id: z.string(),
      },
      async ({ site_id }) => {
        const response = await getClient().scripts.list(
          site_id,
          requestOptions
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      }
    );

  const RegisterInlineSiteScriptSchema = z.object({
    sourceCode: z.string(),
    version: z.string(),
    canCopy: z.boolean().optional(),
    displayName: z.string(),
    location: z.string().optional(),
    attributes: z.record(z.any()).optional()
  });


  // POST https://api.webflow.com/v2/sites/:site_id/registered_scripts/inline
  server.tool(
    "add_inline_site_script",
    {
      site_id: z.string(),
      request: RegisterInlineSiteScriptSchema,
    },
    async ({ site_id, request }) => {
      try{
      const registerScriptResponse = await getClient().scripts.registerInline(
        site_id,
        {
          sourceCode: request.sourceCode,
          version: request.version,
          displayName: request.displayName,
          canCopy: request.canCopy !== undefined ? request.canCopy : true,
        },
        requestOptions
      ); 

      let existingScripts: any[] =  [];
        try {
         const allScriptsResponse = await getClient().sites.scripts.getCustomCode(
            site_id,
            requestOptions
          );
          existingScripts = allScriptsResponse.scripts || [];
        } catch (error) {
          console.log("Failed to get custom code, assuming empty scripts array", error);
          existingScripts = [];
        }
        
        const newScript = {
          id: registerScriptResponse.id ?? " ",
          location: request.location === "footer" ? ScriptApplyLocation.Footer : ScriptApplyLocation.Header,
          version: registerScriptResponse.version ??  " ",
          attributes: request.attributes
        }

        existingScripts.push(newScript);

        const addedSiteCustomCoderesponse = await getClient().sites.scripts.upsertCustomCode(
          site_id,
          {
            scripts: existingScripts
          },
          requestOptions
        );
      
        console.log("Upserted Custom Code", JSON.stringify(addedSiteCustomCoderesponse));
        return {
          content: [{ type: "text", text: JSON.stringify(registerScriptResponse) }],
        };
      } catch (error) {
       throw error;
      }
      });

      server.tool(
        "delete_site_script",
        {
          site_id: z.string(),
          requestOptions
        },
        async ({ site_id }) => {
          try {
            const response = await getClient().sites.scripts.deleteCustomCode(
              site_id,
              requestOptions
            );
            return {
              content: [{ type: "text", text: JSON.stringify("Custom Code Deleted") }],
            };
          } catch (error) {

            // If it's a 404, we'll try to clear the scripts another way
            if (isApiError(error) && error.status === 404) {
              
              return {
                content: [{ type: "text", text: error.message ?? "No custom code found" }],
              };
            }
            throw error;
          }
        }
      );
      
      function isApiError(error: unknown): error is { status: number; message?: string } {
        return typeof error === "object" && error !== null && "status" in error;
      }
    }

