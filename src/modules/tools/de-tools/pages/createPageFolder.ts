import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";

/**
 * @deprecated redundant tool, conflicting with data tools
 */
export const createPageFolder = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a new page folder
   * @param siteId ID of the site to create the page folder in
   * @param pageFolderName Name for the new folder
   * @param pageFolderParentId Parent folder ID (optional)
   * @returns Promise resolving with folder creation result
   */
  const createPageFolder = (
    siteId: string,
    pageFolderName: string,
    pageFolderParentId: string | null
  ) => {
    return rpc.callTool("createPageFolder", {
      pageFolderName,
      pageFolderParentId,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createPageFolder",
      "Create a new page folder." +
        "1. this tool is helpful to create a new page folder." +
        "2. you need to pass pageFolderName to identify which page folder to create." +
        "3. you need to pass pageFolderParentId to identify which folder to create the page folder in. or pass empty string if you dont wanted to create page folder in any folder." +
        "4. this tool will return the new page folder info after creation.",
      {
        pageFolderName: z.string(),
        pageFolderParentId: z.string().optional(),
        siteId: z.string(),
      },
      async ({
        pageFolderName,
        pageFolderParentId,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createPageFolder(
                siteId,
                pageFolderName,
                pageFolderParentId || null
              )
            ),
          },
        ],
      })
    );
  }
  return createPageFolder;
};
