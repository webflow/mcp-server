import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../../utils/withCommonDesignerRules";

export const getAllComponents = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Get all components from the site
   * @param siteId ID of the site to get the components for
   * @returns Promise resolving with components data
   */
  const getAllComponents = (siteId: string) => {
    return rpc.callTool("getAllComponents", {
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "getAllComponents",
      withCommonDesignerRules(
        "Get all components on site." +
          "1. this tool will return all components on site." +
          "2. In Webflow, a Component is a reusable, customizable block of design and content that you can use across multiple pages or projects. It helps you create consistent layouts and patterns (like buttons, navbars, cards, etc.) while also allowing dynamic updates and overrides where needed."
      ),
      {
        siteId: z
          .string()
          .describe(
            "The ID of the site to get all components."
          ),
      },
      async ({ siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await getAllComponents(siteId)
            ),
          },
        ],
      })
    );
  }
  return getAllComponents;
};
