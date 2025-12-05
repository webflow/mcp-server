import { z } from "zod/v3";

export const ComponentPropertyUpdateSchema = z
  .array(
    z.object({
      propertyId: z.string().describe("Unique identifier for the property."),
      text: z.string().describe("New value for the property in this locale."),
    })
  )
  .describe("Array of properties to update for this component.");
