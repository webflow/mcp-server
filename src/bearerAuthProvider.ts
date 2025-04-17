/**
 * This file is copied from Cloufare's reference implementation:
 * https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/src/bearerAuthProvider.ts
 */

import { WorkerEntrypoint } from "cloudflare:workers";

type ExportedHandlerWithFetch = ExportedHandler &
  Pick<Required<ExportedHandler>, "fetch">;
type WorkerEntrypointWithFetch = WorkerEntrypoint &
  Pick<Required<WorkerEntrypoint>, "fetch">;

export interface BearerAuthProviderOptions {
  /**
   * URL(s) for API routes. Requests with URLs starting with any of these prefixes
   * will be treated as API requests and require a valid access token.
   * Can be a single route or an array of routes. Each route can be a full URL or just a path.
   */
  apiRoute: string | string[];

  /**
   * Validate the access token.
   * If the token is invalid, return an Error.
   * If the token is valid, return null.
   */
  validateToken?: (token: string) => Promise<Error | null>;

  /**
   * Handler for API requests that have a valid access token.
   * This handler will receive the authenticated user properties in ctx.props.
   * Can be either an ExportedHandler object with a fetch method or a class extending WorkerEntrypoint.
   */
  apiHandler:
    | ExportedHandlerWithFetch
    | (new (ctx: ExecutionContext, env: any) => WorkerEntrypointWithFetch);
}

export class BearerAuthProvider {
  constructor(private options: BearerAuthProviderOptions) {}

  fetch(
    request: Request,
    env: any,
    ctx: ExecutionContext
  ): Response | Promise<Response> {
    const url = new URL(request.url);

    return this.handleApiRequest(request, env, ctx);
  }

  private async handleApiRequest(
    request: Request,
    env: any,
    ctx: ExecutionContext
  ) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized: Missing or invalid access token", {
        status: 401,
      });
    }

    // chop off the "Bearer " prefix
    const accessToken = authHeader.substring(7);

    // Perform any optional validation
    const error = await this.options.validateToken?.(accessToken);
    if (error) {
      return new Response(error.message, { status: 401 });
    }

    ctx.props = { accessToken };

    return this.invokeHandler(this.options.apiHandler, request, env, ctx);
  }

  private invokeHandler(
    handler:
      | ExportedHandlerWithFetch
      | (new (ctx: ExecutionContext, env: any) => WorkerEntrypointWithFetch),
    request: Request,
    env: any,
    ctx: ExecutionContext
  ) {
    if (
      typeof handler === "object" &&
      handler !== null &&
      typeof handler.fetch === "function"
    ) {
      return handler.fetch(
        request as Parameters<ExportedHandlerWithFetch["fetch"]>[0],
        env,
        ctx
      );
    } else if (
      typeof handler === "function" &&
      handler.prototype instanceof WorkerEntrypoint
    ) {
      const handlerInstance = new handler(ctx, env);
      return handlerInstance.fetch(request);
    }

    throw new Error("Invalid API handler");
  }
}
