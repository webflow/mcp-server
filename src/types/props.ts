import { ToolConfig } from "../utils/getToolConfig";

export type MCPProps = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  toolConfig: ToolConfig;
};
