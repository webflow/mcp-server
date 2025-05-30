export type RCPType = {
  callTool: (toolName: string, args?: any) => Promise<any>;
};
