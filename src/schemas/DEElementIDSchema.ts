import { z } from "zod";

export const DEElementIDSchema = {
  id: z
    .object({
      component: z
        .string()
        .describe(
          "The component id of the element to perform action on."
        ),
      element: z
        .string()
        .describe(
          "The element id of the element to perform action on."
        ),
    })
    .describe(
      "The id of the element to perform action on, you can find it from id field on element. e.g id:{component:123,element:456}."
    ),
};
