import z from "zod/v3";

// NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
export const WebflowCollectionsCreateRequestSchema = z.object({
  displayName: z
    .string()
    .describe(
      "Name of the collection. Each collection must have a unique name within the site."
    ),
  singularName: z.string().describe("Singular name of the collection."),
  slug: z
    .string()
    .optional()
    .describe("Slug of the collection in the site URL structure. "),
});
