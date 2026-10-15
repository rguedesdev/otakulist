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
import { User } from "./models/user.js";
import type { AccessTokenPayload } from "./services/auth/tokens.js";
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

  app.get<{ Querystring: { kind?: string; id?: string; action?: string; q?: string; limit?: string } }>("/catalog-import/catalog", async (request, reply) => {
    let payload: AccessTokenPayload;
    try {
      payload = await request.jwtVerify<AccessTokenPayload>();
    } catch {
      return reply.code(401).send({ message: "Entre novamente para importar dados." });
    }
    if (payload.type !== "access") return reply.code(401).send({ message: "Token de acesso inválido." });
    const user = await User.findById(payload.sub).select("role");
    if (!user || user.role !== "ZEUS") return reply.code(403).send({ message: "Acesso restrito à administração." });

    const { kind, id, action, q, limit } = request.query;
    if (!kind || !["anime", "characters", "people", "producers"].includes(kind)) {
      return reply.code(400).send({ message: "Tipo de catálogo inválido." });
    }
    let path: string;
    if (id) {
      if (!/^\d+$/.test(id) || !["full", "relations"].includes(action || "")) {
        return reply.code(400).send({ message: "Consulta de detalhes inválida." });
      }
      if (action === "relations" && kind !== "anime") return reply.code(400).send({ message: "Relações só estão disponíveis para anime." });
      path = `/${kind}/${id}/${action}`;
    } else {
      if (!q?.trim()) return reply.code(400).send({ message: "Informe um termo para buscar." });
      path = `/${kind}`;
    }

    const params = new URLSearchParams();
    if (!id) {
      params.set("q", q!.trim().slice(0, 120));
      const numericLimit = Number(limit || 12);
      params.set("limit", String(Number.isInteger(numericLimit) ? Math.max(1, Math.min(numericLimit, 20)) : 12));
    }
    const url = `https://api.tenrai.org/v1${path}${params.size ? `?${params}` : ""}`;
    let response: Response | undefined;
    let networkError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetch(url, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(15_000),
        });
        break;
      } catch (error) {
        networkError = error;
        if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    if (!response) {
      const cause = networkError instanceof Error && networkError.cause instanceof Error ? networkError.cause : networkError;
      const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "NETWORK_ERROR";
      request.log.warn({ err: networkError, providerCode: code }, "Catalog import provider request failed");
      const message = code === "EAI_AGAIN" || code === "ENOTFOUND"
        ? `O backend não conseguiu resolver api.tenrai.org via DNS (${code}). Verifique o DNS e o acesso externo do servidor.`
        : code.includes("TIMEOUT")
          ? `A conexão HTTPS de saída com api.tenrai.org expirou (${code}). Verifique as regras de rede do servidor.`
          : `Falha de rede ao acessar api.tenrai.org (${code}). Verifique se o backend tem acesso externo HTTPS.`;
      return reply.code(502).send({ message });
    }
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return reply.code(response.status === 429 ? 429 : 502).send({
        message: response.status === 429 ? "A fonte está limitando as consultas. Aguarde alguns segundos e tente novamente." : `A fonte externa respondeu com erro (${response.status}).`,
      });
    }
    return body;
  });

  return app;
}

function mongooseConnectionState() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "unknown";
}
