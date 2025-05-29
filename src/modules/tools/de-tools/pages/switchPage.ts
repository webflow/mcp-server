import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const switchPage = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Switch to a different page in Webflow Designer
   * @param siteId ID of the site to switch to
   * @param pageId ID of the page to switch to
   * @returns Promise resolving with switch operation result
   */
  const switchPage = (siteId: string, pageId: string) => {
    return rpc.callTool("switchPage", { siteId, pageId });
  };

  if (!skipToolRegistration) {
    server.tool(
      "switchPage",
      withCommonDesignerRules(
        "Switch to a different page on the currently connected site." +
          "1. you can pass pageId to switch to a different page on the currently connected webflow designer instance. " +
          "2. user may use different terms like switch page, switch to page, switch to different page, etc."
      ),
      {
        siteId: z.string(),
        pageId: z.string(),
      },
      async ({ siteId, pageId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await switchPage(siteId, pageId)
            ),
          },
        ],
      })
    );
  }
  return switchPage;
};
