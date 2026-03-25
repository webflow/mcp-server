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
        "Data tool - Workflows tool to list AI workflows, create a workflow from a template, run a workflow, and get a workflow run.",
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
              // POST https://api.webflow.com/v2/sites/:site_id/workflows/:workflow_id/run
              run_workflow: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  workflow_id: z
                    .string()
                    .describe("Unique identifier for the workflow to run."),
                })
                .optional()
                .describe(
                  "Run an AI workflow. The workflow must be active. Returns a run_id to poll with get_workflow_run."
                ),
              // GET https://api.webflow.com/v2/sites/:site_id/workflows/:workflow_id/runs/:run_id
              get_workflow_run: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  workflow_id: z
                    .string()
                    .describe("Unique identifier for the workflow."),
                  run_id: z
                    .string()
                    .describe(
                      "Run ID returned by run_workflow. Poll until isFinished is true."
                    ),
                })
                .optional()
                .describe(
                  "Get the status of a workflow run. Returns status, start/stop times, and isFinished."
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
                  d.run_workflow,
                  d.get_workflow_run,
                  d.create_workflow,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of list_workflows, run_workflow, get_workflow_run, create_workflow.",
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
          if (action.run_workflow) {
            const content = await apiRequest(
              "POST",
              `/v2/sites/${action.run_workflow.site_id}/workflows/${action.run_workflow.workflow_id}/run`,
              getToken()
            );
            result.push(textContent(content));
          }
          if (action.get_workflow_run) {
            const content = await apiRequest(
              "GET",
              `/v2/sites/${action.get_workflow_run.site_id}/workflows/${action.get_workflow_run.workflow_id}/runs/${action.get_workflow_run.run_id}`,
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
