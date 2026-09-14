"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ApiError } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "../auth.module.css";

const registerSchema = z
  .object({
    displayName: z.string().trim().min(1, "Informe seu nome").max(50, "Use no máximo 50 caracteres"),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Use ao menos 3 caracteres")
      .max(24, "Use no máximo 24 caracteres")
      .regex(/^[a-z0-9_]+$/, "Use letras minúsculas, números e underscore"),
    email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido")),
    password: z.string().min(8, "Use ao menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: createAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      const user = await createAccount({
        displayName: data.displayName,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      router.replace(`/user/${user.username}`);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível criar a conta");
    }
  });

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.heading}>Criar conta</h1>
        <p className={styles.description}>Comece gratuitamente. A conta VIP poderá ser ativada depois.</p>

        <form className={styles.form} onSubmit={onSubmit} autoComplete="off" noValidate>
          <div className={styles.field}>
            <label htmlFor="displayName">Nome</label>
            <input id="displayName" {...register("displayName")} />
            {errors.displayName && <p className={styles.fieldError}>{errors.displayName.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="username">Nome de usuário</label>
            <input id="username" autoCapitalize="none" {...register("username")} />
            {errors.username && <p className={styles.fieldError}>{errors.username.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" {...register("email")} />
            {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" {...register("password")} />
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className={styles.fieldError}>{errors.confirmPassword.message}</p>}
          </div>

          {formError && <p className={styles.formError}>{formError}</p>}
          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className={styles.switch}>
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
