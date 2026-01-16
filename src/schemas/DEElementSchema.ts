import { z } from "zod/v3";

export const DEElementSchema = z.object({
  type: z
    .enum([
      "Container",
      "Section",
      "DivBlock",
      "Heading",
      "TextBlock",
      "Paragraph",
      "Button",
      "TextLink",
      "LinkBlock",
      "Image",
      "DOM",
    ])
    .describe(
      "The type of element to create. with DOM type you can create any element. make sure you pass dom_config if you are creating a DOM element."
    ),
  set_style: z
    .object({
      style_names: z
        .array(z.string())
        .describe("The style names to set on the element."),
    })
    .optional()
    .describe(
      "Set style on the element. it will remove all other styles on the element. and set only the styles passed in style_names."
    ),
  set_text: z
    .object({
      text: z.string().describe("The text to set on the element."),
    })
    .optional()
    .describe(
      "Set text on the element. only valid for text block, paragraph, heading, button, text link, link block."
    ),
  set_link: z
    .object({
      link_type: z
        .enum(["url", "file", "page", "element", "email", "phone"])
        .describe("The type of link to set on the element."),
      link: z.string().describe("The link to set on the element."),
    })
    .optional()
    .describe(
      "Set link on the element. only valid for button, text link, link block."
    ),
  set_heading_level: z
    .object({
      heading_level: z
        .number()
        .min(1)
        .max(6)
        .describe("The heading level to set on the element."),
    })
    .optional()
    .describe("Set heading level on the element. only valid for heading."),
  set_image_asset: z
    .object({
      image_asset_id: z
        .string()
        .describe("The image asset id to set on the element."),
      alt_text: z
        .string()
        .optional()
        .describe(
          "The alt text to set on the image. if not provided it will inherit from the image asset."
        ),
    })
    .optional()
    .describe("Set image asset on the element. only valid for image."),
  set_dom_config: z
    .object({
      dom_tag: z
        .string()
        .describe(
          "The tag of the DOM element to create. for example span, code, etc."
        ),
    })
    .optional()
    .describe("Set DOM config on the element. only valid for DOM element."),
  set_attributes: z
    .object({
      attributes: z
        .array(
          z.object({
            name: z.string().describe("The name of the attribute to set."),
            value: z.string().describe("The value of the attribute to set."),
          })
        )
        .describe("The attributes to set on the element."),
    })
    .optional()
    .describe("Set attributes on the element."),
});
