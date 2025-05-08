import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { z } from "zod";
import { requestOptions } from "../mcp";
import { formatResponse } from "../utils";

export function registerSiteTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  // GET https://api.webflow.com/v2/sites
  server.tool(
    "sites_list",
    "List all sites accessible to the authenticated user. Returns basic site information including site ID, name, and last published date.",
    async () => {
      const response = await getClient().sites.list(requestOptions);
      return formatResponse(response);
    }
  );

  // GET https://api.webflow.com/v2/sites/:site_id
  server.tool(
    "sites_get",
    "Get detailed information about a specific site including its settings, domains, and publishing status.",
    {
      site_id: z.string().describe("Unique identifier for the site."),
    },
    async ({ site_id }) => {
      const response = await getClient().sites.get(site_id, requestOptions);
      return formatResponse(response);
    }
  );

  // POST https://api.webflow.com/v2/sites/:site_id/publish
  server.tool(
    "sites_publish",
    "Publish a site to specified domains. This will make the latest changes live on the specified domains.",
    {
      site_id: z.string().describe("Unique identifier for the site."),
      customDomains: z
        .string()
        .array()
        .optional()
        .describe("Array of custom domains to publish the site to."),
      publishToWebflowSubdomain: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to publish to the Webflow subdomain."),
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
      return formatResponse(response);
    }
  );
}
