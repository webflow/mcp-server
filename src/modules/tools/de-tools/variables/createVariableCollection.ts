import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const createVariableCollection = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Create a new variable collection
   * @param name Name for the new collection
   * @param siteId ID of the site to create the variable collection in
   * @returns Promise resolving with collection creation result
   */
  const createVariableCollection = (
    name: string,
    siteId: string
  ) => {
    return rpc.callTool("createVariableCollection", {
      name,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "createVariableCollection",
      withCommonDesignerRules(
        "Create a new variable collection."
      ),
      {
        name: z.string(),
        siteId: z.string(),
      },
      async ({ name, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await createVariableCollection(name, siteId)
            ),
          },
        ],
      })
    );
  }
  return createVariableCollection;
};
