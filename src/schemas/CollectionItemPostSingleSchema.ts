import { z } from "zod/v3";

export const CollectionItemPostSingleSchema = z.object({
  id: z.string().optional(),
  cmsLocaleId: z.string().optional(),
  lastPublished: z.string().optional(),
  lastUpdated: z.string().optional(),
  createdOn: z.string().optional(),
  isArchived: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  fieldData: z.record(z.any()).and(
    z.object({
      name: z.string(),
      slug: z.string(),
    })
  ),
});
