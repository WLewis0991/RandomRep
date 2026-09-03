import type { Request, Response, NextFunction } from "express";

const NEON_AUTH_URL = process.env.NEON_AUTH_URL;

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!NEON_AUTH_URL) {
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

  try {
    const response = await fetch(`${NEON_AUTH_URL}/get-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const data = (await response.json()) as {
      data?: { user?: { id?: string } };
      user?: { id?: string };
    };
    const user = data?.data?.user ?? data?.user;

    if (!user?.id) {
      return res.status(401).json({ error: "Invalid session data" });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    console.error("[Auth] Session verification failed:", error);
    return res.status(401).json({ error: "Failed to verify session" });
  }
}
