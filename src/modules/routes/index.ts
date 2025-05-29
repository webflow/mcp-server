import { corsHeaders } from "../../utils/corsHeaders";
import {
  getDEAuthUrl,
  handleAuthToken,
  handleOAuth,
} from "../auth";

import { serveRPC } from "../rpc";
import { EnvWithOAuthProvider } from "../../types/env";

export const handleRoutes = async (
  request: Request,
  env: EnvWithOAuthProvider,
  ctx: ExecutionContext
) => {
  try {
    const pathname = new URL(request.url).pathname;
    const method = request.method.toUpperCase();

    // Handle RPC
    if (pathname === "/rpc") {
      return serveRPC(request, env);
    }

    if (pathname.startsWith("/oauth")) {
      return handleOAuth(
        request,
        env as EnvWithOAuthProvider,
        ctx
      );
    }
    if (pathname === "/") {
      //Redirect to https://developers.webflow.com/data/docs/ai-tools -permanently
      return Response.redirect(
        "https://developers.webflow.com/data/docs/ai-tools",
        301
      );
    }

    if (pathname === "/designer-extension/auth") {
      return Response.redirect(
        getDEAuthUrl(new URL(request.url), env),
        302
      );
    }

    // Handle Webflow Token Exchange for DE App
    if (
      pathname === "/designer-extension/token-exchange" &&
      method === "POST"
    ) {
      return handleAuthToken(request, env);
    }

    return new Response("Not found", {
      status: 404,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error!", {
      status: 500,
      headers: corsHeaders,
    });
  }
};
