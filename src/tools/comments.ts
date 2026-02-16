import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import z from "zod";
import {
  Content,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils/formatResponse";
import { requestOptions } from "../mcp";
import {
  CommentsGetCommentThreadRequest,
  CommentsListCommentRepliesRequest,
  CommentsListCommentThreadsRequest,
} from "webflow-api/api/resources/sites";

export function registerCommentsTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const listCommentThreads = async (arg: {
    site_id: string;
    localeId?: string;
    offset?: number;
    limit?: number;
    sortBy?: "createdOn" | "lastUpdated";
    sortOrder?: "asc" | "desc";
  }) => {
    const data: CommentsListCommentThreadsRequest = {};
    if ("localeId" in arg) {
      data.localeId = arg.localeId;
    }
    if ("offset" in arg) {
      data.offset = arg.offset;
    }
    if ("limit" in arg) {
      data.limit = arg.limit;
    }
    if ("sortBy" in arg) {
      data.sortBy = arg.sortBy;
    }
    if ("sortOrder" in arg) {
      data.sortOrder = arg.sortOrder;
    }
    const response = await getClient().sites.comments.listCommentThreads(
      arg.site_id,
      data,
      requestOptions
    );
    return response;
  };

  const getCommentThread = async (arg: {
    site_id: string;
    comment_thread_id: string;
    localeId?: string;
    offset?: number;
    limit?: number;
    sortBy?: "createdOn" | "lastUpdated";
    sortOrder?: "asc" | "desc";
  }) => {
    const data: CommentsGetCommentThreadRequest = {};
    if ("localeId" in arg) {
      data.localeId = arg.localeId;
    }
    if ("offset" in arg) {
      data.offset = arg.offset;
    }
    if ("limit" in arg) {
      data.limit = arg.limit;
    }
    if ("sortBy" in arg) {
      data.sortBy = arg.sortBy;
    }
    if ("sortOrder" in arg) {
      data.sortOrder = arg.sortOrder;
    }
    const response = await getClient().sites.comments.getCommentThread(
      arg.site_id,
      arg.comment_thread_id,
      data,
      requestOptions
    );
    return response;
  };

  const listCommentReplies = async (arg: {
    site_id: string;
    comment_thread_id: string;
    localeId?: string;
    offset?: number;
    limit?: number;
    sortBy?: "createdOn" | "lastUpdated";
    sortOrder?: "asc" | "desc";
  }) => {
    const data: CommentsListCommentRepliesRequest = {};
    if ("localeId" in arg) {
      data.localeId = arg.localeId;
    }
    if ("offset" in arg) {
      data.offset = arg.offset;
    }
    if ("limit" in arg) {
      data.limit = arg.limit;
    }
    if ("sortBy" in arg) {
      data.sortBy = arg.sortBy;
    }
    if ("sortOrder" in arg) {
      data.sortOrder = arg.sortOrder;
    }
    const response = await getClient().sites.comments.listCommentReplies(
      arg.site_id,
      arg.comment_thread_id,
      data,
      requestOptions
    );
    return response;
  };

  server.registerTool(
    "data_comments_tool",
    {
      title: "Data Comments Tool",
      description: `Data tool - A comment in Webflow is user feedback attached to a specific element or page inside the Designer, stored as a top-level thread with optional replies. Each comment includes author info, timestamps, content, resolved state, and design-context metadata like page location and breakpoint. Use this tool to inspect feedback discussions across the site and understand where and why they were left.`,
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
      inputSchema: {
        actions: z
          .array(
            z
              .object({
                list_comment_threads: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to list its comment threads."
                      ),
                    localeId: z
                      .string()
                      .optional()
                      .describe(
                        "Unique identifier for a specific locale. Applicable when using localization."
                      ),
                    offset: z
                      .number()
                      .optional()
                      .describe(
                        "Offset used for pagination if the results have more than limit records."
                      ),
                    limit: z
                      .number()
                      .max(100)
                      .min(1)
                      .optional()
                      .describe(
                        "Maximum number of records to be returned (max limit: 100)"
                      ),
                    sortBy: z
                      .enum(["createdOn", "lastUpdated"])
                      .optional()
                      .describe("Sort the results by the given field."),
                    sortOrder: z
                      .enum(["asc", "desc"])
                      .optional()
                      .describe("Sort the results by the given order."),
                  })
                  .optional()
                  .describe(
                    "List all comment threads for a specific element or page."
                  ),
                get_comment_thread: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to get its comment thread."
                      ),
                    comment_thread_id: z
                      .string()
                      .describe(
                        "The comment thread's unique ID, used to get its details."
                      ),
                    localeId: z
                      .string()
                      .optional()
                      .describe(
                        "Unique identifier for a specific locale. Applicable when using localization."
                      ),
                    offset: z
                      .number()
                      .optional()
                      .describe(
                        "Offset used for pagination if the results have more than limit records."
                      ),
                    limit: z
                      .number()
                      .max(100)
                      .min(1)
                      .optional()
                      .describe(
                        "Maximum number of records to be returned (max limit: 100)"
                      ),
                    sortBy: z
                      .enum(["createdOn", "lastUpdated"])
                      .optional()
                      .describe("Sort the results by the given field."),
                    sortOrder: z
                      .enum(["asc", "desc"])
                      .optional()
                      .describe("Sort the results by the given order."),
                  })
                  .optional()
                  .describe("Get the details of a specific comment thread."),
                list_comment_replies: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to list its comment replies."
                      ),
                    comment_thread_id: z
                      .string()
                      .describe(
                        "The comment thread's unique ID, used to list its replies."
                      ),
                    offset: z
                      .number()
                      .optional()
                      .describe(
                        "Offset used for pagination if the results have more than limit records."
                      ),
                    limit: z
                      .number()
                      .max(100)
                      .min(1)
                      .optional()
                      .describe(
                        "Maximum number of records to be returned (max limit: 100)"
                      ),
                    sortBy: z
                      .enum(["createdOn", "lastUpdated"])
                      .optional()
                      .describe("Sort the results by the given field."),
                    sortOrder: z
                      .enum(["asc", "desc"])
                      .optional()
                      .describe("Sort the results by the given order."),
                  })
                  .optional()
                  .describe("List all replies for a specific comment thread."),
              })
              .strict()
              .refine(
                (d) =>
                  [
                    d.list_comment_threads,
                    d.get_comment_thread,
                    d.list_comment_replies,
                  ].filter(Boolean).length === 1,
                {
                  message:
                    "Provide exactly one of list_comment_threads, get_comment_thread, list_comment_replies.",
                }
              )
          )
          .min(1)
          .describe("The actions to perform on the comments."),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_comment_threads) {
            const content = await listCommentThreads(
              action.list_comment_threads
            );
            result.push(textContent(content));
          }
          if (action.get_comment_thread) {
            const content = await getCommentThread(action.get_comment_thread);
            result.push(textContent(content));
          }
          if (action.list_comment_replies) {
            const content = await listCommentReplies(
              action.list_comment_replies
            );
            result.push(textContent(content));
          }
        }
        return toolResponse(result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
