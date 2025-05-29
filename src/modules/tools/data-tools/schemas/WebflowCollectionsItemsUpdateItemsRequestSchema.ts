import { z } from "zod";
import { CollectionItemWithIdInputSchema } from "./CollectionItemWithIdInputSchema";

export const WebflowCollectionsItemsUpdateItemsRequestSchema = z.object({
  items: z.array(CollectionItemWithIdInputSchema).optional(),
});
