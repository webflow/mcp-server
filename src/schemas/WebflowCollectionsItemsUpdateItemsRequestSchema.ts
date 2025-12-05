import { z } from "zod/v3";
import { CollectionItemWithIdInputSchema } from "./CollectionItemWithIdInputSchema";

export const WebflowCollectionsItemsUpdateItemsRequestSchema = z.object({
  items: z.array(CollectionItemWithIdInputSchema).optional(),
});
