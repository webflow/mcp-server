import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const setTextOnSelectedElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Set text content for the currently selected element
   * @param text Text to set for the element
   * @param siteId ID of the site to set the text for
   * @returns Promise resolving with text setting result
   */
  const setTextOnSelectedElement = (
    text: string,
    siteId: string
  ) => {
    return rpc.callTool("setTextOnSelectedElement", {
      text,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "setTextOnSelectedElement",
      withCommonDesignerRules(
        "Set text on selected element. you can pass text as text to be set on the element."
      ),
      {
        text: z
          .string()
          .describe("The text to be set on the element"),
        siteId: z
          .string()
          .describe(
            "The ID of the site to set the text for"
          ),
      },
      async ({ text, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await setTextOnSelectedElement(text, siteId)
            ),
          },
        ],
      })
    );
  }
  return setTextOnSelectedElement;
};
