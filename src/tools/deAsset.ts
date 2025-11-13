import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RPCType } from "../types/RPCType";
import z from "zod";
import { SiteIdSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";

export function registerDEAssetTools(server: McpServer, rpc: RPCType) {
  const assetToolRPCCall = async (siteId: string, actions: any) => {
    return rpc.callTool("asset_tool", {
      siteId,
      actions: actions || [],
    });
  };

  const getImagePreviewFromURL = async (url: string, siteId: string) => {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      throw new Error(
        `Expected an image but received MIME type: ${contentType || "unknown"}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    const binary = String.fromCharCode(...new Uint8Array(arrayBuffer));
    const base64 = btoa(binary);
    return { data: base64, mimeType: contentType, siteId };
  };

  server.registerTool(
    "asset_tool",
    {
      title: "Designer Asset Tool",
      annotations: {
        readOnlyHint: false,
      },
      description:
        "Designer Tool - Asset tool to perform actions like create folder, get all assets and folders, update assets and folders",
      inputSchema: {
        ...SiteIdSchema,
        actions: z.array(
          z.object({
            create_folder: z
              .object({
                name: z.string().describe("The name of the folder to create"),
                parent_folder_id: z
                  .string()
                  .optional()
                  .describe(
                    "The id of the parent folder to move the folder to."
                  ),
              })
              .optional()
              .describe("Create a folder on the site"),
            get_all_assets_and_folders: z
              .object({
                query: z
                  .enum(["all", "folders", "assets"])
                  .describe("Query to get all assets and folders on the site"),
                filter_assets_by_ids: z
                  .array(z.string())
                  .describe("Filter assets by ids")
                  .optional(),
              })
              .optional()
              .describe("Get all assets and folders on the site"),
            update_asset: z
              .object({
                asset_id: z.string().describe("The id of the asset to update"),
                name: z
                  .string()
                  .optional()
                  .describe("The name of the asset to update"),
                alt_text: z
                  .string()
                  .optional()
                  .describe("The alt text of the asset to update"),
                parent_folder_id: z
                  .string()
                  .optional()
                  .describe(
                    "The id of the parent folder to move the asset to."
                  ),
              })
              .optional()
              .describe("Update an asset on the site"),
          })
        ),
      },
    },
    async ({ siteId, actions }) => {
      try {
        return formatResponse(await assetToolRPCCall(siteId, actions));
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "get_image_preview",

    {
      title: "Get Webflow Image Preview",
      annotations: {
        readOnlyHint: false,
      },
      description:
        "Designer Tool - Get image preview from url. this is helpful to get image preview from url. Only supports JPG, PNG, GIF, WEBP, WEBP and AVIF formats.",
      inputSchema: {
        url: z
          .string()
          .describe("The URL of the image to get the preview from"),
        ...SiteIdSchema,
      },
    },
    async ({ url, siteId }) => {
      try {
        const { data, mimeType } = await getImagePreviewFromURL(url, siteId);
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
        return formatErrorResponse(error);
      }
    }
  );
}
