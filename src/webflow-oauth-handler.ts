import type {
  AuthRequest,
  OAuthHelpers,
} from "@cloudflare/workers-oauth-provider";
import { Hono } from "hono";
import { WebflowClient } from "webflow-api";
import {
  fetchUpstreamAuthToken,
  getUpstreamAuthorizeUrl,
  Props,
} from "./utils";
import { env } from "cloudflare:workers";
import {
  clientIdAlreadyApproved,
  parseRedirectApproval,
  renderApprovalDialog,
} from "./workers-oauth-utils";

const app = new Hono<{ Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers } }>();

app.get("/authorize", async (c) => {
  const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
  const { clientId } = oauthReqInfo;
  if (!clientId) {
    return c.text("Invalid request", 400);
  }

  if (
    await clientIdAlreadyApproved(
      c.req.raw,
      oauthReqInfo.clientId,
      env.COOKIE_ENCRYPTION_KEY
    )
  ) {
    return redirectToWebflow(c.req.raw, oauthReqInfo);
  }

  return renderApprovalDialog(c.req.raw, {
    client: await c.env.OAUTH_PROVIDER.lookupClient(clientId),
    server: {
      name: "Webflow MCP Server",
      logo: "https://dhygzobemt712.cloudfront.net/Logo/Social_Square_Blue.png",
      description:
        "You are about to get redirect to Webflow OAuth consent screen to give Webflow MCP server access to some of your sites. If you didn't initiate that request, click on cancel or close this tab.",
    },
    state: { oauthReqInfo }, // arbitrary data that flows through the form submission below
  });
});

app.post("/authorize", async (c) => {
  // Validates form submission, extracts state, and generates Set-Cookie headers to skip approval dialog next time
  const { state, headers } = await parseRedirectApproval(
    c.req.raw,
    env.COOKIE_ENCRYPTION_KEY
  );
  if (!state.oauthReqInfo) {
    return c.text("Invalid request", 400);
  }

  return redirectToWebflow(c.req.raw, state.oauthReqInfo, headers);
});

async function redirectToWebflow(
  request: Request,
  oauthReqInfo: AuthRequest,
  headers: Record<string, string> = {}
) {
  return new Response(null, {
    status: 302,
    headers: {
      ...headers,
      location: getUpstreamAuthorizeUrl({
        upstream_url: "https://webflow.com/oauth/authorize",
        scope:
          "assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write ecommerce:read ecommerce:write users:read users:write site_activity:read workspace:read workspace:write app_subscriptions:read site_config:read site_config:write components:read components:write comments:read comments:write",
        client_id: env.WEBFLOW_CLIENT_ID,
        redirect_uri: new URL("/callback", request.url).href,
        state: btoa(JSON.stringify(oauthReqInfo)),
      }),
    },
  });
}

/**
 * OAuth Callback Endpoint
 *
 * This route handles the callback from GitHub after user authentication.
 * It exchanges the temporary code for an access token, then stores some
 * user metadata & the auth token as part of the 'props' on the token passed
 * down to the client. It ends by redirecting the client back to _its_ callback URL
 */
app.get("/callback", async (c) => {
  // Get the oathReqInfo out of KV
  const oauthReqInfo = JSON.parse(
    atob(c.req.query("state") as string)
  ) as AuthRequest;
  if (!oauthReqInfo.clientId) {
    return c.text("Invalid state", 400);
  }

  // Exchange the code for an access token
  const [accessToken, errResponse] = await fetchUpstreamAuthToken({
    upstream_url: "https://webflow.com/oauth/access_token",
    client_id: c.env.WEBFLOW_CLIENT_ID,
    client_secret: c.env.WEBFLOW_CLIENT_SECRET,
    code: c.req.query("code"),
    grant_type: "authorization_code",
    redirect_uri: new URL("/callback", c.req.url).href,
  });
  if (errResponse) return errResponse;

  // Fetch the user info from Webflow
  const webflowClient = new WebflowClient({
    accessToken: accessToken,
  });
  const user = await webflowClient.token.authorizedBy();
  const { id, firstName, lastName, email } = user;

  // Return back to the MCP client a new token
  const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
    request: oauthReqInfo,
    userId: id || "not_provided",
    metadata: {
      label: `${firstName} ${lastName}`,
    },
    scope: oauthReqInfo.scope,

    // This will be available on this.props inside WebflowMCP
    props: {
      id,
      firstName,
      lastName,
      email,
      accessToken,
    },
  });

  return Response.redirect(redirectTo);
});

export { app as WebflowOAuthHandler };
