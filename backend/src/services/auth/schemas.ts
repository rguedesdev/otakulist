import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres")
  .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
    message: "A senha pode ter no máximo 72 bytes",
  });

export const registerSchema = z.object({
  input: z.object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "O nome de usuário deve ter ao menos 3 caracteres")
      .max(24, "O nome de usuário pode ter no máximo 24 caracteres")
      .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e underscore"),
    displayName: z
      .string()
      .trim()
      .min(1, "Informe o nome de exibição")
      .max(50, "O nome de exibição pode ter no máximo 50 caracteres"),
    email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido")),
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  input: z.object({
    email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido")),
    password: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  input: z.object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "O nome de usuário deve ter ao menos 3 caracteres")
      .max(24, "O nome de usuário pode ter no máximo 24 caracteres")
      .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e underscore"),
    displayName: z
      .string()
      .trim()
      .min(1, "Informe o nome de exibição")
      .max(50, "O nome de exibição pode ter no máximo 50 caracteres"),
    bio: z
      .string()
      .trim()
      .max(300, "A biografia pode ter no máximo 300 caracteres")
      .optional()
      .transform((value) => value || null),
    email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido")),
  }),
});

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/),
});
