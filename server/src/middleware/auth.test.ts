import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { requireAuth, type AuthenticatedRequest } from "./auth";

function mockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

beforeEach(() => {
  vi.stubEnv("NEON_AUTH_URL", "https://auth.example.com/neondb/auth");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("requireAuth", () => {
  it("returns 401 when no authorization header is present", async () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req as AuthenticatedRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when authorization is not a Bearer token", async () => {
    const req = { headers: { authorization: "Basic abc123" } } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req as AuthenticatedRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches userId and calls next on a valid session", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ data: { user: { id: "user-456" } } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const req = {
      headers: { authorization: "Bearer token-123" },
    } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req as AuthenticatedRequest, res, next);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://auth.example.com/neondb/auth/get-session",
      expect.objectContaining({
        headers: { Authorization: "Bearer token-123" },
      }),
    );
    expect((req as AuthenticatedRequest).userId).toBe("user-456");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when the session endpoint rejects the token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false }),
    );

    const req = {
      headers: { authorization: "Bearer bad-token" },
    } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req as AuthenticatedRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the session contains no user id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      }),
    );

    const req = {
      headers: { authorization: "Bearer token" },
    } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req as AuthenticatedRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
