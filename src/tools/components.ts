import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";
import { requestOptions } from "../mcp";
import {
  ComponentDomWriteNodesItemSchema,
  ComponentPropertyUpdateSchema
} from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export function registerComponentsTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  // GET https://api.webflow.com/v2/sites/:site_id/components
  server.tool(
    "components_list",
    "List all components in a site. Returns component metadata including IDs, names, and versions.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
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
    async ({ site_id, limit, offset }) => {
      try {
        const response = await getClient().components.list(
          site_id,
          {
            limit,
            offset,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET https://api.webflow.com/v2/sites/:site_id/components/:component_id/dom
  server.tool(
    "components_get_content",
    "Get the content structure and data for a specific component including text, images, and nested components.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
      component_id: z.string().describe("Unique identifier for the Component."),
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
    async ({ site_id, component_id, localeId, limit, offset }) => {
      try {
        const response = await getClient().components.getContent(
          site_id,
          component_id,
          {
            localeId,
            limit,
            offset,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/sites/:site_id/components/:component_id/dom
  server.tool(
    "components_update_content",
    "Update content on a component in secondary locales by modifying text nodes and property overrides.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
      component_id: z.string().describe("Unique identifier for the Component."),
      localeId: z
        .string()
        .describe(
          "Unique identifier for a specific locale. Applicable when using localization."
        ),
      nodes: ComponentDomWriteNodesItemSchema,
    },
    async ({ site_id, component_id, localeId, nodes }) => {
      try {
        const response = await getClient().components.updateContent(
          site_id,
          component_id,
          {
            localeId,
            nodes,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET https://api.webflow.com/v2/sites/:site_id/components/:component_id/properties
  server.tool(
    "components_get_properties",
    "Get component properties including default values and configuration for a specific component.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
      component_id: z.string().describe("Unique identifier for the Component."),
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
    async ({ site_id, component_id, localeId, limit, offset }) => {
      try {
        const response = await getClient().components.getProperties(
          site_id,
          component_id,
          {
            localeId,
            limit,
            offset,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // POST https://api.webflow.com/v2/sites/:site_id/components/:component_id/properties
  server.tool(
    "components_update_properties",
    "Update component properties for localization to customize behavior in different languages.",
    {
      site_id: z.string().describe("Unique identifier for the Site."),
      component_id: z.string().describe("Unique identifier for the Component."),
      localeId: z
        .string()
        .describe(
          "Unique identifier for a specific locale. Applicable when using localization."
        ),
      properties: ComponentPropertyUpdateSchema,
    },
    async ({ site_id, component_id, localeId, properties }) => {
      try {
        const response = await getClient().components.updateProperties(
          site_id,
          component_id,
          {
            localeId,
            properties,
          },
          requestOptions
        );
        return formatResponse(response);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
