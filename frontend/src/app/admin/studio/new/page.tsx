"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiHome, FiImage, FiUploadCloud } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";
import { CancelLink } from "@/shared/components/AdminFormActions/CancelLink";
import { SaveButton } from "@/shared/components/AdminFormActions/SaveButton";

const CREATE_STUDIO = `mutation CreateStudio($input: CreateStudioInput!) { createStudio(input: $input) { slug } }`;
const UPDATE_STUDIO = `mutation UpdateStudio($slug: String!, $input: CreateStudioInput!) { updateStudio(slug: $slug, input: $input) { slug } }`;
const ADMIN_STUDIO = `query Studio($slug: String!) { studio(slug: $slug) { displayName nameKanji imageUrl description foundation headquarters publicationStatus externalLinks { website x instagram pixiv youtube tiktok } } }`;

type StudioData = { displayName: string; nameKanji: string | null; imageUrl: string; description: string | null; foundation: string | null; headquarters: string | null; publicationStatus: "DRAFT" | "PUBLISHED"; externalLinks: Record<string, string | null> };
const externalLinks = [["website", "Site oficial"], ["x", "X/Twitter"], ["instagram", "Instagram"], ["pixiv", "Pixiv"], ["youtube", "YouTube"], ["tiktok", "TikTok"]] as const;

export function StudioFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<StudioData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadingStudio, setLoadingStudio] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ studio: StudioData | null }>(ADMIN_STUDIO, { slug: editSlug }, accessToken).then(({ studio }) => {
      if (!active) return;
      if (!studio) throw new Error("Estúdio não encontrado");
      setInitial(studio); setDisplayName(studio.displayName); setImageUrl(studio.imageUrl);
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar o estúdio"); }).finally(() => { if (active) setLoadingStudio(false); });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true); setError(""); setSavedSlug("");
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || null;
    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para o estúdio");
      const relatedLinks = Object.fromEntries(externalLinks.flatMap(([key]) => {
        const value = optional(`external.${key}`);
        return value ? [[key, value]] : [];
      }));
      const input = {
        displayName: displayName.trim(), nameKanji: optional("nameKanji"), imageUrl: uploadedImage,
        description: optional("description"), foundation: optional("foundation"), headquarters: optional("headquarters"),
        website: relatedLinks.website ?? null, externalLinks: relatedLinks, publicationStatus: String(form.get("publicationStatus")),
      };
      const data = editSlug
        ? await graphqlRequest<{ updateStudio: { slug: string } }>(UPDATE_STUDIO, { slug: editSlug, input }, accessToken)
        : await graphqlRequest<{ createStudio: { slug: string } }>(CREATE_STUDIO, { input }, accessToken);
      const slug = "updateStudio" in data ? data.updateStudio.slug : data.createStudio.slug;
      setSavedSlug(slug); setImageUrl(uploadedImage); setImageFile(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar o estúdio"); }
    finally { setSaving(false); }
  };

  if (authLoading || loadingStudio) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiHome /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar estúdios.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return <main className={styles.page}><header className={styles.header}><div><span>Administração · Estúdio</span><h1>{editSlug ? "Editar estúdio" : "Cadastrar estúdio"}</h1></div><p>Este perfil poderá ser vinculado diretamente aos lançamentos de animes.</p></header>
    <form className={styles.form} autoComplete="off" onSubmit={submit}><section className={styles.card}><div className={styles.sectionTitle}><span>01</span><div><h2>Perfil do estúdio</h2><p>Identidade, localização e informações institucionais.</p></div></div><div className={styles.grid}>
      <label><span>Nome *</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
      <label><span>Nome em Japonês</span><input name="nameKanji" defaultValue={initial?.nameKanji ?? ""} /></label>
      <label><span>Fundação</span><input name="foundation" defaultValue={initial?.foundation ?? ""} placeholder="Ex.: 1998" /></label>
      <label><span>Sede</span><input name="headquarters" defaultValue={initial?.headquarters ?? ""} placeholder="Cidade, província, país" /></label>
      <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
      <label className={styles.wide}><span>Sinopse</span><textarea name="description" rows={7} defaultValue={initial?.description ?? ""} /></label>
      <div className={`${styles.wide} ${styles.imagePicker}`}><div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia do estúdio" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div><div className={styles.imagePickerContent}><strong>Imagem do estúdio *</strong><p>Envie JPEG, PNG ou WebP.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div></div>
    </div></section><section className={styles.card}><div className={styles.sectionTitle}><span>02</span><div><h2>Links da página</h2><p>Campos vazios não serão exibidos ao público.</p></div></div><h3 className={styles.subheading}>Links relacionados</h3><div className={styles.linkGrid}>{externalLinks.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`external.${key}`} placeholder="https://…" defaultValue={initial?.externalLinks[key] ?? ""} /></label>)}</div></section>
    {error && <p className={styles.error}>{error}</p>}{savedSlug && <p className={styles.success}>Estúdio {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/studio/${savedSlug}`}>Abrir perfil</Link></p>}<div className={styles.footerActions}><CancelLink className={styles.cancelAction} href="/admin/studio">Cancelar</CancelLink><SaveButton disabled={saving}>{editSlug ? "Salvar alterações" : "Cadastrar estúdio"}</SaveButton></div></form>
  </main>;
}

export default function NewStudioPage() { return <StudioFormPage />; }
