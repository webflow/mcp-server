import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpAgent } from "agents/mcp";
import { createMcpServer, registerTools } from "./mcp";
import { WebflowClient } from "webflow-api";
import { BearerAuthProvider } from "./bearerAuthProvider";
import { WebflowOAuthHandler } from "./webflow-oauth-handler";

type Props = Record<string, unknown> & {
  accessToken?: string;
};

// Configure remote MCP server (SSE transport) for use in a Cloudflare Worker
export class WebflowMcp extends McpAgent<Env, unknown, Props> {
  server = createMcpServer();

  async init() {
    // Verify this.props.accessToken exists
    if (!this.props.accessToken) {
      throw new Error("this.props.accessToken is missing");
    }

    // Create a Webflow client
    const webflowClient = new WebflowClient({
      accessToken: this.props.accessToken,
    });

    // Return the Webflow client
    function getClient() {
      return webflowClient;
    }

    registerTools(this.server, getClient);
  }
}

// OAuthProvider version
export default new OAuthProvider({
  apiRoute: "/sse",
  // @ts-ignore
  apiHandler: WebflowMcp.mount("/sse", {
    binding: "MCP_OBJECT",
    corsOptions: {
      origin: "*",
      methods: "GET, POST, OPTIONS",
      headers: "Content-Type, Authorization",
    },
  }),
  defaultHandler: WebflowOAuthHandler,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
  // Validate that the access token exists
  validateToken: async (token: string) => {
    if (!token.length) {
      return new Error("Access token is missing");
    }
    return null;
  },
});
