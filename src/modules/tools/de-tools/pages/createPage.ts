import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";

/**
 * @deprecated redundant tool, conflicting with data tools
 */
export const createPage = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a new page
   * @param siteId ID of the site to create the page in
   * @param pageName Name for the new page
   * @param metaTitle Meta title for the page
   * @param metaDescription Meta description for the page (optional)
   * @param pageParentFolderId Parent folder ID (optional)
   * @returns Promise resolving with page creation result
   */
  const createPage = (
    siteId: string,
    pageName: string,
    metaTitle: string,
    metaDescription: string | null,
    pageParentFolderId: string | null
  ) => {
    return rpc.callTool("createPage", {
      pageName,
      metaTitle,
      metaDescription,
      pageParentFolderId,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createPage",
      "Create a new page." +
        "1. this tool is helpful to create a new page." +
        "2. you need to pass pageName to identify which page to create." +
        "3. you need to pass metaTitle set the title of the page." +
        "4. you need to pass metaDescription set the description of the page. or pass empty string if you dont wanted to set description." +
        "5. you need to pass pageParentFolderId to identify which folder to create the page in. or pass empty string if you dont wanted to create page in any folder." +
        "6. this tool will return the new page info after creation.",
      {
        pageName: z.string(),
        metaTitle: z.string(),
        metaDescription: z.string().optional(),
        pageParentFolderId: z.string().optional(),
        siteId: z.string(),
      },
      async ({
        pageName,
        metaTitle,
        metaDescription,
        pageParentFolderId,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createPage(
                siteId,
                pageName,
                metaTitle,
                metaDescription || null,
                pageParentFolderId || null
              )
            ),
          },
        ],
      })
    );
  }
  return createPage;
};
