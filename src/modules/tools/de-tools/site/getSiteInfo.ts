import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";

/**
 * @deprecated redundant tool, conflicting with data tools
 */
export const getSiteInfo = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get Webflow Site Info.
   * @param siteId ID of the site to get the info for
   * @returns Site Info
   */
  const getSiteInfo = (siteId: string | undefined) => {
    return rpc.callTool("getSiteInfo", { siteId });
  };
  if (!skipToolRegistration) {
    server.tool(
      "getSiteInfo",
      "Get Webflow Site Info." +
        "This will return following information about the site: " +
        "1. site id. " +
        "2. site name. " +
        "3. site short name. " +
        "4. all the domains connected to the site as array, also includes last published time." +
        "5. is site is private staging site or not. " +
        "6. is site is password protected or not. ",
      {
        siteId: z.string().optional(),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(await getSiteInfo(siteId)),
          },
        ],
      })
    );
  }
  return getSiteInfo;
};
