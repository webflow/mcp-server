import { z } from "zod";

export const RegisterInlineSiteScriptSchema = z
  .object({
    sourceCode: z
      .string()
      .describe(
        "The inline script source code (hosted by Webflow). Inline scripts are limited to 2000 characters."
      ),
    version: z
      .string()
      .describe(
        "A Semantic Version (SemVer) string, denoting the version of the script."
      ),
    canCopy: z
      .boolean()
      .optional()
      .describe(
        "Indicates whether the script can be copied on site duplication and transfer."
      ),
    displayName: z
      .string()
      .describe(
        "User-facing name for the script. Must be between 1 and 50 alphanumeric characters."
      ),
    location: z
      .string()
      .optional()
      .describe(
        'Location where the script is applied. Allowed values: "header", "footer".'
      ),
    attributes: z
      .record(z.any())
      .optional()
      .describe(
        "Developer-specified key/value pairs to be applied as attributes to the script."
      ),
  })
  .describe("Request schema to register an inline script for a site.");
