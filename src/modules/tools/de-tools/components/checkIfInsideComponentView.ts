import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";
export const checkIfInsideComponentView = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Check if currently in component view mode
   * @param siteId ID of the site to check if inside component view on
   * @returns Promise resolving with component view status
   */
  const checkIfInsideComponentView = (siteId: string) => {
    return rpc.callTool("checkIfInsideComponentView", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "checkIfInsideComponentView",
      withCommonDesignerRules(
        "Check if inside component view. this tool will return status flag and message."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to check if inside component view on"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await checkIfInsideComponentView(siteId)
            ),
          },
        ],
      })
    );
  }
  return checkIfInsideComponentView;
};
