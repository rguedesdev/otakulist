import { mkdir } from "node:fs/promises";

import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import mercurius from "mercurius";
import mongoose from "mongoose";

import { env } from "./config/env.js";
import { resolvers, schema } from "./graphql/index.js";
import { registerUploadRoutes } from "./services/upload.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info",
    },
    bodyLimit: env.MAX_AVATAR_SIZE_BYTES + 64 * 1024,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
  });
  await app.register(cookie);
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(multipart, {
    limits: {
      files: 1,
      fields: 0,
      parts: 1,
      fileSize: env.MAX_AVATAR_SIZE_BYTES,
    },
  });
  await mkdir(env.UPLOAD_DIR, { recursive: true });
  await app.register(fastifyStatic, {
    root: env.UPLOAD_DIR,
    prefix: "/uploads/",
    decorateReply: false,
  });

  registerUploadRoutes(app);

  await app.register(mercurius, {
    schema,
    resolvers,
    graphiql: env.NODE_ENV === "development",
    path: "/graphql",
    context: (request, reply) => ({ app, request, reply }),
  });

  app.get("/health", async (_request, reply) => {
    const database = mongooseConnectionState();
    if (database !== "connected") reply.code(503);
    return { status: database === "connected" ? "ok" : "unavailable", database };
  });

  return app;
}

function mongooseConnectionState() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "unknown";
}
