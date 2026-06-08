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

/**
 * Thin authenticated wrapper over the freeform Custom Code Data API
 * (GET/PUT /v2/{sites|pages}/:id/custom_code/freeform[/:location]). The SDK
 * does not yet expose these endpoints, so we forward the user's OAuth token
 * directly. Access control (scopes, the Custom Code entitlement, and the
 * feature gate) is enforced API-side; this tool only relays the request.
 */
async function apiRequest(
  method: string,
  path: string,
  getToken: () => string,
  body?: unknown,
): Promise<Content> {
  const token = getToken();
  const response = await fetch(`${WEBFLOW_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...requestOptions.headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      name: "WebflowApiError",
      status: response.status,
      ...error,
    });
  }

  // A PUT can respond with an empty body (204) — normalize to a success object.
  const text = await response.text();
  if (!text) {
    return textContent({ success: true });
  }
  try {
    return textContent(JSON.parse(text));
  } catch {
    return textContent(text);
  }
}

type FreeformLocation = "head" | "footer";

type CustomCodeAction = {
  get_site_freeform_code?: { site_id: string; location?: FreeformLocation };
  set_site_freeform_code?: {
    site_id: string;
    location: FreeformLocation;
    content: string;
  };
  get_page_freeform_code?: {
    page_id: string;
    location?: FreeformLocation;
    locale_id?: string;
  };
  set_page_freeform_code?: {
    page_id: string;
    location: FreeformLocation;
    content: string;
    locale_id?: string;
  };
};

async function handleCustomCodeActions(
  actions: CustomCodeAction[],
  getToken: () => string,
): Promise<Content[]> {
  const result: Content[] = [];
  for (const action of actions) {
    if (action.get_site_freeform_code) {
      const { site_id, location } = action.get_site_freeform_code;
      const path = location
        ? `/v2/sites/${site_id}/custom_code/freeform/${location}`
        : `/v2/sites/${site_id}/custom_code/freeform`;
      result.push(await apiRequest("GET", path, getToken));
    }
    if (action.set_site_freeform_code) {
      const { site_id, location, content } = action.set_site_freeform_code;
      result.push(
        await apiRequest(
          "PUT",
          `/v2/sites/${site_id}/custom_code/freeform/${location}`,
          getToken,
          { content },
        ),
      );
    }
    if (action.get_page_freeform_code) {
      const { page_id, location, locale_id } = action.get_page_freeform_code;
      const base = location
        ? `/v2/pages/${page_id}/custom_code/freeform/${location}`
        : `/v2/pages/${page_id}/custom_code/freeform`;
      const query = locale_id
        ? `?localeId=${encodeURIComponent(locale_id)}`
        : "";
      result.push(await apiRequest("GET", `${base}${query}`, getToken));
    }
    if (action.set_page_freeform_code) {
      const { page_id, location, content, locale_id } =
        action.set_page_freeform_code;
      const body: { content: string; localeId?: string } = { content };
      if (locale_id) {
        body.localeId = locale_id;
      }
      result.push(
        await apiRequest(
          "PUT",
          `/v2/pages/${page_id}/custom_code/freeform/${location}`,
          getToken,
          body,
        ),
      );
    }
  }
  return result;
}

export function registerCustomCodeTools(
  server: McpServer,
  getToken: () => string,
) {
  const locationSchema = z
    .enum(["head", "footer"])
    .describe(
      "Freeform code location: 'head' (inside <head>) or 'footer' (before </body>).",
    );

  server.registerTool(
    "data_custom_code_tool",
    {
      title: "Data Custom Code Tool",
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
      },
      description:
        "Data tool - Manage freeform (raw HTML/JS) head and footer custom code on a site or page. This is distinct from registered scripts (see data_scripts_tool): freeform code is an arbitrary code block stored directly on the site or page. Reads require the sites/pages read scope; writes require the sites/pages write scope and the Custom Code entitlement.",
      inputSchema: {
        actions: z.array(
          z
            .object({
              // GET https://api.webflow.com/v2/sites/:site_id/custom_code/freeform[/:location]
              get_site_freeform_code: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  location: locationSchema
                    .optional()
                    .describe(
                      "Optional. Omit to return both the head and footer blocks; pass 'head' or 'footer' for a single block.",
                    ),
                })
                .optional()
                .describe(
                  "Get a site's freeform head/footer custom code. Requires the sites read scope.",
                ),
              // PUT https://api.webflow.com/v2/sites/:site_id/custom_code/freeform/:location
              set_site_freeform_code: z
                .object({
                  site_id: z
                    .string()
                    .describe("Unique identifier for the site."),
                  location: locationSchema,
                  content: z
                    .string()
                    .describe(
                      "The full raw code for this location. Atomically replaces the existing block. Subject to the site's custom-code character limit.",
                    ),
                })
                .optional()
                .describe(
                  "Set (atomically replace) a site's freeform head or footer custom code. Requires the sites write scope and the Custom Code entitlement.",
                ),
              // GET https://api.webflow.com/v2/pages/:page_id/custom_code/freeform[/:location]
              get_page_freeform_code: z
                .object({
                  page_id: z
                    .string()
                    .describe("Unique identifier for the page."),
                  location: locationSchema
                    .optional()
                    .describe(
                      "Optional. Omit to return both the head and footer blocks; pass 'head' or 'footer' for a single block.",
                    ),
                  locale_id: z
                    .string()
                    .optional()
                    .describe(
                      "Optional locale ID. If provided, must be the site's primary locale (page freeform code is single-locale today).",
                    ),
                })
                .optional()
                .describe(
                  "Get a page's freeform head/footer custom code. Requires the pages read scope.",
                ),
              // PUT https://api.webflow.com/v2/pages/:page_id/custom_code/freeform/:location
              set_page_freeform_code: z
                .object({
                  page_id: z
                    .string()
                    .describe("Unique identifier for the page."),
                  location: locationSchema,
                  content: z
                    .string()
                    .describe(
                      "The full raw code for this location. Atomically replaces the existing block. Subject to the site's custom-code character limit.",
                    ),
                  locale_id: z
                    .string()
                    .optional()
                    .describe(
                      "Optional locale ID. If provided, must be the site's primary locale (page freeform code is single-locale today).",
                    ),
                })
                .optional()
                .describe(
                  "Set (atomically replace) a page's freeform head or footer custom code. Requires the pages write scope and the Custom Code entitlement.",
                ),
            })
            .strict()
            .refine(
              (d) =>
                [
                  d.get_site_freeform_code,
                  d.set_site_freeform_code,
                  d.get_page_freeform_code,
                  d.set_page_freeform_code,
                ].filter(Boolean).length >= 1,
              {
                message:
                  "Provide at least one of get_site_freeform_code, set_site_freeform_code, get_page_freeform_code, set_page_freeform_code.",
              },
            ),
        ),
      },
    },
    async ({ actions }) => {
      try {
        const result = await handleCustomCodeActions(actions, getToken);
        return toolResponse(result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
