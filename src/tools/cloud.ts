import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";
import { requestOptions } from "../mcp";
import {
  type Content,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils";
import { CloudProjectSchema, CloudEnvironmentSchema } from "../schemas";

const WEBFLOW_API_BASE = "https://api.webflow.com";

async function cosmicFetch<T>(
  path: string,
  getToken: () => string,
  options: { method: "GET" | "POST"; body?: object } = { method: "GET" },
): Promise<T> {
  const token = getToken();
  const response = await fetch(`${WEBFLOW_API_BASE}/cosmic${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...requestOptions.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      name: "WebflowCosmicApiError",
      status: response.status,
      ...errorData,
    });
  }

  return response.json() as Promise<T>;
}

// Response types matching the Cloud API

interface Project {
  id: string;
  name: string;
  description: string;
  sourceUrl: string;
  createdAt: string;
}

interface ProjectsResponse {
  projects: Project[];
}

interface ProjectEnvironment {
  id: string;
  branch: string;
  mount: string;
  deployUrl: string | null;
  latestDeploymentStatus: string | null;
}

interface ProjectEnvironmentsResponse {
  environments: ProjectEnvironment[];
}

type SiteKind = "webflow" | "cloudapp" | "template" | "tutorial" | "optimize";

interface WorkspaceSite {
  id: string;
  workspaceId: string;
  displayName: string;
  shortName: string;
  kind: SiteKind;
  createdOn: string;
  lastUpdated: string;
  lastPublished: string;
  previewUrl: string;
}

interface WorkspaceSitesResponse {
  sites: WorkspaceSite[];
}

// Action handlers

async function apiFetch<T>(
  path: string,
  getToken: () => string,
): Promise<T> {
  const token = getToken();
  const response = await fetch(`${WEBFLOW_API_BASE}/v2${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...requestOptions.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      name: "WebflowApiError",
      status: response.status,
      ...errorData,
    });
  }

  return response.json() as Promise<T>;
}

async function listWorkspaceSites(
  getToken: () => string,
  args: { workspace_id: string; kind?: SiteKind },
): Promise<Content> {
  const kind = args.kind ?? "cloudapp";
  const path = `/workspaces/${args.workspace_id}/sites?kind=${kind}`;
  const data = await apiFetch<WorkspaceSitesResponse>(path, getToken);
  return textContent(data);
}

async function listProjects(
  getToken: () => string,
  args: { site_id?: string },
): Promise<Content> {
  const path = args.site_id
    ? `/${args.site_id}/cli-projects`
    : "/cli-projects";
  const data = await cosmicFetch<ProjectsResponse>(path, getToken);
  return textContent(data);
}

async function listEnvironments(
  getToken: () => string,
  args: { project_id: string; site_id?: string },
): Promise<Content> {
  const path = args.site_id
    ? `/${args.site_id}/cli-project-environments/${args.project_id}`
    : `/cli-project-environments/${args.project_id}`;
  const data = await cosmicFetch<ProjectEnvironmentsResponse>(path, getToken);
  return textContent(data);
}

// Tool registration

export function registerCloudTools(
  server: McpServer,
  getToken: () => string,
) {
  server.registerTool(
    "data_cloud_tool",
    {
      title: "Data Cloud Tool",
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
      description:
        "Data tool - Webflow Cloud tool to list Cloud projects and environments. " +
        "Use this to check project status, environments, and deployment state. " +
        "If no project exists yet, the user needs to create and deploy it using the Webflow CLI. " +
        "To set up a Cloud development and deploy environment, the agent must complete these steps in order:\n" +
        "1. Install Webflow Cloud skills: run `npx -y skills add webflow/webflow-skills --skill 'webflow-cli:cloud' --yes --agent claude-code` " +
        "(replace --agent with cursor, codex, or gemini-cli as needed, or omit for generic install).\n" +
        "2. Ensure the Webflow CLI is installed: run `npm i -g @webflow/webflow-cli@latest` (verify with `webflow --help`).\n" +
        "3. Authorize the CLI: run `webflow auth login` to open the browser for login.\n" +
        "The agent must run all of these steps itself and continue forward if any one has issues. " +
        "After setup, confirm with the user if they have a project ready to deploy.",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // GET /v2/workspaces/:workspace_id/sites?kind=cloudapp
              list_workspace_sites: z
                .object({
                  workspace_id: z
                    .string()
                    .describe(
                      "Workspace ID. Use list_sites from data_sites_tool to find a site, " +
                      "then use its workspaceId.",
                    ),
                  kind: z
                    .enum(["webflow", "cloudapp", "template", "tutorial", "optimize"])
                    .optional()
                    .describe(
                      "Filter by site kind. Defaults to 'cloudapp' if omitted. " +
                      "Use 'webflow' for standard sites, 'cloudapp' for standalone Cloud apps.",
                    ),
                })
                .optional()
                .describe(
                  "List sites in a workspace filtered by kind. " +
                  "Defaults to Cloud apps (standalone apps without a site). " +
                  "Returns site ID, name, kind, and workspace info.",
                ),
              // GET /cosmic/:site_id/cli-projects
              list_projects: z
                .object(CloudProjectSchema)
                .optional()
                .describe(
                  "List all Cloud projects for a site or workspace. " +
                  "Returns project ID, name, description, and creation date. " +
                  "Use list_sites from data_sites_tool first to get the site_id.",
                ),
              // GET /cosmic/:site_id/cli-project-environments/:project_id
              list_environments: z
                .object(CloudEnvironmentSchema)
                .optional()
                .describe(
                  "List environments for a Cloud project. " +
                  "Returns environment ID, branch, mount path, deploy URL, and latest deployment status.",
                ),
            })
            .strict()
            .refine(
              (d) =>
                [d.list_workspace_sites, d.list_projects, d.list_environments].filter(Boolean).length >=
                1,
              {
                message:
                  "Provide at least one of list_workspace_sites, list_projects, list_environments.",
              },
            ),
        ),
      },
    },
    async ({ actions }) => {
      try {
        const result: Content[] = [];
        for (const action of actions) {
          if (action.list_workspace_sites) {
            result.push(
              await listWorkspaceSites(getToken, action.list_workspace_sites),
            );
          }
          if (action.list_projects) {
            result.push(
              await listProjects(getToken, action.list_projects),
            );
          }
          if (action.list_environments) {
            result.push(
              await listEnvironments(getToken, action.list_environments),
            );
          }
        }
        return toolResponse(result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
