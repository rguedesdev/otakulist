import { GraphQLError } from "graphql";
import type { MercuriusContext } from "mercurius";

import { Session } from "../../../models/session.js";
import { User } from "../../../models/user.js";
import { REFRESH_COOKIE, hashToken, verifyRefreshToken, type AccessTokenPayload } from "../../../services/auth/tokens.js";
import { unauthenticated } from "../../errors.js";

export async function currentUser(context: MercuriusContext) {
  try {
    const payload = await context.request.jwtVerify<AccessTokenPayload>();
    if (payload.type !== "access") return null;
    return User.findById(payload.sub).select("+email");
  } catch {
    return null;
  }
}

export async function profileViewer(context: MercuriusContext) {
  const authenticatedUser = await currentUser(context);
  if (authenticatedUser) return authenticatedUser;

  const token = context.request.cookies[REFRESH_COOKIE];
  if (!token) return null;

  try {
    const payload = verifyRefreshToken(context.app, token);
    const session = await Session.exists({
      _id: payload.sid,
      userId: payload.sub,
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    return session ? User.findById(payload.sub) : null;
  } catch {
    return null;
  }
}

export async function requireZeus(context: MercuriusContext) {
  const user = await currentUser(context);
  if (!user) unauthenticated();
  if (user.role !== "ZEUS") {
    throw new GraphQLError("Acesso restrito à administração", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}
