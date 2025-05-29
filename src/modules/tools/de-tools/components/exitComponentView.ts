import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const exitComponentView = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Exit from component view mode
   * @param siteId ID of the site to exit from component view on
   * @returns Promise resolving with component view exit result
   */
  const exitComponentView = (siteId: string) => {
    return rpc.callTool("exitComponentView", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "exitComponentView",
      withCommonDesignerRules(
        "Exit from component view." +
          "1. this tool will exit from component view." +
          "2. always remember to exit from component view after you have made all the changes. Exit the focus of the Designer from a component definition. After exiting out of a component, the focus of the Designer will return to the body of the page or the component instance."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to exit from component view"
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await exitComponentView(siteId)
            ),
          },
        ],
      })
    );
  }
  return exitComponentView;
};
