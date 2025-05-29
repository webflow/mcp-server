import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const getVariableById = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get a variable by ID from a collection
   * @param siteId Site ID
   * @param variableCollectionId Collection ID
   * @param variableId Variable ID
   * @param includeAllModes Whether to include values for all modes
   * @returns Promise resolving with variable data
   */
  const getVariableById = (
    siteId: string,
    variableCollectionId: string,
    variableId: string,
    includeAllModes: boolean = false
  ) => {
    return rpc.callTool("getVariableById", {
      variableCollectionId,
      variableId,
      includeAllModes,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getVariableById",
      withCommonDesignerRules(
        "Get a variable by ID from a collection."
      ),
      {
        variableCollectionId: z
          .string()
          .describe(
            "The ID of the variable collection to get the variable from"
          ),
        variableId: z
          .string()
          .describe("The ID of the variable to get"),
        includeAllModes: z
          .boolean()
          .describe("Whether to include all modes"),
        siteId: z
          .string()
          .describe(
            "The ID of the site to get the variable from"
          ),
      },
      async ({
        variableCollectionId,
        variableId,
        includeAllModes,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getVariableById(
                siteId,
                variableCollectionId,
                variableId,
                includeAllModes
              )
            ),
          },
        ],
      })
    );
  }
  return getVariableById;
};
