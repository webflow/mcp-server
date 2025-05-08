import { z } from "zod";

export const WebflowPageSchema = z.object({
  id: z.string().describe("Unique identifier for a Page."),
  siteId: z.string().optional().describe("Unique identifier for the Site."),
  title: z.string().optional().describe("Title of the page."),
  slug: z
    .string()
    .optional()
    .describe("Slug of the page (derived from title)."),
  parentId: z
    .string()
    .optional()
    .describe("Unique identifier for the parent folder."),
  collectionId: z
    .string()
    .optional()
    .describe(
      "Unique identifier for the linked collection, NULL id the Page is not part of a collection."
    ),
  createdOn: z.date().optional().describe("Date when the page was created."),
  lastUpdated: z
    .date()
    .optional()
    .describe("Date when the page was last updated."),
  archived: z
    .boolean()
    .optional()
    .describe("Indicates if the page is archived."),
  draft: z.boolean().optional().describe("Indicates if the page is a draft."),
  canBranch: z
    .boolean()
    .optional()
    .describe("Indicates if the page can be branched."),
  isBranch: z
    .boolean()
    .optional()
    .describe("Indicates if the page is Branch of another page."),
  isMembersOnly: z
    .boolean()
    .optional()
    .describe(
      "Indicates whether the Page is restricted by Memberships Controls."
    ),
  seo: z
    .object({
      title: z
        .string()
        .optional()
        .describe("The Page title shown in search engine results."),
      description: z
        .string()
        .optional()
        .describe("The Page description shown in search engine results."),
    })
    .optional()
    .describe("SEO-related fields for the page."),
  openGraph: z
    .object({
      title: z
        .string()
        .optional()
        .describe("The title supplied to Open Graph annotations."),
      titleCopied: z
        .boolean()
        .optional()
        .describe(
          "Indicates the Open Graph title was copied from the SEO title."
        ),
      description: z
        .string()
        .optional()
        .describe("The description supplied to Open Graph annotations."),
      descriptionCopied: z
        .boolean()
        .optional()
        .describe(
          "Indicates the Open Graph description was copied from the SEO description."
        ),
    })
    .optional(),
  localeId: z
    .string()
    .optional()
    .describe(
      "Unique identifier for the page locale. Applicable when using localization."
    ),
  publishedPath: z
    .string()
    .optional()
    .describe("Relative path of the published page."),
});
