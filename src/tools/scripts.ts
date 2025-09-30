import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { ScriptApplyLocation } from "webflow-api/api/types/ScriptApplyLocation";
import { z } from "zod";
import { requestOptions } from "../mcp";
import { RegisterInlineSiteScriptSchema } from "../schemas";
import { Content, formatErrorResponse, textContent, toolResponse, isApiError } from "../utils";

export function registerScriptsTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const listRegisteredScripts = async (arg: { site_id: string }) => {
    const response = await getClient().scripts.list(
      arg.site_id,
      requestOptions
    );
    return response;
  };

  const listAppliedScripts = async (arg: { site_id: string }) => {
    const response = await getClient().sites.scripts.getCustomCode(
      arg.site_id,
      requestOptions
    );
    return response;
  };

  const addInlineSiteScript = async (arg: {
    site_id: string;
    request: {
      sourceCode: string;
      version: string;
      displayName: string;
      location?: string;
      canCopy?: boolean;
      attributes?: Record<string, any>;
    };
  }) => {
    const registerScriptResponse = await getClient().scripts.registerInline(
      arg.site_id,
      {
        sourceCode: arg.request.sourceCode,
        version: arg.request.version,
        displayName: arg.request.displayName,
        canCopy: arg.request.canCopy !== undefined ? arg.request.canCopy : true,
      },
      requestOptions
    );

    let existingScripts: any[] = [];
    try {
      const allScriptsResponse =
        await getClient().sites.scripts.getCustomCode(
          arg.site_id,
          requestOptions
        );
      existingScripts = allScriptsResponse.scripts || [];
    } catch (error) {
      existingScripts = [];
    }

    const newScript = {
      id: registerScriptResponse.id ?? " ",
      location:
        arg.request.location === "footer"
          ? ScriptApplyLocation.Footer
          : ScriptApplyLocation.Header,
      version: registerScriptResponse.version ?? " ",
      attributes: arg.request.attributes,
    };

    existingScripts.push(newScript);

    await getClient().sites.scripts.upsertCustomCode(
      arg.site_id,
      {
        scripts: existingScripts,
      },
      requestOptions
    );

    return registerScriptResponse;
  };

  const deleteAllSiteScripts = async (arg: { site_id: string }) => {
    try {
      await getClient().sites.scripts.deleteCustomCode(
        arg.site_id,
        requestOptions
      );
      return "Custom Code Deleted";
    } catch (error) {
      // If it's a 404, we'll try to clear the scripts another way
      if (isApiError(error) && error.status === 404) {
        return error.message ?? "No custom code found";
      }
      throw error;
    }
  };

  server.tool(
    "data_scripts_tool",
    "Data tool - Scripts tool to perform actions like list registered scripts, list applied scripts, add inline site script, and delete all site scripts",
    {
      actions: z.array(
        z.object({
          // GET https://api.webflow.com/v2/sites/:site_id/registered_scripts
          list_registered_scripts: z
            .object({
              site_id: z.string().describe("Unique identifier for the site."),
            })
            .optional()
            .describe(
              "List all registered scripts for a site. To apply a script to a site or page, first register it via the Register Script endpoints, then apply it using the relevant Site or Page endpoints."
            ),
          // GET https://api.webflow.com/v2/sites/:site_id/custom_code
          list_applied_scripts: z
            .object({
              site_id: z.string().describe("Unique identifier for the site."),
            })
            .optional()
            .describe(
              "Get all scripts applied to a site by the App. To apply a script to a site or page, first register it via the Register Script endpoints, then apply it using the relevant Site or Page endpoints."
            ),
          // POST https://api.webflow.com/v2/sites/:site_id/registered_scripts/inline
          add_inline_site_script: z
            .object({
              site_id: z.string().describe("Unique identifier for the site."),
              request: RegisterInlineSiteScriptSchema,
            })
            .optional()
            .describe(
              "Register an inline script for a site. Inline scripts are limited to 2000 characters."
            ),
          // DELETE https://api.webflow.com/v2/sites/:site_id/custom_code
          delete_all_site_scripts: z
            .object({
              site_id: z.string().describe("Unique identifier for the site."),
            })
            .optional()
            .describe(
              "Delete all custom scripts applied to a site by the App."
            ),
        })
      ),
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_registered_scripts) {
            const content = await listRegisteredScripts(
              action.list_registered_scripts
            );
            result.push(textContent(content));
          } else if (action.list_applied_scripts) {
            const content = await listAppliedScripts(
              action.list_applied_scripts
            );
            result.push(textContent(content));
          } else if (action.add_inline_site_script) {
            const content = await addInlineSiteScript(
              action.add_inline_site_script
            );
            result.push(textContent(content));
          } else if (action.delete_all_site_scripts) {
            const content = await deleteAllSiteScripts(
              action.delete_all_site_scripts
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
