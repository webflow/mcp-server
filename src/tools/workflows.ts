import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";
import { requestOptions } from "../mcp";
import {
  type Content,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils";

const WEBFLOW_API_BASE = "https://api.webflow.com";

async function listWorkflows(arg: {
  site_id: string;
  token: string;
}): Promise<unknown> {
  const response = await fetch(
    `${WEBFLOW_API_BASE}/v2/sites/${arg.site_id}/workflows`,
    {
      headers: {
        Authorization: `Bearer ${arg.token}`,
        ...requestOptions.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      name: "WebflowApiError",
      status: response.status,
      ...error,
    });
  }

  return response.json();
}

export function registerWorkflowsTools(
  server: McpServer,
  getToken: () => string
) {
  server.registerTool(
    "data_workflows_tool",
    {
      title: "Data Workflows Tool",
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      description:
        "Data tool - Workflows tool to perform actions like listing AI workflows configured for a site.",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // GET https://api.webflow.com/v2/sites/:site_id/workflows
              list_workflows: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                })
                .optional()
                .describe(
                  "List all AI workflows configured for a site. Returns each workflow's ID, name, active status, and template slug."
                ),
            })
            .strict()
            .refine((d) => [d.list_workflows].filter(Boolean).length >= 1, {
              message: "Provide at least one of list_workflows.",
            })
        ),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_workflows) {
            const content = await listWorkflows({
              site_id: action.list_workflows.site_id,
              token: getToken(),
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
