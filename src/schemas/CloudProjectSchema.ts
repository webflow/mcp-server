import { z } from "zod/v3";

export const CloudProjectSchema = {
  site_id: z
    .string()
    .optional()
    .describe(
      "Site ID to scope the query. Omit for apps (workspace-scoped).",
    ),
};
