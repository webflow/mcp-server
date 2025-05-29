import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const updateVariableValue = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Update a variable's value
   * @param variableCollectionId Collection ID
   * @param variableId Variable ID
   * @param value New value as JSON string
   * @param modeId Mode ID (optional)
   * @param siteId Site ID
   * @returns Promise resolving with update result
   */
  const updateVariableValue = (
    variableCollectionId: string,
    variableId: string,
    value: string | object,
    modeId: string,
    siteId: string
  ) => {
    return rpc.callTool("updateVariableValue", {
      variableCollectionId,
      variableId,
      value,
      modeId,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "updateVariableValue",
      withCommonDesignerRules("Update a variable's value."),
      {
        variableCollectionId: z
          .string()
          .describe(
            "The ID of the variable collection to update"
          ),
        variableId: z
          .string()
          .describe("The ID of the variable to update"),
        value: z
          .string()
          .describe(
            `you need to pass value as the new value for the variable (as a JSON string if needed). example for color type pass "#fff" as string. for type size pass "{ unit: "px", value: 50 }" or { unit: "rem", value: 2 }, for number type or percentage type pass 50 as string, for font family pass "Verdana"`
          ),
        modeId: z
          .string()
          .describe(
            "The ID of the mode to update, if you dont wanted to pass modeId then pass empty string"
          ),
        siteId: z
          .string()
          .describe("The ID of the site to update"),
      },
      async ({
        variableCollectionId,
        variableId,
        value,
        modeId,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await updateVariableValue(
                variableCollectionId,
                variableId,
                value,
                modeId,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return updateVariableValue;
};
