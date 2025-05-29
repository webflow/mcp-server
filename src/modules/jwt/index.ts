import jwt from "jsonwebtoken";
import { JWT_EXPIRATION_TIME } from "../../config/constant";
import { env } from "cloudflare:workers";
import { AuthRequest } from "@cloudflare/workers-oauth-provider";
import { ToolConfig } from "../../utils/getToolConfig";

export const signUserSession = async (
  user: {
    id: string;
    siteId: string;
  },
  env: Env
) => {
  const token = jwt.sign(user, env.WEBFLOW_CLIENT_SECRET, {
    expiresIn: JWT_EXPIRATION_TIME,
  });
  const jwtDecode = jwt.decode(token, {
    json: true,
  });
  if (!jwtDecode) {
    throw new Error("Invalid token");
  }

  return {
    token,
    expiresAt: jwtDecode.exp || 0,
  };
};

export const verifyUserSession = (
  token: string,
  env: Env
) => {
  const _env = env;
  try {
    const decoded = jwt.verify(
      token,
      _env.WEBFLOW_CLIENT_SECRET
    ) as {
      id: string;
      siteId: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const signState = (
  data: {
    oauthReqInfo: AuthRequest;
  },
  env: Env
) => {
  const token = jwt.sign(data, env.WEBFLOW_CLIENT_SECRET, {
    expiresIn: JWT_EXPIRATION_TIME,
  });
  return token;
};
export const signStateWithToolConfig = (
  data: {
    state: string;
    toolConfig: ToolConfig;
  },
  env: Env
) => {
  const token = jwt.sign(data, env.WEBFLOW_CLIENT_SECRET, {
    expiresIn: JWT_EXPIRATION_TIME,
  });
  return token;
};
export const verifyState = (
  token: string,
  env: Env
): AuthRequest | null => {
  try {
    const decoded = jwt.verify(
      token,
      env.WEBFLOW_CLIENT_SECRET
    ) as {
      oauthReqInfo: AuthRequest;
    };
    if (!decoded.oauthReqInfo) {
      return null;
    }
    return decoded.oauthReqInfo;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const verifyStateWithToolConfig = (
  token: string,
  env: Env
) => {
  try {
    const decoded = jwt.verify(
      token,
      env.WEBFLOW_CLIENT_SECRET
    ) as {
      state: string;
      toolConfig: ToolConfig;
    };
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
};
