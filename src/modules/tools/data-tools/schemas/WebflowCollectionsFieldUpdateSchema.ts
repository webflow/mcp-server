import z from "zod";

export const WebflowCollectionsFieldUpdateSchema = z
  .object({
    isRequired: z
      .boolean()
      .optional()
      .describe("Indicates if the field is required in a collection."),
    displayName: z.string().optional().describe("Name of the field."),
    helpText: z.string().optional().describe("Help text for the field."),
  })
  .describe("Request schema to update collection field metadata.");
