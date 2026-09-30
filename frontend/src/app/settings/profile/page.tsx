"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiCheck, FiUpload } from "react-icons/fi";
import { MdOutlineBadge, MdOutlinePersonOutline, MdOutlineVisibility } from "react-icons/md";
import { z } from "zod";

import { ApiError, assetUrl, uploadAvatar } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "./profile.module.css";

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Informe seu nome").max(50, "Use no máximo 50 caracteres"),
  bio: z.string().trim().max(300, "Use no máximo 300 caracteres"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Use ao menos 3 caracteres")
    .max(24, "Use no máximo 24 caracteres")
    .regex(/^[a-z0-9_]+$/, "Use letras minúsculas, números e underscore"),
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido")),
  showAdultContent: z.boolean(),
  hideAdultContentFromVisitors: z.boolean(),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, accessToken, loading, updateProfile, refreshUser } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInputVersion, setFileInputVersion] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { showAdultContent: false, hideAdultContentFromVisitors: false },
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    reset({
      displayName: user.displayName,
      bio: user.bio ?? "",
      username: user.username,
      email: user.email,
      showAdultContent: user.showAdultContent,
      hideAdultContentFromVisitors: user.hideAdultContentFromVisitors,
    });
  }, [loading, reset, router, user]);

  const chooseImage = (file: File | undefined) => {
    setFormError(null);
    setSuccess(false);
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Use uma imagem JPEG, PNG ou WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("A imagem pode ter no máximo 5 MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.addEventListener("load", () => setPreviewUrl(typeof reader.result === "string" ? reader.result : null), { once: true });
    reader.readAsDataURL(file);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!accessToken) return;
    setFormError(null);
    setSuccess(false);

    try {
      const updatedUser = await updateProfile(data);
      if (imageFile) {
        await uploadAvatar(imageFile, accessToken);
        await refreshUser();
        setImageFile(null);
        setPreviewUrl(null);
        setFileInputVersion((version) => version + 1);
      }
      setSuccess(true);
      if (updatedUser.username !== user?.username) router.refresh();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível salvar o perfil");
    }
  });

  if (loading || !user) {
    return <main className={styles.page}><div className={styles.loading} aria-label="Carregando perfil" /></main>;
  }

  const currentAvatar = previewUrl ?? assetUrl(user.avatarUrl);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.heading}>
          <span className={styles.headingIcon}><MdOutlinePersonOutline aria-hidden="true" /></span>
          <div>
            <h1>Editar perfil</h1>
            <p>Atualize sua imagem e as informações exibidas na sua conta.</p>
          </div>
        </header>

        <form className={styles.form} autoComplete="off" onSubmit={onSubmit} noValidate>
          <section className={styles.avatarCard} aria-labelledby="profile-image-title">
            <div
              className={styles.avatar}
              style={currentAvatar ? { backgroundImage: `url("${currentAvatar}")` } : undefined}
              role="img"
              aria-label={`Imagem de perfil de ${user.displayName}`}
            >
              {!currentAvatar && user.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className={styles.avatarCopy}>
              <h2 id="profile-image-title">Imagem de perfil</h2>
              <p>JPEG, PNG ou WebP. Tamanho máximo de 5 MB.</p>
            </div>
            <input
              key={fileInputVersion}
              className={styles.fileInput}
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => chooseImage(event.target.files?.[0])}
            />
            <div className={styles.avatarActions}>
              <label className={styles.uploadButton} htmlFor="avatar">
                <FiUpload aria-hidden="true" />
                {user.avatarUrl ? "Trocar imagem" : "Adicionar imagem"}
              </label>
              {imageFile && (
                <button className={styles.cancelImage} type="button" onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                  setFileInputVersion((version) => version + 1);
                }}>
                  Cancelar alteração
                </button>
              )}
            </div>
          </section>

          <section className={styles.infoCard} aria-labelledby="profile-info-title">
            <div className={styles.sectionHeading}>
              <MdOutlineBadge aria-hidden="true" />
              <div><h2 id="profile-info-title">Informações do perfil</h2><p>Esses dados identificam sua conta no site.</p></div>
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="displayName">Nome de exibição</label>
                <input id="displayName" {...register("displayName")} />
                {errors.displayName && <p className={styles.fieldError}>{errors.displayName.message}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="username">Nome de usuário</label>
                <div className={styles.usernameInput}><span>@</span><input id="username" autoCapitalize="none" {...register("username")} /></div>
                {errors.username && <p className={styles.fieldError}>{errors.username.message}</p>}
              </div>
              <div className={`${styles.field} ${styles.fullField}`}>
                <label htmlFor="bio">Biografia</label>
                <textarea id="bio" rows={4} placeholder="Conte um pouco sobre você" {...register("bio")} />
                {errors.bio && <p className={styles.fieldError}>{errors.bio.message}</p>}
              </div>
              <div className={`${styles.field} ${styles.fullField}`}>
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" autoCapitalize="none" {...register("email")} />
                {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
              </div>
            </div>
          </section>

          <section className={styles.infoCard} aria-labelledby="content-preferences-title">
            <div className={styles.sectionHeading}>
              <MdOutlineVisibility aria-hidden="true" />
              <div>
                <h2 id="content-preferences-title">Preferências de conteúdo</h2>
                <p>Controle se obras marcadas como conteúdo adulto podem aparecer no site.</p>
              </div>
            </div>
            <label className={styles.adultPreference}>
              <span>
                <strong>Exibir conteúdo +18</strong>
                <small>Desativado por padrão. Você pode alterar esta preferência quando quiser.</small>
              </span>
              <input type="checkbox" {...register("showAdultContent")} />
            </label>
            <label className={styles.adultPreference}>
              <span>
                <strong>Ocultar conteúdo +18 dos visitantes</strong>
                <small>Você continuará vendo essas obras nas suas listas, mas elas não aparecerão para quem visitar seu perfil.</small>
              </span>
              <input type="checkbox" {...register("hideAdultContentFromVisitors")} />
            </label>
          </section>

          {formError && <p className={styles.formError}>{formError}</p>}
          {success && <p className={styles.success}><FiCheck aria-hidden="true" /> Perfil atualizado com sucesso.</p>}

          <div className={styles.footerActions}>
            <Link className={styles.backButton} href={`/user/${user.username}`}>Voltar ao perfil</Link>
            <button className={styles.saveButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
