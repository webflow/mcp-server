import { z } from "zod";

export const WebflowCollectionsItemsListItemsRequestSortBySchema = z
  .enum(["lastPublished", "name", "slug"])
  .optional()
  .describe(
    "Field to sort the items by. Allowed values: lastPublished, name, slug."
  );
