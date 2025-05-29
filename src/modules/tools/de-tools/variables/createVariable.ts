import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const createVariable = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a new variable in a collection
   * @param variableCollectionId Collection ID
   * @param variableName Name for the new variable
   * @param variableType Type of variable (color, size, number, percentage, font-family)
   * @param variableValue Initial value as JSON string
   * @param siteId ID of the site to create the variable in
   * @returns Promise resolving with variable creation result
   */
  const createVariable = (
    variableCollectionId: string,
    variableName: string,
    variableType:
      | "color"
      | "size"
      | "number"
      | "percentage"
      | "font-family",
    variableValue: string | object,
    siteId: string
  ) => {
    return rpc.callTool("createVariable", {
      variableCollectionId,
      variableName,
      variableType,
      variableValue,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createVariable",
      withCommonDesignerRules(
        "Create a new variable in a collection." +
          "1. this tool is helpful to create a new variable (like a color, size, etc.) in a variable collection."
      ),
      {
        variableCollectionId: z
          .string()
          .describe(
            "The ID of the variable collection to create the variable in"
          ),
        variableName: z
          .string()
          .describe(
            "The name of the new variable, for example 'Primary Color' or 'Font Size'"
          ),
        variableType: z.enum([
          "color",
          "size",
          "number",
          "percentage",
          "font-family",
        ]),
        variableValue: z
          .string()
          .describe(
            `you need to pass variableValue as the value for the variable. for type color pass '#RRGGBB' as string. for type size pass '{ unit: 'px', value: 50 }' or '{ unit: 'rem', value: 2 }' for number type or percentage type pass 50 as string, for font family pass 'Verdana' if you wanted to link variable to another variable on same collection. then pass {id: 'variableId'} as string. this will link the variable to another variable on same collection.`
          ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to create the variable in"
          ),
      },
      async ({
        variableCollectionId,
        variableName,
        variableType,
        variableValue,
        siteId,
      }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createVariable(
                variableCollectionId,
                variableName,
                variableType,
                variableValue,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return createVariable;
};
