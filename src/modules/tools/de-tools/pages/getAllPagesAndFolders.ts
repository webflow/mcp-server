import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";

/**
 * @deprecated redundant tool, conflicting with data tools
 */
export const getAllPagesAndFolders = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all pages and folders for the currently connected site
   * @param siteId ID of the site to get all pages and folders for
   * @returns Promise resolving with pages and folders data
   */
  const getAllPagesAndFolders = (siteId: string) => {
    return rpc.callTool("getAllPagesAndFolders", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllPagesAndFolders",
      "Get all pages and folders for the currently connected site." +
        "1. this tool will return all pages and folders for the currently connected site. " +
        "2. if no site is connected, it will return error message. " +
        "3. this tool is helpful to get all pages and folders for the currently connected site." +
        "4. user may use different terms like pages, folders, page, folder, etc.",
      {
        siteId: z.string(),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllPagesAndFolders(siteId)
            ),
          },
        ],
      })
    );
  }
  return getAllPagesAndFolders;
};
