import { z } from "zod";

export const ComponentDomWriteNodesItemSchema = z.union([
  z.object({
    nodeId: z.string().describe("Unique identifier for the node."),
    text: z.string().describe("HTML content of the node, including the HTML tag."),
  }).describe("Text node to be updated."),
  z.object({
    nodeId: z.string().describe("Unique identifier for the node."),
    propertyOverrides: z.array(
      z.object({
        propertyId: z.string().describe("Unique identifier for the property."),
        text: z.string().describe("Value used to override a component property."),
      })
    ).describe("Properties to override for this locale's component instances."),
  }).describe("Update text property overrides of a component instance."),
]).array();