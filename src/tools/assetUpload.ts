import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import z from "zod/v3";
import { SiteIdSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";
import { createHash } from "crypto";

export type UploadAssetSuccess = {
  success: true;
  assetId: string;
  fileName: string;
  hostedUrl?: string;
  assetUrl?: string;
};

export type UploadAssetFailure = {
  success: false;
  error: string;
};

export type UploadAssetResult = UploadAssetSuccess | UploadAssetFailure;

/**
 * Upload an image from a URL to a Webflow site via the Data API.
 *
 * Shared by:
 *  - the MCP tool `upload_asset_from_url` (registered below)
 *  - the HTTP proxy endpoint `POST /api/upload-asset` on the Designer app bridge
 */
export async function uploadAssetFromUrl(
  client: WebflowClient,
  params: {
    siteId: string;
    url: string;
    fileName?: string;
    altText?: string;
  },
): Promise<UploadAssetResult> {
  const { siteId, url, altText } = params;
  let fileName = params.fileName;

  try {
    // Step 1: Download the image
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download image: ${response.status} ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Derive file name if not provided
    if (!fileName) {
      const urlPath = new URL(url).pathname;
      fileName = urlPath.split("/").pop() || "image.jpg";
      if (!fileName.includes(".")) {
        const ext = contentType.split("/")[1] || "jpg";
        fileName = `${fileName}.${ext}`;
      }
    }

    if (fileName.length > 99) {
      const ext = fileName.split(".").pop() || "jpg";
      fileName = `${fileName.substring(0, 90)}.${ext}`;
    }

    // Step 2: Compute MD5 hash
    const md5Hash = createHash("md5").update(buffer).digest("hex");

    // Step 3: Create asset in Webflow (get S3 upload URL)
    const createResponse = await client.assets.create(siteId, {
      fileName,
      fileHash: md5Hash,
    });

    const body = createResponse as any;

    if (!body.uploadUrl || !body.uploadDetails) {
      return {
        success: false,
        error: "Webflow did not return upload URL or details",
      };
    }

    // Step 4: Upload to S3
    const formData = new FormData();
    const details = body.uploadDetails;
    if (details.acl) formData.append("acl", details.acl);
    if (details.bucket) formData.append("bucket", details.bucket);
    if (details.xAmzAlgorithm)
      formData.append("X-Amz-Algorithm", details.xAmzAlgorithm);
    if (details.xAmzCredential)
      formData.append("X-Amz-Credential", details.xAmzCredential);
    if (details.xAmzDate) formData.append("X-Amz-Date", details.xAmzDate);
    if (details.key) formData.append("key", details.key);
    if (details.policy) formData.append("policy", details.policy);
    if (details.xAmzSignature)
      formData.append("X-Amz-Signature", details.xAmzSignature);
    if (details.successActionStatus)
      formData.append("success_action_status", details.successActionStatus);
    if (details.contentType)
      formData.append("Content-Type", details.contentType);
    if (details.cacheControl)
      formData.append("Cache-Control", details.cacheControl);

    const blob = new Blob([buffer], { type: contentType });
    formData.append("file", blob, fileName);

    const uploadResponse = await fetch(body.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (
      !uploadResponse.ok &&
      uploadResponse.status !== 201 &&
      uploadResponse.status !== 204
    ) {
      const errorText = await uploadResponse.text();
      return {
        success: false,
        error: `S3 upload failed: ${uploadResponse.status} ${errorText}`,
      };
    }

    // Step 5: Update alt text if provided (non-fatal)
    if (altText && body.id) {
      try {
        await client.assets.update(body.id, {
          displayName: fileName,
          altText,
        });
      } catch {
        // Non-fatal — asset was uploaded, alt text update failed
      }
    }

    return {
      success: true,
      assetId: body.id,
      fileName,
      hostedUrl: body.hostedUrl,
      assetUrl: body.assetUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export function registerAssetUploadTools(
  server: McpServer,
  getClient: () => WebflowClient,
) {
  server.registerTool(
    "upload_asset_from_url",
    {
      title: "Upload Asset from URL",
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
      },
      description:
        "Upload an image to a Webflow site from a URL. Downloads the image, uploads it to Webflow via the Data API (S3), and returns the asset ID. Use this to add images from Unsplash or other sources to a site.",
      inputSchema: {
        ...SiteIdSchema,
        url: z
          .string()
          .describe(
            "The URL of the image to download and upload to the Webflow site.",
          ),
        fileName: z
          .string()
          .optional()
          .describe(
            "Optional file name for the asset (e.g. 'hero-dog.jpg'). If not provided, will be derived from the URL.",
          ),
        altText: z
          .string()
          .optional()
          .describe("Optional alt text for the uploaded image."),
      },
    },
    async ({ siteId, url, fileName, altText }) => {
      try {
        const result = await uploadAssetFromUrl(getClient(), {
          siteId,
          url,
          fileName,
          altText,
        });

        if (!result.success) {
          return formatErrorResponse(new Error(result.error));
        }

        return formatResponse({
          status: "success",
          message: `Asset uploaded successfully: ${result.fileName}`,
          data: {
            assetId: result.assetId,
            fileName: result.fileName,
            hostedUrl: result.hostedUrl,
            assetUrl: result.assetUrl,
          },
        });
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
