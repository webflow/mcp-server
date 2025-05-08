import { z } from "zod";

export const WebflowCollectionsItemsListItemsRequestSortOrderSchema = z
  .enum(["asc", "desc"])
  .optional()
  .describe("Order to sort the items by. Allowed values: asc, desc.");
