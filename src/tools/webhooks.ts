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

export function registerWebhookTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const listWebhooks = async (arg: { site_id: string }) => {
    const response = await getClient().webhooks.list(
      arg.site_id,
      requestOptions
    );
    return response;
  };

  const createWebhook = async (arg: {
    site_id: string;
    trigger_type: string;
    url: string;
    filter?: { name?: string };
  }) => {
    const response = await getClient().webhooks.create(
      arg.site_id,
      {
        triggerType: arg.trigger_type as any,
        url: arg.url,
        filter: arg.filter,
      },
      requestOptions
    );
    return response;
  };

  const getWebhook = async (arg: { webhook_id: string }) => {
    const response = await getClient().webhooks.get(
      arg.webhook_id,
      requestOptions
    );
    return response;
  };

  const deleteWebhook = async (arg: { webhook_id: string }) => {
    const response = await getClient().webhooks.delete(
      arg.webhook_id,
      requestOptions
    );
    return response;
  };

  server.registerTool(
    "data_webhook_tool",
    {
      title: "Data Webhook Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Data tool - Webhook tool to perform actions like list webhooks, create webhooks, get webhook details, and delete webhooks for a Webflow site.",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // GET https://api.webflow.com/v2/sites/:site_id/webhooks
              list_webhooks: z
                .object({
                  site_id: z
                    .string()
                    .describe(
                      "The site's unique ID, used to list its registered webhooks."
                    ),
                })
                .optional()
                .describe(
                  "List all App-created webhooks registered for a given site. Returns webhook details including trigger type, URL, and creation date."
                ),
              // POST https://api.webflow.com/v2/sites/:site_id/webhooks
              create_webhook: z
                .object({
                  site_id: z
                    .string()
                    .describe(
                      "The site's unique ID, used to create a webhook for this site."
                    ),
                  trigger_type: z
                    .enum([
                      "form_submission",
                      "site_publish",
                      "page_created",
                      "page_metadata_updated",
                      "page_deleted",
                      "ecomm_new_order",
                      "ecomm_order_changed",
                      "ecomm_inventory_changed",
                      "user_account_added",
                      "user_account_updated",
                      "user_account_deleted",
                      "collection_item_created",
                      "collection_item_changed",
                      "collection_item_deleted",
                      "collection_item_published",
                      "collection_item_unpublished",
                      "comment_created",
                    ])
                    .describe(
                      "The type of event that triggers the webhook. Choose from 17 supported trigger types."
                    ),
                  url: z
                    .string()
                    .url()
                    .describe(
                      "The URL that will receive the webhook POST request when the event is triggered."
                    ),
                  filter: z
                    .object({
                      name: z
                        .string()
                        .optional()
                        .describe(
                          "The name of the form to receive notifications for."
                        ),
                    })
                    .optional()
                    .describe(
                      "Only supported for the 'form_submission' trigger type. Filter for a specific form by name."
                    ),
                })
                .optional()
                .describe(
                  "Create a new webhook for a site. Limit of 75 registrations per trigger type, per site."
                ),
              // GET https://api.webflow.com/v2/webhooks/:webhook_id
              get_webhook: z
                .object({
                  webhook_id: z
                    .string()
                    .describe(
                      "The webhook's unique ID, used to retrieve its details."
                    ),
                })
                .optional()
                .describe(
                  "Get detailed information about a specific webhook including its trigger type, URL, and last triggered date."
                ),
              // DELETE https://api.webflow.com/v2/webhooks/:webhook_id
              delete_webhook: z
                .object({
                  webhook_id: z
                    .string()
                    .describe(
                      "The webhook's unique ID, used to identify which webhook to remove."
                    ),
                })
                .optional()
                .describe("Remove a webhook registration."),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.list_webhooks,
                  d.create_webhook,
                  d.get_webhook,
                  d.delete_webhook,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of list_webhooks, create_webhook, get_webhook, delete_webhook.",
              }
            )
        ),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_webhooks) {
            const content = await listWebhooks(action.list_webhooks);
            result.push(textContent(content));
          }
          if (action.create_webhook) {
            const content = await createWebhook(action.create_webhook);
            result.push(textContent(content));
          }
          if (action.get_webhook) {
            const content = await getWebhook(action.get_webhook);
            result.push(textContent(content));
          }
          if (action.delete_webhook) {
            const content = await deleteWebhook(action.delete_webhook);
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
