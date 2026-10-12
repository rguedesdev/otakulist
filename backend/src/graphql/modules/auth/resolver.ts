import bcrypt from "bcrypt";
import { GraphQLError } from "graphql";
import { env } from "../../../config/env.js";
import { Session } from "../../../models/session.js";
import { User } from "../../../models/user.js";
import { loginSchema, registerSchema, updateProfileSchema, usernameSchema } from "../../../services/auth/schemas.js";
import { REFRESH_COOKIE, clearRefreshCookie, createAccessToken, createSessionTokens, hashToken, setRefreshCookie, verifyRefreshToken } from "../../../services/auth/tokens.js";
import type { IResolvers, MercuriusContext } from "mercurius";
import { badInput, unauthenticated } from "../../errors.js";
import { currentUser } from "./authorization.js";

async function authResponse(context: MercuriusContext, user: any) {
  const tokens = await createSessionTokens(context.app, context.request, {
    id: user.id,
    role: user.role,
    username: user.username,
  });
  setRefreshCookie(context.reply, tokens.refreshToken);
  return { accessToken: tokens.accessToken, user };
}

export const authResolvers: IResolvers<any, MercuriusContext> = {
  User: {
    id: (user: any) => user.id ?? user._id.toString(),
    showAdultContent: (user: any) => Boolean(user.showAdultContent),
    hideAdultContentFromVisitors: (user: any) => Boolean(user.hideAdultContentFromVisitors),
    createdAt: (user: any) => user.createdAt.toISOString(),
    updatedAt: (user: any) => user.updatedAt.toISOString()
  },
  PublicUser: {
    id: (user: any) => user.id ?? user._id.toString(),
    createdAt: (user: any) => user.createdAt.toISOString()
  },
  Query: {
    me: async (_root, _args, context: MercuriusContext) => currentUser(context),
    user: async (_root, args) => {
      const result = usernameSchema.safeParse(args);
      if (!result.success) badInput("Nome de usuário inválido");
      return User.findOne({ username: result.data.username });
    }
  },
  Mutation: {
    register: async (_root, args, context: MercuriusContext) => {
      const result = registerSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { username, displayName, email, password } = result.data.input;
      const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

      try {
        // Role is deliberately not accepted from public input.
        const user = await User.create({ username, displayName, email, passwordHash, role: "FREE" });
        return authResponse(context, user);
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("E-mail ou nome de usuário já cadastrado", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    login: async (_root, args, context: MercuriusContext) => {
      const result = loginSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const user = await User.findOne({ email: result.data.input.email }).select("+passwordHash +email");
      const valid = user && (await bcrypt.compare(result.data.input.password, user.passwordHash));
      if (!valid) unauthenticated("E-mail ou senha inválidos");

      return authResponse(context, user);
    },
    refreshSession: async (_root, _args, context: MercuriusContext) => {
      const token = context.request.cookies[REFRESH_COOKIE];
      if (!token) unauthenticated();

      try {
        const payload = verifyRefreshToken(context.app, token);
        const session = await Session.findOne({
          _id: payload.sid,
          userId: payload.sub,
          tokenHash: hashToken(token),
          expiresAt: { $gt: new Date() },
        });
        if (!session) unauthenticated("Sessão inválida ou expirada");

        const user = await User.findById(payload.sub).select("+email");
        if (!user) unauthenticated();
        setRefreshCookie(context.reply, token);
        return { accessToken: createAccessToken(context.app, user), user };
      } catch (error) {
        clearRefreshCookie(context.reply);
        if (error instanceof GraphQLError) throw error;
        unauthenticated("Sessão inválida ou expirada");
      }
    },
    logout: async (_root, _args, context: MercuriusContext) => {
      const token = context.request.cookies[REFRESH_COOKIE];
      clearRefreshCookie(context.reply);
      if (!token) return true;

      try {
        const payload = verifyRefreshToken(context.app, token);
        await Session.deleteOne({ _id: payload.sid, tokenHash: hashToken(token) });
      } catch {
        // Logout remains idempotent even with an invalid/expired cookie.
      }
      return true;
    },
    updateMyProfile: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();

      const result = updateProfileSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      user.username = result.data.input.username;
      user.displayName = result.data.input.displayName;
      user.bio = result.data.input.bio;
      user.email = result.data.input.email;
      user.showAdultContent = result.data.input.showAdultContent;
      user.hideAdultContentFromVisitors = result.data.input.hideAdultContentFromVisitors;

      try {
        await user.save();
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("E-mail ou nome de usuário já cadastrado", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }

      return { accessToken: createAccessToken(context.app, user), user };
    }
  }
};
