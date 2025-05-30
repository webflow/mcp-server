import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const getCurrentPage = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get information about the current page in Webflow Designer
   * @param siteId ID of the site to get the current page for
   * @returns Promise resolving with current page data
   */
  const getCurrentPage = (siteId: string) => {
    return rpc.callTool("getCurrentPage", { siteId });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getCurrentPage",
      withCommonDesignerRules(
        "Get current webflow page info opened on Webflow Designer."
      ),
      {
        siteId: z.string(),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getCurrentPage(siteId)
            ),
          },
        ],
      })
    );
  }
  return getCurrentPage;
};
