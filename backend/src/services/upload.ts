import { randomUUID } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";

import { fileTypeFromBuffer } from "file-type";
import type { FastifyInstance, FastifyRequest } from "fastify";
import sharp from "sharp";

import { env } from "../config/env.js";
import { User } from "../models/user.js";
import type { AccessTokenPayload } from "./auth/tokens.js";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function authenticate(request: FastifyRequest) {
  const payload = await request.jwtVerify<AccessTokenPayload>();
  if (payload.type !== "access") throw new Error("Tipo de token inválido");
  return payload;
}

async function readImage(request: FastifyRequest, app: FastifyInstance) {
  try {
    const part = await request.file();
    if (!part) return { error: { status: 400, message: "Envie uma imagem no campo file" } } as const;
    return { buffer: await part.toBuffer() } as const;
  } catch (error) {
    if (error instanceof app.multipartErrors.RequestFileTooLargeError || isPayloadTooLarge(error)) {
      return { error: { status: 413, message: "O upload excede o limite permitido" } } as const;
    }
    throw error;
  }
}

async function validateImage(buffer: Buffer) {
  const detectedType = await fileTypeFromBuffer(buffer);
  return Boolean(detectedType && acceptedTypes.has(detectedType.mime));
}

export function registerUploadRoutes(app: FastifyInstance) {
  app.post("/uploads/avatar", async (request, reply) => {
    let auth: AccessTokenPayload;
    try {
      auth = await authenticate(request);
    } catch {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    const upload = await readImage(request, app);
    if ("error" in upload) return reply.code(upload.error.status).send({ error: upload.error.message });
    const { buffer } = upload;

    if (!(await validateImage(buffer))) {
      return reply.code(415).send({ error: "Formato inválido. Use JPEG, PNG ou WebP" });
    }

    await mkdir(env.UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    const destination = join(env.UPLOAD_DIR, filename);

    try {
      await sharp(buffer, { failOn: "error", limitInputPixels: 40_000_000 })
        .rotate()
        .resize(512, 512, { fit: "cover", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(destination);
    } catch {
      return reply.code(422).send({ error: "Não foi possível processar a imagem" });
    }

    const avatarUrl = `/uploads/${filename}`;
    const user = await User.findByIdAndUpdate(auth.sub, { avatarUrl }, { new: false });
    if (!user) {
      await unlink(destination).catch(() => undefined);
      return reply.code(404).send({ error: "Usuário não encontrado" });
    }

    if (user.avatarUrl?.startsWith("/uploads/")) {
      const oldName = user.avatarUrl.slice("/uploads/".length);
      if (/^[0-9a-f-]+\.webp$/i.test(oldName)) {
        await unlink(join(env.UPLOAD_DIR, oldName)).catch(() => undefined);
      }
    }

    return reply.code(200).send({ avatarUrl });
  });

  app.post("/uploads/anime-cover", async (request, reply) => {
    let auth: AccessTokenPayload;
    try {
      auth = await authenticate(request);
    } catch {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    const administrator = await User.findById(auth.sub).select("role");
    if (!administrator || administrator.role !== "ZEUS") {
      return reply.code(403).send({ error: "Acesso restrito à administração" });
    }

    const upload = await readImage(request, app);
    if ("error" in upload) return reply.code(upload.error.status).send({ error: upload.error.message });
    if (!(await validateImage(upload.buffer))) {
      return reply.code(415).send({ error: "Formato inválido. Use JPEG, PNG ou WebP" });
    }

    await mkdir(env.UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    const destination = join(env.UPLOAD_DIR, filename);

    try {
      await sharp(upload.buffer, { failOn: "error", limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 2_400, height: 2_400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(destination);
    } catch {
      return reply.code(422).send({ error: "Não foi possível processar a imagem" });
    }

    return reply.code(201).send({ coverUrl: `/uploads/${filename}` });
  });

  app.post("/uploads/catalog-image", async (request, reply) => {
    let auth: AccessTokenPayload;
    try {
      auth = await authenticate(request);
    } catch {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    const administrator = await User.findById(auth.sub).select("role");
    if (!administrator || administrator.role !== "ZEUS") {
      return reply.code(403).send({ error: "Acesso restrito à administração" });
    }

    const upload = await readImage(request, app);
    if ("error" in upload) return reply.code(upload.error.status).send({ error: upload.error.message });
    if (!(await validateImage(upload.buffer))) {
      return reply.code(415).send({ error: "Formato inválido. Use JPEG, PNG ou WebP" });
    }

    await mkdir(env.UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    const destination = join(env.UPLOAD_DIR, filename);

    try {
      await sharp(upload.buffer, { failOn: "error", limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 2_400, height: 2_400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(destination);
    } catch {
      return reply.code(422).send({ error: "Não foi possível processar a imagem" });
    }

    return reply.code(201).send({ imageUrl: `/uploads/${filename}` });
  });
}

function isPayloadTooLarge(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { statusCode?: unknown }).statusCode === 413
  );
}
