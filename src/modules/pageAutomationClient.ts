/**
 * HTTP client for the page-automation REST API.
 *
 * Replaces the Socket.IO designer bridge with direct REST calls to:
 *   GET  {baseUrl}/v1/page-automation/tools
 *   POST {baseUrl}/v1/page-automation/execute
 */

// ---------------------------------------------------------------------------
// Response types (mirror the server-side contracts)
// ---------------------------------------------------------------------------

export interface ToolManifestEntry {
  toolId: string;
  description: string;
  family: "styles" | "elements" | "variables";
  mutates: boolean;
  inputSchema: Record<string, unknown>;
}

export interface ToolManifest {
  version: number;
  schemaHash: string;
  tools: ToolManifestEntry[];
}

export interface ExecuteToolRequest {
  siteId: string;
  pageId: string;
  toolId: string;
  args: Record<string, unknown>;
}

export interface ExecuteToolResponse {
  status: "ok" | "error" | "rejected";
  result: unknown;
  committed: boolean;
  diff?: Record<string, unknown>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class PageAutomationClient {
  private baseUrl: string;
  private cachedSchemaHash: string | null = null;

  constructor(baseUrl: string) {
    // Strip trailing slash for consistent URL construction
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Fetch the tool manifest (available tools, schemas, schema hash).
   */
  async fetchTools(accessToken: string): Promise<ToolManifest> {
    const res = await fetch(
      `${this.baseUrl}/v1/page-automation/tools`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new PageAutomationApiError(
        `GET /v1/page-automation/tools failed: ${res.status} ${res.statusText}`,
        res.status,
      );
    }

    const manifest: ToolManifest = await res.json();
    this.cachedSchemaHash = manifest.schemaHash;
    return manifest;
  }

  /**
   * Execute a page-automation tool. On 409 (stale schema), re-fetches
   * the manifest and retries once.
   */
  async executeTool(
    accessToken: string,
    request: ExecuteToolRequest,
  ): Promise<ExecuteToolResponse> {
    const attempt = async (): Promise<ExecuteToolResponse> => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (this.cachedSchemaHash) {
        headers["x-schema-hash"] = this.cachedSchemaHash;
      }

      const res = await fetch(
        `${this.baseUrl}/v1/page-automation/execute`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            siteId: request.siteId,
            pageId: request.pageId,
            toolId: request.toolId,
            args: request.args,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.text();
        throw new PageAutomationApiError(
          `POST /v1/page-automation/execute failed: ${res.status} — ${body}`,
          res.status,
        );
      }

      return res.json();
    };

    try {
      return await attempt();
    } catch (err) {
      // On 409, re-fetch tools to update the schema hash and retry once
      if (err instanceof PageAutomationApiError && err.status === 409) {
        await this.fetchTools(accessToken);
        return attempt();
      }
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class PageAutomationApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PageAutomationApiError";
    this.status = status;
  }
}
