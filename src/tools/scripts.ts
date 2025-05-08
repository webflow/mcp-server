import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { ScriptApplyLocation } from "webflow-api/api/types/ScriptApplyLocation";
import { z } from "zod";
import { requestOptions } from "../mcp";
import { RegisterInlineSiteScriptSchema } from "../schemas";
import { formatResponse, isApiError } from "../utils";

export function registerScriptsTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  // GET https://api.webflow.com/v2/sites/:site_id/registered_scripts
  server.tool(
    "site_registered_scripts_list",
    "List all registered scripts for a site. To apply a script to a site or page, first register it via the Register Script endpoints, then apply it using the relevant Site or Page endpoints.",
    {
      site_id: z.string().describe("Unique identifier for the site."),
    },
    async ({ site_id }) => {
      const response = await getClient().scripts.list(site_id, requestOptions);
      return formatResponse(response);
    }
  );

  // GET https://api.webflow.com/v2/sites/:site_id/custom_code
  server.tool(
    "site_applied_scripts_list",
    "Get all scripts applied to a site by the App. To apply a script to a site or page, first register it via the Register Script endpoints, then apply it using the relevant Site or Page endpoints.",
    {
      site_id: z.string().describe("Unique identifier for the site."),
    },
    async ({ site_id }) => {
      const response = await getClient().sites.scripts.getCustomCode(
        site_id,
        requestOptions
      );
      return formatResponse(response);
    }
  );

  // POST https://api.webflow.com/v2/sites/:site_id/registered_scripts/inline
  server.tool(
    "add_inline_site_script",
    "Register an inline script for a site. Inline scripts are limited to 2000 characters. ",
    {
      site_id: z.string().describe("Unique identifier for the site."),
      request: RegisterInlineSiteScriptSchema,
    },
    async ({ site_id, request }) => {
      const registerScriptResponse = await getClient().scripts.registerInline(
        site_id,
        {
          sourceCode: request.sourceCode,
          version: request.version,
          displayName: request.displayName,
          canCopy: request.canCopy !== undefined ? request.canCopy : true,
        },
        requestOptions
      );

      let existingScripts: any[] = [];
      try {
        const allScriptsResponse =
          await getClient().sites.scripts.getCustomCode(
            site_id,
            requestOptions
          );
        existingScripts = allScriptsResponse.scripts || [];
      } catch (error) {
        console.log(
          "Failed to get custom code, assuming empty scripts array",
          error
        );
        existingScripts = [];
      }

      const newScript = {
        id: registerScriptResponse.id ?? " ",
        location:
          request.location === "footer"
            ? ScriptApplyLocation.Footer
            : ScriptApplyLocation.Header,
        version: registerScriptResponse.version ?? " ",
        attributes: request.attributes,
      };

      existingScripts.push(newScript);

      const addedSiteCustomCoderesponse =
        await getClient().sites.scripts.upsertCustomCode(
          site_id,
          {
            scripts: existingScripts,
          },
          requestOptions
        );

      console.log(
        "Upserted Custom Code",
        JSON.stringify(addedSiteCustomCoderesponse)
      );
      return formatResponse(registerScriptResponse);
    }
  );

  server.tool(
    "delete_site_script",
    {
      site_id: z.string(),
    },
    async ({ site_id }) => {
      try {
        const response = await getClient().sites.scripts.deleteCustomCode(
          site_id,
          requestOptions
        );
        return formatResponse("Custom Code Deleted");
      } catch (error) {
        // If it's a 404, we'll try to clear the scripts another way
        if (isApiError(error) && error.status === 404) {
          return formatResponse(error.message ?? "No custom code found");
        }
        throw error;
      }
    }
  );
}
