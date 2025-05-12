import { z } from "zod";

export const ReferenceFieldSchema = z.object({
  id: z.string().optional().describe("Unique identifier for the Field."),
  isEditable: z
    .boolean()
    .optional()
    .describe("Indicates if the field is editable."),
  isRequired: z
    .boolean()
    .optional()
    .describe("Indicates if the field is required."),
  type: z
    .union([z.literal("MultiReference"), z.literal("Reference")])
    .describe("Type of the field. Choose of these appropriate field types."),
  displayName: z.string().describe("Name of the field."),
  helpText: z.string().optional().describe("Help text for the field."),
  metadata: z
    .object({
      collectionId: z.string(),
    })
    .describe(
      "ID of the referenced collection. Use this only for Reference and MultiReference fields."
    ),
});
