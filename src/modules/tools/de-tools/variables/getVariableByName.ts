import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const getVariableByName = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get a variable by name from a collection
   * @param siteId Site ID
   * @param variableCollectionId Collection ID
   * @param variableName Variable name
   * @param includeAllModes Whether to include values for all modes
   * @returns Promise resolving with variable data
   */
  const getVariableByName = (
    siteId: string,
    variableCollectionId: string,
    variableName: string,
    includeAllModes: boolean = false
  ) => {
    return rpc.callTool("getVariableByName", {
      siteId,
      variableCollectionId,
      variableName,
      includeAllModes,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getVariableByName",
      withCommonDesignerRules(
        "Get a variable by name from a collection."
      ),
      {
        variableCollectionId: z
          .string()
          .describe(
            "The ID of the variable collection to get the variable from"
          ),
        variableName: z
          .string()
          .describe("The name of the variable to get"),
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
        variableName,
        includeAllModes,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getVariableByName(
                siteId,
                variableCollectionId,
                variableName,
                includeAllModes
              )
            ),
          },
        ],
      })
    );
  }
  return getVariableByName;
};
