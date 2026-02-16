import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod/v3";
import { requestOptions } from "../mcp";
import {
  type Content,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils";

export function registerSiteTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const listSites = async () => {
    const response = await getClient().sites.list(requestOptions);
    return response;
  };

  const getSite = async (arg: { site_id: string }) => {
    const response = await getClient().sites.get(arg.site_id, requestOptions);
    return response;
  };

  const publishSite = async (arg: {
    site_id: string;
    customDomains?: string[];
    publishToWebflowSubdomain?: boolean;
  }) => {
    const response = await getClient().sites.publish(
      arg.site_id,
      {
        customDomains: arg.customDomains,
        publishToWebflowSubdomain: arg.publishToWebflowSubdomain,
      },
      requestOptions
    );
    return response;
  };

  server.registerTool(
    "data_sites_tool",
    {
      title: "Data Sites Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Data tool - Sites tool to perform actions like list sites, get site details, and publish sites",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // GET https://api.webflow.com/v2/sites
              list_sites: z
                .object({})
                .optional()
                .describe(
                  "List all sites accessible to the authenticated user. Returns basic site information including site ID, name, and last published date."
                ),
              // GET https://api.webflow.com/v2/sites/:site_id
              get_site: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                })
                .optional()
                .describe(
                  "Get detailed information about a specific site including its settings, domains, and publishing status."
                ),
              // POST https://api.webflow.com/v2/sites/:site_id/publish
              publish_site: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  customDomains: z
                    .array(z.string())
                    .optional()
                    .describe(
                      "Array of custom domains to publish the site to."
                    ),
                  publishToWebflowSubdomain: z
                    .boolean()
                    .optional()
                    .describe("Whether to publish to the Webflow subdomain."),
                })
                .optional()
                .describe(
                  "Publish a site to specified domains. This will make the latest changes live on the specified domains."
                ),
            })
            .strict()
            .refine(
              (d) =>
                [d.list_sites, d.get_site, d.publish_site].filter(Boolean)
                  .length === 1,
              {
                message:
                  "Provide exactly one of list_sites, get_site, publish_site.",
              }
            )
        ),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_sites) {
            const content = await listSites();
            result.push(textContent(content));
          }
          if (action.get_site) {
            const content = await getSite(action.get_site);
            result.push(textContent(content));
          }
          if (action.publish_site) {
            const content = await publishSite(action.publish_site);
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
