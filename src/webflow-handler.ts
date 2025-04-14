import { OAuthProviderHandler } from "@cloudflare/workers-oauth-provider";
import { z } from "zod";

const DEFAULT_SCOPES = ["pages:read", "collections:read", "sites:read"];

/**
 * Handler for Webflow OAuth authentication
 */
export default class WebflowHandler extends OAuthProviderHandler {
  // Webflow OAuth endpoints
  private authorizeUrl = "https://webflow.com/oauth/authorize";
  private tokenUrl = "https://api.webflow.com/oauth/access_token";

  // Store client credentials
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(options: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }) {
    super();
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.redirectUri = options.redirectUri;
  }

  /**
   * Handle requests to the /authorize endpoint
   */
  async handleAuthorize(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Get parameters from the OAuth client
    const clientId = url.searchParams.get("client_id");
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    const codeChallenge = url.searchParams.get("code_challenge");
    const codeChallengeMethod = url.searchParams.get("code_challenge_method");
    
    if (!clientId || !redirectUri || !state || !codeChallenge) {
      return new Response("Missing required OAuth parameters", { status: 400 });
    }

    // Generate a random authorization code
    const code = crypto.randomUUID();
    
    // Store the PKCE and client information for later validation
    await this.storeAuthorizationData(code, {
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod: codeChallengeMethod || "S256",
      state,
    });

    // Redirect to Webflow's authorization endpoint
    const webflowAuthUrl = new URL(this.authorizeUrl);
    webflowAuthUrl.searchParams.set("client_id", this.clientId);
    webflowAuthUrl.searchParams.set("response_type", "code");
    webflowAuthUrl.searchParams.set("redirect_uri", this.redirectUri);
    webflowAuthUrl.searchParams.set("scope", DEFAULT_SCOPES.join(" "));
    webflowAuthUrl.searchParams.set("state", code); // Using our code as state for webflow

    return Response.redirect(webflowAuthUrl.toString(), 302);
  }

  /**
   * Handle the callback from Webflow's OAuth service
   */
  async handleCallback(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const webflowCode = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // This should match our authorization code
    
    if (!webflowCode || !state) {
      return new Response("Invalid callback parameters", { status: 400 });
    }

    // Get our stored authorization data using the state parameter
    const authData = await this.getAuthorizationData(state);
    if (!authData) {
      return new Response("Invalid authorization state", { status: 400 });
    }

    // Exchange the code for a Webflow access token
    const tokenResponse = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        code: webflowCode,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Webflow token exchange failed:", error);
      return new Response("Failed to obtain access token from Webflow", { status: 500 });
    }

    const webflowTokens = await tokenResponse.json();
    
    // Store the webflow tokens with our authorization code
    await this.storeTokens(state, {
      access_token: webflowTokens.access_token,
      token_type: "Bearer",
      expires_in: webflowTokens.expires_in,
      refresh_token: webflowTokens.refresh_token,
      scope: webflowTokens.scope,
    });

    // Redirect back to the MCP client with our authorization code
    const redirectUrl = new URL(authData.redirectUri);
    redirectUrl.searchParams.set("code", state);
    redirectUrl.searchParams.set("state", authData.state);

    return Response.redirect(redirectUrl.toString(), 302);
  }

  /**
   * Handle token exchange request from the MCP client
   */
  async handleToken(request: Request): Promise<Response> {
    const contentType = request.headers.get("content-type") || "";
    let formData: FormData | URLSearchParams;
    
    if (contentType.includes("application/x-www-form-urlencoded")) {
      formData = await request.formData();
    } else {
      const body = await request.text();
      formData = new URLSearchParams(body);
    }

    const grantType = formData.get("grant_type");
    const code = formData.get("code");
    const redirectUri = formData.get("redirect_uri");
    const clientId = formData.get("client_id");
    const codeVerifier = formData.get("code_verifier");

    if (!grantType || !code || !redirectUri || !clientId || !codeVerifier) {
      return this.jsonResponse({ error: "invalid_request" }, { status: 400 });
    }

    if (grantType !== "authorization_code") {
      return this.jsonResponse({ error: "unsupported_grant_type" }, { status: 400 });
    }

    // Get the stored authorization data
    const authData = await this.getAuthorizationData(code);
    if (!authData) {
      return this.jsonResponse({ error: "invalid_grant" }, { status: 400 });
    }

    // Verify the code verifier
    const verifierValid = await this.verifyCodeChallenge(
      codeVerifier,
      authData.codeChallenge,
      authData.codeChallengeMethod
    );

    if (!verifierValid) {
      return this.jsonResponse({ error: "invalid_grant" }, { status: 400 });
    }

    // Get the stored Webflow tokens
    const tokens = await this.getTokens(code);
    if (!tokens) {
      return this.jsonResponse({ error: "invalid_grant" }, { status: 400 });
    }

    // User info from Webflow API
    const userInfo = await this.getUserInfo(tokens.access_token);

    // Create our own access token for the MCP client
    const mcpAccessToken = await this.createAccessToken({
      sub: userInfo.id,
      name: userInfo.email,
      email: userInfo.email,
      webflow_token: tokens.access_token,
      webflow_refresh_token: tokens.refresh_token,
    });

    // Create a refresh token if we received one from Webflow
    let refreshToken = undefined;
    if (tokens.refresh_token) {
      refreshToken = await this.createRefreshToken(code);
    }

    // Clean up the stored authorization data and tokens
    await this.clearAuthorizationData(code);
    await this.clearTokens(code);

    // Return the MCP access token to the client
    return this.jsonResponse({
      access_token: mcpAccessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
    });
  }

  /**
   * Handle refresh token requests
   */
  async handleRefreshToken(request: Request): Promise<Response> {
    const formData = await request.formData();
    const grantType = formData.get("grant_type");
    const refreshToken = formData.get("refresh_token");

    if (grantType !== "refresh_token" || !refreshToken) {
      return this.jsonResponse({ error: "invalid_request" }, { status: 400 });
    }

    // Validate the refresh token and get the associated data
    const tokenData = await this.validateRefreshToken(refreshToken);
    if (!tokenData || !tokenData.webflow_refresh_token) {
      return this.jsonResponse({ error: "invalid_grant" }, { status: 400 });
    }

    // Refresh the Webflow token
    const tokenResponse = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: tokenData.webflow_refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      return this.jsonResponse({ error: "invalid_grant" }, { status: 400 });
    }

    const webflowTokens = await tokenResponse.json();

    // Create a new MCP access token with the refreshed Webflow token
    const newAccessToken = await this.createAccessToken({
      ...tokenData,
      webflow_token: webflowTokens.access_token,
      webflow_refresh_token: webflowTokens.refresh_token || tokenData.webflow_refresh_token,
    });

    // Create a new refresh token
    const newRefreshToken = await this.rotateRefreshToken(refreshToken);

    return this.jsonResponse({
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: newRefreshToken,
    });
  }

  /**
   * Get user information from the Webflow API
   */
  private async getUserInfo(accessToken: string): Promise<{ id: string; email: string }> {
    const response = await fetch("https://api.webflow.com/v2/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info from Webflow");
    }

    const data = await response.json();
    return {
      id: data.id || data._id || "unknown",
      email: data.email || "unknown@example.com",
    };
  }

  /**
   * Helper method to return JSON responses
   */
  private jsonResponse(data: any, options = {}): Response {
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }
}