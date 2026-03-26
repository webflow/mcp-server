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
  getToken: () => string
): Promise<Content> {
  const token = getToken();
  const response = await fetch(`${WEBFLOW_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...requestOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      name: "WebflowApiError",
      status: response.status,
      ...error,
    });
  }

  return textContent(await response.json());
}

async function handleWorkflowActions(
  actions: Array<{
    list_workflows?: { site_id: string };
    run_workflow?: { site_id: string; workflow_id: string };
    list_workflow_runs?: { site_id: string; workflow_id: string };
    get_workflow_run?: { site_id: string; workflow_id: string; run_id: string };
  }>,
  getToken: () => string
): Promise<Content[]> {
  const result: Content[] = [];
  for (const action of actions) {
    if (action.list_workflows) {
      result.push(
        await apiRequest(
          "GET",
          `/v2/sites/${action.list_workflows.site_id}/workflows`,
          getToken
        )
      );
    }
    if (action.run_workflow) {
      result.push(
        await apiRequest(
          "POST",
          `/v2/sites/${action.run_workflow.site_id}/workflows/${action.run_workflow.workflow_id}/run`,
          getToken
        )
      );
    }
    if (action.list_workflow_runs) {
      result.push(
        await apiRequest(
          "GET",
          `/v2/sites/${action.list_workflow_runs.site_id}/workflows/${action.list_workflow_runs.workflow_id}/runs`,
          getToken
        )
      );
    }
    if (action.get_workflow_run) {
      result.push(
        await apiRequest(
          "GET",
          `/v2/sites/${action.get_workflow_run.site_id}/workflows/${action.get_workflow_run.workflow_id}/runs/${action.get_workflow_run.run_id}`,
          getToken
        )
      );
    }
  }
  return result;
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
        "Data tool - Workflows tool to list AI workflows, run a workflow, list workflow runs, and get a workflow run.",
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
              // GET https://api.webflow.com/v2/sites/:site_id/workflows/:workflow_id/runs
              list_workflow_runs: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  workflow_id: z
                    .string()
                    .describe("Unique identifier for the workflow."),
                })
                .optional()
                .describe(
                  "List the run history for a workflow. Returns all runs with their status, start/stop times, and isFinished."
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
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.list_workflows,
                  d.run_workflow,
                  d.list_workflow_runs,
                  d.get_workflow_run,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of list_workflows, run_workflow, list_workflow_runs, get_workflow_run.",
              }
            )
        ),
      },
    },
    async ({ actions }) => {
      try {
        const result = await handleWorkflowActions(actions, getToken);
        return toolResponse(result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
