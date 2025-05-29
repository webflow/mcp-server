import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";

/**
 * @deprecated redundant tool, conflicting with data tools
 */
export const updatePageMetaData = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update page metadata
   * @param siteId ID of the site to update the page metadata for
   * @param pageId Page ID
   * @param metaData Array of metadata type-value pairs
   * @returns Promise resolving with update result
   */
  const updatePageMetaData = (
    siteId: string,
    pageId: string,
    metaData: {
      type: "title" | "description";
      value: string;
    }[]
  ) => {
    return rpc.callTool("updatePageMetaData", {
      siteId,
      pageId,
      metaData,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "updatePageMetaData",
      "Update page meta data." +
        "1. this tool is helpful to update the meta data of a page." +
        "2. you need to pass pageId to identify which page to update." +
        "3. you need to pass metaData as array of object. each object will have type and value.",
      {
        pageId: z.string(),
        metaData: z.array(
          z.object({
            type: z.enum(["title", "description"]),
            value: z.string(),
          })
        ),
        siteId: z.string(),
      },
      async ({ pageId, metaData, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updatePageMetaData(
                siteId,
                pageId,
                metaData
              )
            ),
          },
        ],
      })
    );
  }
  return updatePageMetaData;
};
