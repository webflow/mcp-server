import { WebflowClient } from "webflow-api";
import { getDB } from "../db";
import { siteAuth, userAuth } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { jsonResponse } from "../../utils/jsonUtils";
import {
  signStateWithToolConfig,
  signUserSession,
  verifyState,
  verifyStateWithToolConfig,
  verifyUserSession,
} from "../jwt";
import { parseRequest } from "../../utils/parseRequest";
import { corsHeaders } from "../../utils/corsHeaders";
import { OauthScope } from "webflow-api/api/types/OAuthScope";
import { EnvWithOAuthProvider } from "../../types/env";
import { renderAuthorizePage } from "./pages/authorize";
import { DE_AUTH_STATE } from "../../config/constant";
import { getToolConfig } from "../../utils/getToolConfig";

export const handleCodeCallback = async (
  code: string,
  redirectUri: string,
  env: EnvWithOAuthProvider
) => {
  let accessToken: string;
  try {
    accessToken = await WebflowClient.getAccessToken({
      clientId: env.WEBFLOW_CLIENT_ID,
      clientSecret: env.WEBFLOW_CLIENT_SECRET,
      code: code,
      redirectUri,
    });
  } catch (error) {
    console.error(error);
    return null;
  }

  const webflow = new WebflowClient({ accessToken });
  const { sites } = await webflow.sites.list();
  if (!sites) {
    return null;
  }

  const user = await webflow.token.authorizedBy();

  for (const site of sites) {
    await insertOrUpdateSiteAuth(
      {
        id: site.id,
        accessToken,
      },
      env
    );
  }

  return {
    accessToken,
    sites,
    user,
  };
};

