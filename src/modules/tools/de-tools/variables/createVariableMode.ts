import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const createVariableMode = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a new mode in a variable collection
   * @param variableCollectionId Collection ID
   * @param modeName Name for the new mode
   * @param siteId ID of the site to create the variable mode in
   * @returns Promise resolving with mode creation result
   */
  const createVariableMode = (
    variableCollectionId: string,
    modeName: string,
    siteId: string
  ) => {
    return rpc.callTool("createVariableMode", {
      variableCollectionId,
      modeName,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createVariableMode",
      withCommonDesignerRules(
        "Create a new variable mode."
      ),
      {
        variableCollectionId: z
          .string()
          .describe(
            "The ID of the variable collection to create the mode in"
          ),
        modeName: z
          .string()
          .describe(
            "The name of the new mode, for example 'Dark Mode' or 'Light Mode'"
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the mode in"
          ),
      },
      async ({
        variableCollectionId,
        modeName,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createVariableMode(
                variableCollectionId,
                modeName,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return createVariableMode;
};
