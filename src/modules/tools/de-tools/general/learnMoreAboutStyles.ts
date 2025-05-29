import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { supportStyles } from "../../../../utils/supportStyles.js";

export const learnMoreAboutStyles = (
  server: McpServer,
  rpc: RCPType
) => {
  server.tool(
    "learnMoreAboutStyles",
    "Designer tool - Learn more about styles supported by webflow designer." +
      "Please do not use any other styles which is not supported by webflow designer." +
      "Please use the long-form alias of a CSS property when managing styles. For example, the property row-gap has a long-form alias of grid-row-gap, margin has long-form alias of margin-top, margin-right, margin-bottom, margin-left, etc.",
    {},
    async ({}) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(supportStyles),
        },
      ],
    })
  );
};
