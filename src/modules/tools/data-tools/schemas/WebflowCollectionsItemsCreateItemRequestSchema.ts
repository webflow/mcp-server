import { z } from "zod";
import { CollectionItemPostSingleSchema } from "./CollectionItemPostSingleSchema";

// NOTE: Cursor agent seems to struggle when provided with z.union(...), so we simplify the type here
export const WebflowCollectionsItemsCreateItemRequestSchema = z.object({
  items: z.array(CollectionItemPostSingleSchema).optional(),
});
