/**
 * Converts page-automation tool manifest entries into MCP tool registrations.
 *
 * The page-automation API returns tool definitions with JSON Schema input
 * schemas. This module converts them to Zod schemas (required by MCP SDK
 * v1.25) and registers each tool on the MCP server.
 *
 * Tool naming: pa_{toolId_snake_case}
 *   e.g. "create-style" → "pa_create_style"
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";
import {
  PageAutomationClient,
  type ToolManifestEntry,
} from "./pageAutomationClient";
import { formatErrorResponse, formatResponse } from "../utils";

// ---------------------------------------------------------------------------
// JSON Schema → Zod conversion (lightweight, covers the subset used)
// ---------------------------------------------------------------------------

/**
 * Resolves a JSON Schema that may use $ref + definitions (produced by
 * zod-to-json-schema) into the concrete object definition.
 *
 * Example input:
 *   { "$ref": "#/definitions/create-style", "definitions": { "create-style": { ... } } }
 * Returns the resolved definition object.
 */
function resolveJsonSchemaRef(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  const ref = schema.$ref as string | undefined;
  if (!ref) return schema;

  // Parse "#/definitions/foo" → "foo"
  const match = ref.match(/^#\/definitions\/(.+)$/);
  if (!match) return schema;

  const definitions = schema.definitions as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!definitions) return schema;

  return definitions[match[1]] ?? schema;
}

/**
 * Converts a JSON Schema property definition to a Zod schema.
 * Handles: string, number, integer, boolean, array, object, enum.
 */
function jsonSchemaPropertyToZod(
  prop: Record<string, unknown>,
): z.ZodTypeAny {
  const type = prop.type as string | undefined;

  // Handle enum first (can appear alongside type)
  if (Array.isArray(prop.enum)) {
    const values = prop.enum as string[];
    if (values.length === 0) return z.string();
    if (values.length === 1) return z.literal(values[0]);
    return z.enum(values as [string, ...string[]]);
  }

  switch (type) {
    case "string": {
      let schema = z.string();
      if (typeof prop.minLength === "number")
        schema = schema.min(prop.minLength);
      if (typeof prop.maxLength === "number")
        schema = schema.max(prop.maxLength);
      return schema;
    }
    case "number":
    case "integer":
      return z.number();
    case "boolean":
      return z.boolean();
    case "array": {
      const items = prop.items as Record<string, unknown> | undefined;
      return z.array(items ? jsonSchemaPropertyToZod(items) : z.unknown());
    }
    case "object": {
      const properties = prop.properties as
        | Record<string, Record<string, unknown>>
        | undefined;
      if (!properties) return z.record(z.string(), z.unknown());
      return jsonSchemaObjectToZod(prop);
    }
    default:
      return z.unknown();
  }
}

/**
 * Converts a JSON Schema object definition to a Zod object schema.
 */
function jsonSchemaObjectToZod(
  schema: Record<string, unknown>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  // Resolve $ref if present (zod-to-json-schema wraps with $ref + definitions)
  const resolved = resolveJsonSchemaRef(schema);

  const properties = (resolved.properties ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  const required = new Set(
    Array.isArray(resolved.required) ? (resolved.required as string[]) : [],
  );

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    let fieldSchema = jsonSchemaPropertyToZod(prop);

    // Attach description if present
    if (typeof prop.description === "string") {
      fieldSchema = fieldSchema.describe(prop.description);
    }

    // Make optional if not required
    if (!required.has(key)) {
      fieldSchema = fieldSchema.optional();
    }

    shape[key] = fieldSchema;
  }

  return z.object(shape);
}

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

/**
 * Fetches the tool manifest from page-automation and registers each tool
 * on the MCP server. Gracefully degrades on failure (logs a warning and
 * returns without registering any tools).
 */
export async function registerPageAutomationTools(
  server: McpServer,
  client: PageAutomationClient,
  accessToken: string,
): Promise<void> {
  let manifest;
  try {
    manifest = await client.fetchTools(accessToken);
  } catch (err) {
    console.warn(
      "[page-automation] Could not fetch tool manifest — page-automation tools will not be available.",
      err instanceof Error ? err.message : err,
    );
    return;
  }

  for (const tool of manifest.tools) {
    registerSingleTool(server, client, accessToken, tool);
  }

  console.log(
    `[page-automation] Registered ${manifest.tools.length} tools (schema hash: ${manifest.schemaHash})`,
  );
}

function registerSingleTool(
  server: McpServer,
  client: PageAutomationClient,
  accessToken: string,
  tool: ToolManifestEntry,
): void {
  const mcpToolName = `pa_${tool.toolId.replace(/-/g, "_")}`;

  // Build the input schema: siteId + pageId + tool-specific args
  // The manifest already includes siteId/pageId in the inputSchema,
  // so we convert the full schema directly.
  const inputZod = jsonSchemaObjectToZod(
    tool.inputSchema as Record<string, unknown>,
  );

  server.registerTool(
    mcpToolName,
    {
      title: `Page Automation: ${tool.description.split(".")[0]}`,
      annotations: {
        readOnlyHint: !tool.mutates,
        openWorldHint: true,
      },
      description: tool.description,
      inputSchema: inputZod.shape,
    },
    async (args) => {
      try {
        const { siteId, pageId, ...toolArgs } = args as Record<
          string,
          unknown
        >;

        if (!siteId || typeof siteId !== "string") {
          return formatErrorResponse(
            new Error("siteId is required"),
          );
        }
        if (!pageId || typeof pageId !== "string") {
          return formatErrorResponse(
            new Error("pageId is required"),
          );
        }

        const result = await client.executeTool(accessToken, {
          siteId,
          pageId,
          toolId: tool.toolId,
          args: toolArgs as Record<string, unknown>,
        });

        if (result.status === "error" || result.status === "rejected") {
          return formatErrorResponse(
            new Error(result.error ?? `Tool returned status: ${result.status}`),
          );
        }

        return formatResponse(result.result ?? result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
