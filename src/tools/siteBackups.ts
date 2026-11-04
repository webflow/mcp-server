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
// Backups have no stored source, so the name is the only way to tell an MCP
// backup apart in the site's backups list.
const DEFAULT_BACKUP_DESCRIPTION = "MCP backup";

async function apiRequest(
  method: string,
  path: string,
  getToken: () => string,
  body?: unknown,
): Promise<any> {
  const token = getToken();
  const response = await fetch(`${WEBFLOW_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...requestOptions.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

async function handleSiteBackupActions(
  actions: Array<{
    create_site_backup?: { site_id: string; description?: string };
    get_site_backup_task?: { site_id: string; task_id: string };
    list_site_backups?: { site_id: string; limit?: number; offset?: number };
    get_site_backup?: { site_id: string; backup_id: string };
  }>,
  getToken: () => string,
): Promise<Content[]> {
  const result: Content[] = [];
  for (const action of actions) {
    if (action.create_site_backup) {
      const { site_id, description } = action.create_site_backup;
      result.push(
        textContent(
          await apiRequest("POST", `/v2/sites/${site_id}/backups`, getToken, {
            description: description ?? DEFAULT_BACKUP_DESCRIPTION,
          }),
        ),
      );
    }
    if (action.get_site_backup_task) {
      const { site_id, task_id } = action.get_site_backup_task;
      result.push(
        textContent(
          await apiRequest(
            "GET",
            `/v2/sites/${site_id}/backups/tasks/${task_id}`,
            getToken,
          ),
        ),
      );
    }
    if (action.list_site_backups) {
      const { site_id, limit, offset } = action.list_site_backups;
      const query = new URLSearchParams();
      if (limit !== undefined) query.set("limit", String(limit));
      if (offset !== undefined) query.set("offset", String(offset));
      const qs = query.toString();
      const response = await apiRequest(
        "GET",
        `/v2/sites/${site_id}/backups${qs ? `?${qs}` : ""}`,
        getToken,
      );
      result.push(
        textContent(
          response?.backups?.length === 0 && !offset
            ? "No backups exist for this site."
            : response,
        ),
      );
    }
    if (action.get_site_backup) {
      const { site_id, backup_id } = action.get_site_backup;
      result.push(
        textContent(
          await apiRequest(
            "GET",
            `/v2/sites/${site_id}/backups/${backup_id}`,
            getToken,
          ),
        ),
      );
    }
  }
  return result;
}

export function registerSiteBackupsTools(
  server: McpServer,
  getToken: () => string,
) {
  server.registerTool(
    "data_site_backups_tool",
    {
      title: "Data Site Backups Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Data tool - Site backups tool to create a backup of a Webflow site, check a backup's progress, list a site's backups, and get a backup's details.",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // POST https://api.webflow.com/v2/sites/:site_id/backups
              create_site_backup: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site to back up."),
                  description: z
                    .string()
                    .min(1)
                    .max(256)
                    .optional()
                    .describe(
                      `Name shown for the backup in the site's backups list. Defaults to "${DEFAULT_BACKUP_DESCRIPTION}".`,
                    ),
                })
                .optional()
                .describe(
                  "Start a backup of the site. Returns a taskId to poll with get_site_backup_task. If a backup is already running, returns that backup's task instead of starting another.",
                ),
              // GET https://api.webflow.com/v2/sites/:site_id/backups/tasks/:task_id
              get_site_backup_task: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  task_id: z
                    .string()
                    .describe("Task ID returned by create_site_backup."),
                })
                .optional()
                .describe(
                  "Get the status of a backup task. Poll until status is finished or failed. A finished task includes the backup's id; a failed task includes an error code and message.",
                ),
              // GET https://api.webflow.com/v2/sites/:site_id/backups
              list_site_backups: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  limit: z
                    .number()
                    .int()
                    .min(1)
                    .max(100)
                    .optional()
                    .describe(
                      "Maximum number of backups to return. Default 25.",
                    ),
                  offset: z
                    .number()
                    .int()
                    .min(0)
                    .optional()
                    .describe("Number of backups to skip, for pagination."),
                })
                .optional()
                .describe(
                  "List the site's backups, newest first. Each backup has its id, description, size, page count, and creation date.",
                ),
              // GET https://api.webflow.com/v2/sites/:site_id/backups/:backup_id
              get_site_backup: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  backup_id: z
                    .string()
                    .describe("Unique identifier for the backup."),
                })
                .optional()
                .describe(
                  "Get a backup's details, including counts of elements, styles, components, and CMS items.",
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.create_site_backup,
                  d.get_site_backup_task,
                  d.list_site_backups,
                  d.get_site_backup,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of create_site_backup, get_site_backup_task, list_site_backups, get_site_backup.",
              },
            ),
        ),
      },
    },
    async ({ actions }) => {
      try {
        const result = await handleSiteBackupActions(actions, getToken);
        return toolResponse(result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
