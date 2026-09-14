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

const loginSchema = z.object({
  email: z.string().trim().pipe(z.email("Informe um e-mail válido")),
  password: z.string().min(1, "Informe sua senha"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      const user = await login(data);
      router.replace(`/user/${user.username}`);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível entrar");
    }
  });

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.heading}>Entrar</h1>
        <p className={styles.description}>Continue acompanhando suas obras e listas.</p>

        <form className={styles.form} onSubmit={onSubmit} autoComplete="off" noValidate>
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

          {formError && <p className={styles.formError}>{formError}</p>}
          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className={styles.switch}>
          Ainda não tem uma conta? <Link href="/register">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}
