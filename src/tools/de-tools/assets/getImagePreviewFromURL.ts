import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import {
  withCommonDesignerRules,
  getImageFromURL,
} from "../../../utils";

export const getImagePreviewFromURL = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get an image preview from a URL
   * @param url URL of the image
   * @param siteId ID of the site to get the image preview from
   * @returns Promise resolving with image data
   */
  const getImagePreviewFromURL = async (
    url: string,
    siteId: string
  ) => {
    return await getImageFromURL(url, siteId);
  };

  if (!skipToolRegistration) {
    server.tool(
      "getImagePreviewFromURL",
      withCommonDesignerRules(
        "Get image preview from url. this is helpful to get image preview from url."
      ),
      {
        url: z
          .string()
          .describe(
            "The URL of the image to get the preview from"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the image preview from"
          ),
      },
      async ({ url, siteId }) => {
        try {
          const { data, mimeType } =
            await getImagePreviewFromURL(url, siteId);
          return {
            content: [
              {
                type: "image",
                data,
                mimeType,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: (error as Error).message,
              },
            ],
          };
        }
      }
    );
  }

  return getImagePreviewFromURL;
};
