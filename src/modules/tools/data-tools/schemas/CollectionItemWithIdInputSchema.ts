import { z } from "zod";

export const CollectionItemWithIdInputSchema = z
  .object({
    id: z.string().describe("Unique identifier for the item."),
    cmsLocaleId: z
      .string()
      .optional()
      .describe("Unique identifier for the locale of the CMS Item."),
    lastPublished: z
      .string()
      .optional()
      .describe("Date when the item was last published."),
    lastUpdated: z
      .string()
      .optional()
      .describe("Date when the item was last updated."),
    createdOn: z
      .string()
      .optional()
      .describe("Date when the item was created."),
    isArchived: z
      .boolean()
      .optional()
      .describe("Indicates if the item is archived."),
    isDraft: z
      .boolean()
      .optional()
      .describe("Indicates if the item is a draft."),
    fieldData: z.record(z.any()).and(
      z.object({
        name: z.string().optional().describe("Name of the field."),
        slug: z
          .string()
          .optional()
          .describe(
            "URL structure of the Item in your site. Note: Updates to an item slug will break all links referencing the old slug."
          ),
      })
    ),
  })
  .describe("Collection item update request schema.");
