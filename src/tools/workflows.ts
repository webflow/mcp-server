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

async function apiRequest(
  method: string,
  path: string,
  token: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const response = await fetch(`${WEBFLOW_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...requestOptions.headers,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

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
        readOnlyHint: false,
        openWorldHint: false,
      },
      description:
        "Data tool - Workflows tool to list AI workflows, create a workflow from a template, execute a workflow, and poll execution status.",
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
              // POST https://api.webflow.com/v2/sites/:site_id/workflows/:workflow_id/execute
              execute_workflow: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  workflow_id: z
                    .string()
                    .describe("Unique identifier for the workflow to execute."),
                })
                .optional()
                .describe(
                  "Execute an AI workflow. The workflow must be active. Returns an execution_id to poll with get_workflow_execution_status."
                ),
              // GET https://api.webflow.com/v2/sites/:site_id/workflows/executions/:execution_id
              get_workflow_execution_status: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  execution_id: z
                    .string()
                    .describe(
                      "Execution ID returned by execute_workflow. Poll until isFinished is true."
                    ),
                })
                .optional()
                .describe(
                  "Get the status of a workflow execution. Returns status, start/stop times, and isFinished."
                ),
              // POST https://api.webflow.com/v2/sites/:site_id/workflows
              create_workflow: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  template_slug: z
                    .string()
                    .describe(
                      "Template slug to create the workflow from (e.g. 'content-brief-generator')."
                    ),
                })
                .optional()
                .describe(
                  "Create a new AI workflow for a site from a template. Returns the created workflow's ID, name, active status, and template slug."
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.list_workflows,
                  d.execute_workflow,
                  d.get_workflow_execution_status,
                  d.create_workflow,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of list_workflows, execute_workflow, get_workflow_execution_status, create_workflow.",
              }
            )
        ),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_workflows) {
            const content = await apiRequest(
              "GET",
              `/v2/sites/${action.list_workflows.site_id}/workflows`,
              getToken()
            );
            result.push(textContent(content));
          }
          if (action.execute_workflow) {
            const content = await apiRequest(
              "POST",
              `/v2/sites/${action.execute_workflow.site_id}/workflows/${action.execute_workflow.workflow_id}/execute`,
              getToken()
            );
            result.push(textContent(content));
          }
          if (action.get_workflow_execution_status) {
            const content = await apiRequest(
              "GET",
              `/v2/sites/${action.get_workflow_execution_status.site_id}/workflows/executions/${action.get_workflow_execution_status.execution_id}`,
              getToken()
            );
            result.push(textContent(content));
          }
          if (action.create_workflow) {
            const content = await apiRequest(
              "POST",
              `/v2/sites/${action.create_workflow.site_id}/workflows`,
              getToken(),
              { templateSlug: action.create_workflow.template_slug }
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
