import { z } from "zod/v3";

export const SiteIdSchema = {
  siteId: z
    .string()
    .describe(
      "The ID of the site. DO NOT ASSUME site id. ALWAYS ask user for site id if not already provided or known. use sites_list tool to fetch all sites and then ask user to select one of them."
    ),
};
