import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const getAllVariablesFromCollection = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all variables from a collection
   * @param variableCollectionId Collection ID
   * @param includeAllModes Whether to include values for all modes
   * @param siteId ID of the site to get the variables from
   * @returns Promise resolving with variables data
   */
  const getAllVariablesFromCollection = (
    variableCollectionId: string,
    includeAllModes: boolean = false,
    siteId: string
  ) => {
    return rpc.callTool("getAllVariablesFromCollection", {
      variableCollectionId,
      includeAllModes,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllVariablesFromCollection",
      withCommonDesignerRules(
        "Get all variables from a collection."
      ),
      {
        variableCollectionId: z.string(),
        includeAllModes: z.boolean(),
        siteId: z.string(),
      },
      async ({
        variableCollectionId,
        includeAllModes,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllVariablesFromCollection(
                variableCollectionId,
                includeAllModes,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return getAllVariablesFromCollection;
};
