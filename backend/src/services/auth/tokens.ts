import { createHash, randomUUID } from "node:crypto";

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../config/env.js";
import { Session } from "../../models/session.js";
import type { UserRole } from "../../models/user.js";

export const REFRESH_COOKIE = "otakulist_refresh";

export interface AccessTokenPayload {
  sub: string;
  type: "access";
  role: UserRole;
  username: string;
}

interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  sid: string;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createAccessToken(
  app: FastifyInstance,
  user: { id: string; role: UserRole; username: string },
) {
  return app.jwt.sign(
    { sub: user.id, type: "access", role: user.role, username: user.username } satisfies AccessTokenPayload,
    { expiresIn: env.JWT_ACCESS_TTL_SECONDS },
  );
}

export async function createSessionTokens(
  app: FastifyInstance,
  request: FastifyRequest,
  user: { id: string; role: UserRole; username: string },
) {
  const accessToken = createAccessToken(app, user);
  const sid = randomUUID();
  const refreshToken = app.jwt.sign(
    { sub: user.id, type: "refresh", sid } satisfies RefreshTokenPayload,
    { expiresIn: env.JWT_REFRESH_TTL_SECONDS },
  );

  await Session.create({
    _id: sid,
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000),
    ip: request.ip,
    ...(request.headers["user-agent"] ? { userAgent: request.headers["user-agent"] } : {}),
  });

  return { accessToken, refreshToken };
}

export function setRefreshCookie(reply: FastifyReply, token: string) {
  reply.setCookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/graphql",
    maxAge: env.JWT_REFRESH_TTL_SECONDS,
  });
}

export function clearRefreshCookie(reply: FastifyReply) {
  reply.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/graphql",
  });
}

export function verifyRefreshToken(app: FastifyInstance, token: string) {
  const payload = app.jwt.verify<RefreshTokenPayload>(token);
  if (payload.type !== "refresh" || !payload.sid || !payload.sub) {
    throw new Error("Tipo de token inválido");
  }
  return payload;
}
