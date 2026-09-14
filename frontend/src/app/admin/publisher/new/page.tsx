"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiArrowLeft, FiBookOpen, FiImage, FiUploadCloud } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";

const CREATE_PUBLISHER = `mutation CreatePublisher($input: CreatePublisherInput!) { createPublisher(input: $input) { slug } }`;
const UPDATE_PUBLISHER = `mutation UpdatePublisher($slug: String!, $input: CreatePublisherInput!) { updatePublisher(slug: $slug, input: $input) { slug } }`;
const ADMIN_PUBLISHER = `query Publisher($slug: String!) { publisher(slug: $slug) { displayName imageUrl description foundation headquarters publicationStatus } }`;
type PublisherData = { displayName: string; imageUrl: string; description: string | null; foundation: string | null; headquarters: string | null; publicationStatus: "DRAFT" | "PUBLISHED" };

export function PublisherFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<PublisherData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadingPublisher, setLoadingPublisher] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ publisher: PublisherData | null }>(ADMIN_PUBLISHER, { slug: editSlug }, accessToken).then(({ publisher }) => {
      if (!active) return;
      if (!publisher) throw new Error("Editora não encontrada");
      setInitial(publisher); setDisplayName(publisher.displayName); setImageUrl(publisher.imageUrl);
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar a editora"); }).finally(() => { if (active) setLoadingPublisher(false); });
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
      if (!uploadedImage) throw new Error("Selecione uma imagem para a editora");
      const input = { displayName: displayName.trim(), imageUrl: uploadedImage, description: optional("description"), foundation: optional("foundation"), headquarters: optional("headquarters"), publicationStatus: String(form.get("publicationStatus")) };
      const data = editSlug
        ? await graphqlRequest<{ updatePublisher: { slug: string } }>(UPDATE_PUBLISHER, { slug: editSlug, input }, accessToken)
        : await graphqlRequest<{ createPublisher: { slug: string } }>(CREATE_PUBLISHER, { input }, accessToken);
      const slug = "updatePublisher" in data ? data.updatePublisher.slug : data.createPublisher.slug;
      setSavedSlug(slug); setImageUrl(uploadedImage); setImageFile(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar a editora"); }
    finally { setSaving(false); }
  };

  if (authLoading || loadingPublisher) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiBookOpen /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar editoras.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return <main className={styles.page}><header className={styles.header}><div><span>Administração · Editora</span><h1>{editSlug ? "Editar editora" : "Cadastrar editora"}</h1></div><p>Este perfil poderá ser vinculado diretamente a mangas e light novels.</p></header>
    <form className={styles.form} onSubmit={submit}><section className={styles.card}><div className={styles.sectionTitle}><span>01</span><div><h2>Perfil da editora</h2><p>Identidade e informações institucionais.</p></div></div><div className={styles.grid}>
      <label><span>Nome *</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
      <label><span>Fundação</span><input name="foundation" defaultValue={initial?.foundation ?? ""} placeholder="Ex.: 1925" /></label>
      <label><span>Sede</span><input name="headquarters" defaultValue={initial?.headquarters ?? ""} placeholder="Cidade, província, país" /></label>
      <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
      <label className={styles.wide}><span>Descrição</span><textarea name="description" rows={7} defaultValue={initial?.description ?? ""} /></label>
      <div className={`${styles.wide} ${styles.imagePicker}`}><div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia da editora" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div><div className={styles.imagePickerContent}><strong>Imagem da editora *</strong><p>Envie JPEG, PNG ou WebP.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div></div>
    </div></section>
    {error && <p className={styles.error}>{error}</p>}{savedSlug && <p className={styles.success}>Editora {editSlug ? "atualizada" : "cadastrada"}. <Link href={`/publisher/${savedSlug}`}>Abrir perfil</Link></p>}<div className={styles.footerActions}><Link className={styles.cancelAction} href="/admin/publisher"><FiArrowLeft /> Cancelar</Link><button type="submit" disabled={saving}>{saving ? "Salvando…" : editSlug ? "Salvar alterações" : "Cadastrar editora"}</button></div></form>
  </main>;
}

export default function NewPublisherPage() { return <PublisherFormPage />; }
