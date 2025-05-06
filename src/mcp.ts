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
      site_id: z.string().describe( "Unique identifier for the site."),
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
      site_id: z.string().describe( "Unique identifier for the site."),
      customDomains: z.string().array().optional().describe( "Array of custom domains to publish the site to."),
      publishToWebflowSubdomain: z.boolean().optional().default(false).describe("Whether to publish to the Webflow subdomain."),
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
      site_id: z.string().describe("The site’s unique ID, used to list its pages."),
      localeId: z.string().optional().describe("Unique identifier for a specific locale. Applicable when using localization."),
      limit: z.number().optional().describe("Maximum number of records to be returned (max limit: 100)"),
      offset: z.number().optional().describe("Offset used for pagination if the results have more than limit records."),
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
      localeId: z.string().optional().describe("Unique identifier for a specific locale. Applicable when using localization."),
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
    slug: z.string().optional().describe("Slug of the page (derived from title)."),
    parentId: z.string().optional().describe("Unique identifier for the parent folder."),
    collectionId: z.string().optional().describe("Unique identifier for the linked collection, NULL id the Page is not part of a collection."),
    createdOn: z.date().optional().describe("Date when the page was created."),
    lastUpdated: z.date().optional().describe("Date when the page was last updated."),
    archived: z.boolean().optional().describe("Indicates if the page is archived."),
    draft: z.boolean().optional().describe("Indicates if the page is a draft."),
    canBranch: z.boolean().optional().describe("Indicates if the page can be branched."),
    isBranch: z.boolean().optional().describe("Indicates if the page is Branch of another page."),
    isMembersOnly: z.boolean().optional().describe("Indicates whether the Page is restricted by Memberships Controls."),
    seo: z
      .object({
        title: z.string().optional().describe("The Page title shown in search engine results."),
        description: z.string().optional().describe("The Page description shown in search engine results."),
      })
      .optional().describe("SEO-related fields for the page."),
    openGraph: z
      .object({
        title: z.string().optional().describe("The title supplied to Open Graph annotations."),
        titleCopied: z.boolean().optional().describe("Indicates the Open Graph title was copied from the SEO title."),
        description: z.string().optional().describe("The description supplied to Open Graph annotations."),
        descriptionCopied: z.boolean().optional().describe("Indicates the Open Graph description was copied from the SEO description."),
      })
      .optional(),
    localeId: z.string().optional().describe("Unique identifier for the page locale. Applicable when using localization."),
    publishedPath: z.string().optional().describe("Relative path of the published page."),
  });

  // PUT https://api.webflow.com/v2/pages/:page_id
  server.tool(
    "pages_update_page_settings",
    "Update page settings including SEO metadata, Open Graph data, slug, and publishing status.",
    {
      page_id: z.string().describe("Unique identifier for the page."),
      localeId: z.string().optional().describe("Unique identifier for a specific locale. Applicable when using localization."),
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
      localeId: z.string().optional().describe("Unique identifier for a specific locale. Applicable when using localization."),
      limit: z.number().optional().describe("Maximum number of records to be returned (max limit: 100)"),
      offset: z.number().optional().describe("Offset used for pagination if the results have more than limit records."),
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
        nodeId: z.string().describe("Unique identifier for the node."),
        text: z.string().describe("HTML content of the node, including the HTML tag. The HTML tags must be the same as what’s returned from the Get Content endpoint."),
      }).describe("Text node to be updated."),
      z.object({
        nodeId: z.string().describe("Unique identifier for the node."),
        propertyOverrides: z.array(
          z.object({
            propertyId: z.string().describe("Unique identifier for the property."),
            text: z.string().describe("Value used to override a component property; must be type-compatible to prevent errors."),
          }).describe("Properties to override for this locale’s component instances."),
        ),
      }).describe("Update text property overrides of a component instance."),
    ])
    .array();

  // POST https://api.webflow.com/v2/pages/:page_id/dom
  server.tool(
    "pages_update_static_content",
    "Update content on a static page in secondary locales by modifying text nodes and property overrides.",
    {
      page_id: z.string().describe("Unique identifier for the page."),
      localeId: z.string().describe("Unique identifier for a specific locale. Applicable when using localization."),
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
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
    isEditable: z.boolean().optional().describe("Indicates if the field is editable."),
    isRequired: z.boolean().optional().describe("Indicates if the field is required."),
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
    ]).describe("Type of the field. Choose of these appropriate field types."),
    displayName: z.string().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
  });

  const OptionFieldSchema = z.object({
    id: z.string().optional().describe("Unique identifier for the Field."),
    isEditable: z.boolean().optional().describe("Indicates if the field is editable."),
    isRequired: z.boolean().optional().describe("Indicates if the field is required."),
    type: z.literal("Option").describe("Type of the field. Set this to \"Option\"."),
    displayName: z.string().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
    metadata: z.object({
      options: z.array(
        z.object({
          name: z.string().describe("Name of the option."),
          id: z.string().optional().describe("Unique identifier for the option."),
        }).describe("Array of options for the field."),
      ),
    }),
  });

  const ReferenceFieldSchema = z.object({
    id: z.string().optional().describe("Unique identifier for the Field."),
    isEditable: z.boolean().optional().describe("Indicates if the field is editable."),
    isRequired: z.boolean().optional().describe("Indicates if the field is required."),
    type: z.union([z.literal("MultiReference"), z.literal("Reference")]).describe("Type of the field. Choose of these appropriate field types."),
    displayName: z.string().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
    metadata: z.object({
      collectionId: z.string(),
    }).describe("ID of the referenced collection. Use this only for Reference and MultiReference fields."),
  });

  // request: Webflow.CollectionsCreateRequest
  // NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
  const WebflowCollectionsCreateRequestSchema = z.object({
    displayName: z.string().describe("Name of the collection. Each collection must have a unique name within the site."),
    singularName: z.string().describe("Singular name of the collection."),
    slug: z.string().optional().describe("Slug of the collection in the site URL structure. "),
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
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
    isRequired: z.boolean().optional().describe("Indicates if the field is required in a collection."),
    displayName: z.string().optional().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
  }).describe("Request schema to update collection field metadata.");

  // PATCH https://api.webflow.com/v2/collections/:collection_id/fields/:field_id
  server.tool(
    "collection_fields_update",
    "Update properties of an existing field in a CMS collection.",
    {
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
          cmsLocaleId: z.string().optional().describe("Unique identifier for the locale of the CMS Item."),
          lastPublished: z.string().optional().describe("Date when the item was last published."),
          lastUpdated: z.string().optional().describe("Date when the item was last updated."),
          createdOn: z.string().optional().describe("Date when the item was created."),
          isArchived: z.boolean().optional().describe("Indicates if the item is archived."),
          isDraft: z.boolean().optional().describe("Indicates if the item is a draft."),
          fieldData: z.record(z.any()).and(
            z.object({
              name: z.string().describe("Name of the field."),
              slug: z.string().describe("URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."),
            })
          ),
        })
      )
      .optional().describe("Array of items to be created."),
  });

  // POST https://api.webflow.com/v2/collections/:collection_id/items/live
  // NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
  server.tool(
    "collections_items_create_item_live",
    "Create and publish new items in a CMS collection directly to the live site.",
    {
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
          cmsLocaleId: z.string().optional().describe("Unique identifier for the locale of the CMS Item."),
          lastPublished: z.string().optional().describe("Date when the item was last published."),
          lastUpdated: z.string().optional().describe("Date when the item was last updated."),
          createdOn: z.string().optional().describe("Date when the item was created."),
          isArchived: z.boolean().optional().describe("Indicates if the item is archived."),
          isDraft: z.boolean().optional().describe("Indicates if the item is a draft."),
          fieldData: z
            .record(z.any())
            .and(
              z.object({
                name: z.string().optional().describe("Name of the field."),
                slug: z.string().optional().describe("URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."),
              })
            )
            .optional().describe("Array of items to be updated."),
        })
      )
      .optional(),
  });

  // PATCH https://api.webflow.com/v2/collections/:collection_id/items/live
  server.tool(
    "collections_items_update_items_live",
    "Update and publish existing items in a CMS collection directly to the live site.",
    {
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
      collection_id: z.string().describe("Unique identifier for the Collection."),
      cmsLocaleId: z.string().optional().describe("Unique identifier for the locale of the CMS Item."),
      limit: z.number().optional().describe("Maximum number of records to be returned (max limit: 100)"),
      offset: z.number().optional().describe("Offset used for pagination if the results have more than limit records."),
      name: z.string().optional().describe("Name of the field."),
      slug: z.string().optional().describe("URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."),
      sortBy: z.enum(["lastPublished", "name", "slug"]).optional().describe("Field to sort the items by. Allowed values: lastPublished, name, slug."),
      sortOrder: z.enum(["asc", "desc"]).optional().describe("Order to sort the items by. Allowed values: asc, desc."),
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
    id: z.string().describe("Unique identifier for the item."),
    cmsLocaleId: z.string().optional().describe("Unique identifier for the locale of the CMS Item."),
    lastPublished: z.string().optional().describe("Date when the item was last published."),
    lastUpdated: z.string().optional().describe("Date when the item was last updated."),
    createdOn: z.string().optional().describe("Date when the item was created."),
    isArchived: z.boolean().optional().describe("Indicates if the item is archived."),
    isDraft: z.boolean().optional().describe("Indicates if the item is a draft."),
    fieldData: z.record(z.any()).and(
      z.object({
        name: z.string().describe("Name of the field."),
        slug: z.string().describe("URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."),
      })
    ),
  }).describe("Collection item update request schema.");

  // request: Webflow.collections.ItemsUpdateItemsRequest
  const WebflowCollectionsItemsUpdateItemsRequestSchema = z.object({
    items: z.array(CollectionItemWithIdInputSchema).optional(),
  });

  // PATCH https://api.webflow.com/v2/collections/:collection_id/items
  server.tool(
    "collections_items_update_items",
    "Update existing items in a CMS collection as drafts.",
    {
      collection_id: z.string().describe("Unique identifier for the Collection."),
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
      collection_id: z.string().describe("Unique identifier for the Collection."),
      itemIds: z.array(z.string()).describe("Array of item IDs to be published."),
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
    "List all registered scripts for a site. To apply a script to a site or page, first register it via the Register Script endpoints, then apply it using the relevant Site or Page endpoints.",
    {
      site_id: z.string().describe("Unique identifier for the site."),
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
      "Get all scripts applied to a site by the App. To apply a script to a site or page, first register it via the Register Script endpoints, then apply it using the relevant Site or Page endpoints.",
      {
        site_id: z.string().describe("Unique identifier for the site."),
      },
      async ({ site_id }) => {
        const response = await getClient().sites.scripts.getCustomCode(
          site_id,
          requestOptions
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      }
    );

  const RegisterInlineSiteScriptSchema = z.object({
    sourceCode: z.string().describe("The inline script source code (hosted by Webflow). Inline scripts are limited to 2000 characters."),
    version: z.string().describe("A Semantic Version (SemVer) string, denoting the version of the script."),
    canCopy: z.boolean().optional().describe("Indicates whether the script can be copied on site duplication and transfer."),
    displayName: z.string().describe("User-facing name for the script. Must be between 1 and 50 alphanumeric characters."),
    location: z.string().optional().describe("Location where the script is applied. Allowed values: \"header\", \"footer\"."),
    attributes: z.record(z.any()).optional().describe("Developer-specified key/value pairs to be applied as attributes to the script."),
  }).describe("Request schema to register an inline script for a site.");


  // POST https://api.webflow.com/v2/sites/:site_id/registered_scripts/inline
  server.tool(
    "add_inline_site_script",
    "Register an inline script for a site. Inline scripts are limited to 2000 characters. ", 
    {
      site_id: z.string().describe("Unique identifier for the site."),
      request: RegisterInlineSiteScriptSchema,
    },
    async ({ site_id, request }) => {

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
      
      });

      server.tool(
        "delete_site_script",
        {
          site_id: z.string()
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

