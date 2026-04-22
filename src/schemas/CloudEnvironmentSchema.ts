import { z } from "zod/v3";

export const CloudEnvironmentSchema = {
  project_id: z
    .string()
    .describe("Project ID returned by list_projects."),
  site_id: z
    .string()
    .optional()
    .describe(
      "Site ID to scope the query. Omit for apps.",
    ),
};
