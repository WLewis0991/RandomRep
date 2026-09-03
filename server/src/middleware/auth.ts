import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

let jwksCache:
  | { jwks: ReturnType<typeof createRemoteJWKSet>; key: string }
  | undefined;

function getJwks(authUrl: string) {
  if (jwksCache && jwksCache.key === authUrl) return jwksCache.jwks;
  const jwks = createRemoteJWKSet(
    new URL(`${authUrl}/.well-known/jwks.json`),
  );
  jwksCache = { jwks, key: authUrl };
  return jwks;
}

function authOrigin(authUrl: string): string {
  const url = new URL(authUrl);
  return `${url.protocol}//${url.host}`;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authUrl = process.env.NEON_AUTH_URL;

  if (!authUrl) {
    console.error("[Auth] NEON_AUTH_URL is not configured");
    return res.status(500).json({ error: "Auth not configured" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);
  const issuer = authOrigin(authUrl);

  try {
    const { payload } = await jwtVerify(token, getJwks(authUrl), {
      issuer,
      audience: issuer,
    });

    if (!payload.sub) {
      return res.status(401).json({ error: "Invalid session data" });
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    console.error("[Auth] Session verification failed:", error);
    return res.status(401).json({ error: "Failed to verify session" });
  }
}
