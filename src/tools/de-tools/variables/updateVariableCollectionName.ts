import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const updateVariableCollectionName = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update a variable collection's name
   * @param variableCollectionId Collection ID
   * @param newName New name for the collection
   * @param siteId Site ID
   * @returns Promise resolving with update result
   */
  const updateVariableCollectionName = (
    variableCollectionId: string,
    newName: string,
    siteId: string
  ) => {
    return rpc.callTool("updateVariableCollectionName", {
      variableCollectionId,
      newName,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "updateVariableCollectionName",
      withCommonDesignerRules(
        "Update a variable collection's name."
      ),
      {
        variableCollectionId: z
          .string()
          .describe(
            "The ID of the variable collection to update"
          ),
        newName: z
          .string()
          .describe(
            "The new name for the variable collection"
          ),
        siteId: z
          .string()
          .describe("The ID of the site to update"),
      },
      async ({
        variableCollectionId,
        newName,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updateVariableCollectionName(
                variableCollectionId,
                newName,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return updateVariableCollectionName;
};