export const handleAuthToken = async (
  request: Request,
  env: Env
) => {
  const { body } = await parseRequest(request);
  const { idToken, siteId } = body as {
    idToken: string;
    siteId: string;
  };
  if (!idToken || !siteId) {
    return jsonResponse(
      {
        error: "Invalid request",
      },
      400
    );
  }
  const data = {
    idToken,
    siteId,
  };

  const site = await getDB(env).query.siteAuth.findFirst({
    where: eq(siteAuth.siteId, data.siteId),
  });
  if (!site) {
    return jsonResponse(
      {
        error: "Authorization failed",
      },
      400
    );
  }

  const accessToken = site.accessToken;

  try {
    const res = await fetch(
      "https://api.webflow.com/beta/token/resolve",
      {
        method: "POST",
        body: JSON.stringify({
          idToken,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const user = (await res.json()) as { id: string };
    const signature = await signUserSession(
      {
        ...user,
        siteId: data.siteId,
      },
      env
    );
    await insertOrUpdateUserAuth(
      {
        id: user.id,
        siteId: data.siteId,
        accessToken: site.accessToken,
      },
      env
    );
    return jsonResponse({
      token: signature.token,
      expiresAt: signature.expiresAt,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      {
        error: "Invalid request",
      },
      400
    );
  }
};

const insertOrUpdateUserAuth = async (
  user: {
    id: string;
    siteId: string;
    accessToken: string;
  },
  env: Env
) => {
  const _user = await getDB(env).query.userAuth.findFirst({
    where: and(
      eq(userAuth.userId, user.id),
      eq(userAuth.siteId, user.siteId)
    ),
  });
  if (_user) {
    await getDB(env)
      .update(userAuth)
      .set({
        accessToken: user.accessToken,
      })
      .where(eq(userAuth.userId, user.id));
  } else {
    await getDB(env).insert(userAuth).values({
      accessToken: user.accessToken,
      userId: user.id,
      siteId: user.siteId,
    });
  }
};

const insertOrUpdateSiteAuth = async (
  site: {
    id: string;
    accessToken: string;
  },
  env: Env
) => {
  const _site = await getDB(env).query.siteAuth.findFirst({
    where: eq(siteAuth.siteId, site.id),
  });
  if (_site) {
    await getDB(env)
      .update(siteAuth)
      .set({
        accessToken: site.accessToken,
      })
      .where(eq(siteAuth.siteId, site.id));
  } else {
    await getDB(env).insert(siteAuth).values({
      accessToken: site.accessToken,
      siteId: site.id,
    });
  }
};

export const getUserTokenFromHeaders = (
  headers: Headers
) => {
  const token = headers.get("Authorization");
  if (!token) {
    return null;
  }
  const [, accessToken] = token.split(" ");
  return accessToken;
};

export const getUser = async (token: string, env: Env) => {
  const user = verifyUserSession(token, env);
  if (!user) {
    return null;
  }
  const _userAuth = await getDB(
    env
  ).query.userAuth.findFirst({
    where: and(
      eq(userAuth.userId, user.id),
      eq(userAuth.siteId, user.siteId)
    ),
  });

  if (!userAuth) {
    return null;
  }
  return _userAuth;
};

export const getAuthorizeUrl = (
  state: string,
  redirectUri: string,
  env: EnvWithOAuthProvider
) => {
  const url = WebflowClient.authorizeURL({
    clientId: env.WEBFLOW_CLIENT_ID,
    state,
    scope: [
      "assets:read",
      "assets:write",
      "authorized_user:read",
      "cms:read",
      "cms:write",
      "custom_code:read",
      "custom_code:write",
      "forms:read",
      "forms:write",
      "pages:read",
      "pages:write",
      "sites:read",
      "sites:write",
      "ecommerce:read",
      "ecommerce:write",
      "users:read",
      "users:write",
      "site_activity:read",
      "workspace:read",
      "workspace:write",
      "app_subscriptions:read",
      "site_config:read",
      "site_config:write",
      "components:read",
      "components:write",
      "comments:read",
      "comments:write",
    ] as OauthScope[],
    redirectUri: redirectUri,
  });
  return url;
};

const handleMCPOAuthCallback = async (
  url: URL,
  state: string,
  code: string,
  env: EnvWithOAuthProvider
) => {
  const decodedStateWithToolConfig =
    verifyStateWithToolConfig(state, env);
  if (!decodedStateWithToolConfig) {
    return new Response("Invalid state", {
      status: 400,
      headers: corsHeaders,
    });
  }
  const { state: oauthReqInfo, toolConfig } =
    decodedStateWithToolConfig;
  const decodedState = verifyState(oauthReqInfo, env);
  if (!decodedState) {
    return new Response("Invalid state", {
      status: 400,
      headers: corsHeaders,
    });
  }
  const result = await handleCodeCallback(
    code,
    `${url.origin}/oauth/callback`,
    env
  );

  if (!result) {
    return new Response("Invalid code", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { redirectTo } =
    await env.OAUTH_PROVIDER.completeAuthorization({
      request: decodedState,
      metadata: {},
      userId: result.user.id!,
      props: {
        accessToken: result.accessToken,
        user: result.user,
        toolConfig,
      },
      scope: [],
    });
  if (!redirectTo) {
    return new Response("Invalid redirect URI", {
      status: 400,
      headers: corsHeaders,
    });
  }

  return Response.redirect(redirectTo, 302);
};

const handleDesignerExtensionOAuthCallback = async (
  url: URL,
  code: string,
  env: EnvWithOAuthProvider
) => {
  const result = await handleCodeCallback(
    code,
    `${url.origin}/oauth/callback`,
    env
  );
  if (!result) {
    return new Response("Invalid code", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const html = `
    <html>
    <body>
    <p>Please wait while we redirect you to the Webflow Designer...</p>
    <script>
     window.opener.postMessage('authComplete', '*');
     window.close();
    </script>
    </body>
    </html>
    `;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
};

export const handleOAuth = async (
  request: Request,
  env: EnvWithOAuthProvider,
  ctx: ExecutionContext
) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();
  //handle authorize GET & POST requests
  if (pathname === "/oauth/authorize") {
    if (method === "GET") {
      const html = await renderAuthorizePage(
        request,
        env,
        ctx
      );
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    if (method === "POST") {
      const url = new URL(request.url);
      const formData = await request.formData();
      const state = formData.get("state");
      const toolConfig = getToolConfig(formData);
      const newStateWithToolConfig =
        signStateWithToolConfig(
          {
            state: state as string,
            toolConfig,
          },
          env
        );
      if (!state || typeof state !== "string") {
        return new Response("Invalid state", {
          status: 400,
          headers: corsHeaders,
        });
      }
      const webflowAuthUrl = getAuthorizeUrl(
        newStateWithToolConfig,
        `${url.origin}/oauth/callback`,
        env
      );
      return Response.redirect(webflowAuthUrl, 302);
    }
  }

  try {
    if (pathname === "/oauth/callback") {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code || !state) {
        return new Response("Invalid code", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const isFromDesignerExtension =
        state === DE_AUTH_STATE;

      if (isFromDesignerExtension) {
        return handleDesignerExtensionOAuthCallback(
          url,
          code,
          env
        );
      }
      return handleMCPOAuthCallback(url, state, code, env);
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response("Not found", {
    status: 404,
    headers: corsHeaders,
  });
};

export const getDEAuthUrl = (
  url: URL,
  env: EnvWithOAuthProvider
) => {
  return getAuthorizeUrl(
    DE_AUTH_STATE,
    `${url.origin}/oauth/callback`,
    env
  );
};
