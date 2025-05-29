import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";
import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils";

export const setAttributesToElement = (
  server: McpServer,
  rpc: RCPType,
  skipToolRegistration: boolean = false
) => {
  /**
   * Set attributes on the currently selected element
   * @param attributes Array of attribute name-value pairs
   * @param siteId ID of the site to set the attributes for
   * @returns Promise resolving with attribute setting result
   */
  const setAttributesToElement = (
    attributes: Array<{ name: string; value: string }>,
    siteId: string
  ) => {
    return rpc.callTool("setAttributesToElement", {
      attributes,
      siteId,
    });
  };

  if (!skipToolRegistration) {
    server.tool(
      "setAttributesToElement",
      withCommonDesignerRules(
        "Set attributes to element. set attributes to element. for example if you wanted to set data-id to element. pass [{name:'data-id',value:'123'}] as array of object. if you wanted to set multiple attributes to element. pass array of object. for example if you wanted to set data-id and data-name to element. pass [{name:'data-id',value:'123'},{name:'max',value:'456'}] as array of object."
      ),
      {
        attributes: z.array(
          z.object({
            name: z
              .string()
              .describe("The name of the attribute to set"),
            value: z
              .string()
              .describe(
                "The value of the attribute to set"
              ),
          })
        ),
        siteId: z
          .string()
          .describe(
            "The ID of the site to set the attributes for"
          ),
      },
      async ({ attributes, siteId }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await setAttributesToElement(
                attributes,
                siteId
              )
            ),
          },
        ],
      })
    );
  }
  return setAttributesToElement;
};
