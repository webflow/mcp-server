import { WebflowClient } from "webflow-api";

export type RPCType = {
  callTool: (toolName: string, args?: any) => Promise<any>;
  getClient: () => WebflowClient;
};
