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
    execute_workflow?: { site_id: string; workflow_id: string };
    get_workflow_execution_status?: { site_id: string; execution_id: string };
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
    if (action.execute_workflow) {
      result.push(
        await apiRequest(
          "POST",
          `/v2/sites/${action.execute_workflow.site_id}/workflows/${action.execute_workflow.workflow_id}/execute`,
          getToken
        )
      );
    }
    if (action.get_workflow_execution_status) {
      result.push(
        await apiRequest(
          "GET",
          `/v2/sites/${action.get_workflow_execution_status.site_id}/workflows/executions/${action.get_workflow_execution_status.execution_id}`,
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
        "Data tool - Workflows tool to list AI workflows, execute a workflow, and poll execution status.",
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
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.list_workflows,
                  d.execute_workflow,
                  d.get_workflow_execution_status,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of list_workflows, execute_workflow, get_workflow_execution_status.",
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
