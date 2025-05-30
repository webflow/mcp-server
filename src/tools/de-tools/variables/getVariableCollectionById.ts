import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const getVariableCollectionById = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get a variable collection by ID
   * @param variableCollectionId Collection ID
   * @param siteId Site ID
   * @returns Promise resolving with variable collection data
   */
  const getVariableCollectionById = (
    variableCollectionId: string,
    siteId: string
  ) => {
    return rpc.callTool("getVariableCollectionById", {
      variableCollectionId,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getVariableCollectionById",
      withCommonDesignerRules(
        "Get a variable collection by ID."
      ),
      {
        variableCollectionId: z
          .string()
          .describe(
            "The ID of the variable collection to get"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the variable collection from"
          ),
      },
      async ({ variableCollectionId, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getVariableCollectionById(
                variableCollectionId,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return getVariableCollectionById;
};
