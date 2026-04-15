import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import z from "zod/v3";
import { SiteIdSchema } from "../schemas";
import { formatErrorResponse, formatResponse } from "../utils";
import { createHash } from "crypto";

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
        // Step 1: Download the image
        const response = await fetch(url);
        if (!response.ok) {
          return formatErrorResponse(
            new Error(
              `Failed to download image: ${response.status} ${response.statusText}`,
            ),
          );
        }

        const contentType =
          response.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Derive file name if not provided
        if (!fileName) {
          const urlPath = new URL(url).pathname;
          fileName = urlPath.split("/").pop() || "image.jpg";
          // Ensure it has an extension
          if (!fileName.includes(".")) {
            const ext = contentType.split("/")[1] || "jpg";
            fileName = `${fileName}.${ext}`;
          }
        }

        // Ensure file name is under 100 chars
        if (fileName.length > 99) {
          const ext = fileName.split(".").pop() || "jpg";
          fileName = `${fileName.substring(0, 90)}.${ext}`;
        }

        // Step 2: Compute MD5 hash
        const md5Hash = createHash("md5").update(buffer).digest("hex");

        // Step 3: Create asset in Webflow (get S3 upload URL)
        const client = getClient();
        const createResponse = await client.assets.create(siteId, {
          fileName,
          fileHash: md5Hash,
        });

        const body = createResponse as any;

        if (!body.uploadUrl || !body.uploadDetails) {
          return formatErrorResponse(
            new Error("Webflow did not return upload URL or details"),
          );
        }

        // Step 4: Upload to S3
        const formData = new FormData();

        // Add all upload details as form fields (order matters for S3)
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
          formData.append(
            "success_action_status",
            details.successActionStatus,
          );
        if (details.contentType)
          formData.append("Content-Type", details.contentType);
        if (details.cacheControl)
          formData.append("Cache-Control", details.cacheControl);

        // Add the file last
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
          return formatErrorResponse(
            new Error(
              `S3 upload failed: ${uploadResponse.status} ${errorText}`,
            ),
          );
        }

        // Step 5: Update alt text if provided
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

        return formatResponse({
          status: "success",
          message: `Asset uploaded successfully: ${fileName}`,
          data: {
            assetId: body.id,
            fileName,
            hostedUrl: body.hostedUrl,
            assetUrl: body.assetUrl,
          },
        });
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
  );
}
