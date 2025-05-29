import { OAuthHelpers } from "@cloudflare/workers-oauth-provider";

export type EnvWithOAuthProvider = Env & {
  OAUTH_PROVIDER: OAuthHelpers;
};
