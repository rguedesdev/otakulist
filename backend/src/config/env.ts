import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const developmentSecret = "otakulist-development-only-jwt-secret";
const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../");

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
    MONGODB_URI: z
      .string()
      .min(1)
      .default("mongodb://otakulist:otakulist-local@127.0.0.1:27017/otakulist?authSource=admin"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET precisa ter ao menos 32 caracteres").default(developmentSecret),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(15 * 60),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(30 * 24 * 60 * 60),
    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    UPLOAD_DIR: z.string().default(resolve(backendRoot, "src/uploads")),
    MAX_AVATAR_SIZE_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .max(10 * 1024 * 1024)
      .default(5 * 1024 * 1024),
  })
  .superRefine((data, context) => {
    if (data.NODE_ENV === "production" && data.JWT_SECRET === developmentSecret) {
      context.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message: "JWT_SECRET deve ser configurado explicitamente em produção",
      });
    }
  });

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const message = z.prettifyError(parsed.error);
  throw new Error(`Configuração de ambiente inválida:\n${message}`);
}

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  UPLOAD_DIR: resolve(process.cwd(), parsed.data.UPLOAD_DIR),
};
