import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callTool } from "../rpc";
import { initTools } from "../tools/de-tools";
import { registerDataTools } from "../tools/data-tools";
import { WebflowClient } from "webflow-api";
import { EnvWithOAuthProvider } from "../../types/env";

import { MCPProps } from "../../types/props";
import { initServerTools } from "../tools/server-tools";

export type RCPType = {
  callTool: (toolName: string, args?: any) => Promise<any>;
  env: Env;
};

export class WFDesignerMCP extends McpAgent<
  Env,
  any,
  MCPProps
> {
  env: EnvWithOAuthProvider;
  server = new McpServer({
    name: "webflow-designer-mcp",
    version: "1.0.0",
  });

  constructor(
    state: DurableObjectState,
    env: EnvWithOAuthProvider
  ) {
    super(state, env);
    this.env = env;
  }

  async init() {
    const callToolFn = async (toolName, args = {}) => {
      const { siteId } = args as any;
      if (!siteId) {
        return {
          status: false,
          error: "Site ID is required",
        };
      }
      return await callTool(
        siteId,
        toolName,
        args || {},
        this.env
      );
    };

    //init server tools
    initServerTools(this.server, this.env, this.props);

    //init data tools
    registerDataTools(
      this.server,
      () => {
        return new WebflowClient({
          accessToken: this.props.accessToken,
        });
      },
      this.props.toolConfig || {}
    );

    //init DE tools
    initTools(
      this.server,
      {
        callTool: callToolFn,
        env: this.env,
      },
      this.props.toolConfig || {}
    );
  }
}

export const serveMCP = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext
) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname.startsWith("/sse")) {
    return WFDesignerMCP.serveSSE("/sse").fetch(
      request,
      env as any,
      ctx
    );
  }
  if (pathname.startsWith("/mcp")) {
    return WFDesignerMCP.serve(`/mcp`).fetch(
      request,
      env as any,
      ctx
    );
  }
  return new Response("Invalid MCP path", { status: 400 });
};
