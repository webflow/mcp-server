import z from "zod/v3";

export const StaticFieldSchema = z.object({
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
    .union([
      z.literal("Color"),
      z.literal("DateTime"),
      z.literal("Email"),
      z.literal("File"),
      z.literal("Image"),
      z.literal("Link"),
      z.literal("MultiImage"),
      z.literal("Number"),
      z.literal("Phone"),
      z.literal("PlainText"),
      z.literal("RichText"),
      z.literal("Switch"),
      z.literal("Video"),
    ])
    .describe("Type of the field. Choose of these appropriate field types."),
  displayName: z.string().describe("Name of the field."),
  helpText: z.string().optional().describe("Help text for the field."),
});
