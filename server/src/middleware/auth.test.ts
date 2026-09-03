import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { requireAuth, type AuthenticatedRequest } from "./auth";

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => ({})),
  jwtVerify: vi.fn(),
}));

import { jwtVerify } from "jose";

function mockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

beforeEach(() => {
  vi.stubEnv("NEON_AUTH_URL", "https://auth.example.com/neondb/auth");
  vi.mocked(jwtVerify).mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
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

  it("attaches userId and calls next on a valid signed JWT", async () => {
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { sub: "user-456" },
      protectedHeader: { alg: "EdDSA" },
    });

    const req = {
      headers: { authorization: "Bearer eyJtoken" },
    } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req as AuthenticatedRequest, res, next);

    const [, , options] = vi.mocked(jwtVerify).mock.calls[0];
    expect(options).toMatchObject({
      issuer: "https://auth.example.com",
      audience: "https://auth.example.com",
    });
    expect((req as AuthenticatedRequest).userId).toBe("user-456");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when the token fails signature verification", async () => {
    vi.mocked(jwtVerify).mockRejectedValue(new Error("bad signature"));

    const req = {
      headers: { authorization: "Bearer bad-token" },
    } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req as AuthenticatedRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the token has no sub claim", async () => {
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: {},
      protectedHeader: { alg: "EdDSA" },
    });

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
