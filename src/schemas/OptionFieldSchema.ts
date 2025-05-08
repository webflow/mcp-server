import z from "zod";

export const OptionFieldSchema = z.object({
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
    .literal("Option")
    .describe('Type of the field. Set this to "Option".'),
  displayName: z.string().describe("Name of the field."),
  helpText: z.string().optional().describe("Help text for the field."),
  metadata: z.object({
    options: z.array(
      z
        .object({
          name: z.string().describe("Name of the option."),
          id: z
            .string()
            .optional()
            .describe("Unique identifier for the option."),
        })
        .describe("Array of options for the field.")
    ),
  }),
});
