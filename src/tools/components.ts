import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod/v3";
import { requestOptions } from "../mcp";
import {
  ComponentDomWriteNodesItemSchema,
  ComponentPropertyUpdateSchema,
} from "../schemas";
import {
  type Content,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils";

export function registerComponentsTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const listComponents = async (arg: {
    site_id: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await getClient().components.list(
      arg.site_id,
      {
        limit: arg.limit,
        offset: arg.offset,
      },
      requestOptions
    );
    return response;
  };

  const getComponentContent = async (arg: {
    site_id: string;
    component_id: string;
    localeId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await getClient().components.getContent(
      arg.site_id,
      arg.component_id,
      {
        localeId: arg.localeId,
        limit: arg.limit,
        offset: arg.offset,
      },
      requestOptions
    );
    return response;
  };

  const updateComponentContent = async (arg: {
    site_id: string;
    component_id: string;
    localeId: string;
    nodes: any;
  }) => {
    const response = await getClient().components.updateContent(
      arg.site_id,
      arg.component_id,
      {
        localeId: arg.localeId,
        nodes: arg.nodes,
      },
      requestOptions
    );
    return response;
  };

  const getComponentProperties = async (arg: {
    site_id: string;
    component_id: string;
    localeId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await getClient().components.getProperties(
      arg.site_id,
      arg.component_id,
      {
        localeId: arg.localeId,
        limit: arg.limit,
        offset: arg.offset,
      },
      requestOptions
    );
    return response;
  };

  const updateComponentProperties = async (arg: {
    site_id: string;
    component_id: string;
    localeId: string;
    properties: any;
  }) => {
    const response = await getClient().components.updateProperties(
      arg.site_id,
      arg.component_id,
      {
        localeId: arg.localeId,
        properties: arg.properties,
      },
      requestOptions
    );
    return response;
  };

  server.registerTool(
    "data_components_tool",
    {
      title: "Data Components Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Data tool - Components tool to perform actions like list components, get component content, update component content, get component properties, and update component properties",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // GET https://api.webflow.com/v2/sites/:site_id/components
              list_components: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the Site."),
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
                })
                .optional()
                .describe(
                  "List all components in a site. Returns component metadata including IDs, names, and versions."
                ),
              // GET https://api.webflow.com/v2/sites/:site_id/components/:component_id/dom
              get_component_content: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the Site."),
                  component_id: z
                    .string()
                    .describe("Unique identifier for the Component."),
                  localeId: z
                    .string()
                    .optional()
                    .describe(
                      "Unique identifier for a specific locale. Applicable when using localization."
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
                })
                .optional()
                .describe(
                  "Get the content structure and data for a specific component including text, images, and nested components."
                ),
              // POST https://api.webflow.com/v2/sites/:site_id/components/:component_id/dom
              update_component_content: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the Site."),
                  component_id: z
                    .string()
                    .describe("Unique identifier for the Component."),
                  localeId: z
                    .string()
                    .describe(
                      "Unique identifier for a specific locale. Applicable when using localization."
                    ),
                  nodes: ComponentDomWriteNodesItemSchema,
                })
                .optional()
                .describe(
                  "Update content on a component in secondary locales by modifying text nodes and property overrides."
                ),
              // GET https://api.webflow.com/v2/sites/:site_id/components/:component_id/properties
              get_component_properties: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the Site."),
                  component_id: z
                    .string()
                    .describe("Unique identifier for the Component."),
                  localeId: z
                    .string()
                    .optional()
                    .describe(
                      "Unique identifier for a specific locale. Applicable when using localization."
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
                })
                .optional()
                .describe(
                  "Get component properties including default values and configuration for a specific component."
                ),
              // POST https://api.webflow.com/v2/sites/:site_id/components/:component_id/properties
              update_component_properties: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the Site."),
                  component_id: z
                    .string()
                    .describe("Unique identifier for the Component."),
                  localeId: z
                    .string()
                    .describe(
                      "Unique identifier for a specific locale. Applicable when using localization."
                    ),
                  properties: ComponentPropertyUpdateSchema,
                })
                .optional()
                .describe(
                  "Update component properties for localization to customize behavior in different languages."
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.list_components,
                  d.get_component_content,
                  d.update_component_content,
                  d.get_component_properties,
                  d.update_component_properties,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of list_components, get_component_content, update_component_content, get_component_properties, update_component_properties.",
              }
            )
        ),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_components) {
            const content = await listComponents(action.list_components);
            result.push(textContent(content));
          }
          if (action.get_component_content) {
            const content = await getComponentContent(
              action.get_component_content
            );
            result.push(textContent(content));
          }
          if (action.update_component_content) {
            const content = await updateComponentContent(
              action.update_component_content
            );
            result.push(textContent(content));
          }
          if (action.get_component_properties) {
            const content = await getComponentProperties(
              action.get_component_properties
            );
            result.push(textContent(content));
          }
          if (action.update_component_properties) {
            const content = await updateComponentProperties(
              action.update_component_properties
            );
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
