"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiImage, FiMic, FiUploadCloud } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";
import { CancelLink } from "@/shared/components/AdminFormActions/CancelLink";
import { SaveButton } from "@/shared/components/AdminFormActions/SaveButton";

const CREATE_SEIYUU = `mutation CreateSeiyuu($input: CreateSeiyuuInput!) { createSeiyuu(input: $input) { slug } }`;
const UPDATE_SEIYUU = `mutation UpdateSeiyuu($slug: String!, $input: CreateSeiyuuInput!) { updateSeiyuu(slug: $slug, input: $input) { slug } }`;
const ADMIN_SEIYUU = `query AdminSeiyuu($slug: String!) {
  seiyuu(slug: $slug) { displayName nameKanji imageUrl description dateOfBirth hometown agency publicationStatus externalLinks { website x instagram pixiv youtube } }
}`;
const externalLinks = [["website", "Site oficial"], ["x", "X/Twitter"], ["instagram", "Instagram"], ["pixiv", "Pixiv"], ["youtube", "YouTube"]] as const;

type SeiyuuData = {
  displayName: string;
  nameKanji: string | null;
  imageUrl: string;
  description: string | null;
  dateOfBirth: string | null;
  hometown: string | null;
  agency: string | null;
  externalLinks: Record<string, string | null>;
  publicationStatus: "DRAFT" | "PUBLISHED";
};

export function SeiyuuFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<SeiyuuData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadingSeiyuu, setLoadingSeiyuu] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");

  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ seiyuu: SeiyuuData | null }>(ADMIN_SEIYUU, { slug: editSlug }, accessToken)
      .then((data) => {
        if (!active) return;
        if (!data.seiyuu) throw new Error("Seiyuu não encontrado");
        setInitial(data.seiyuu);
        setDisplayName(data.seiyuu.displayName);
        setImageUrl(data.seiyuu.imageUrl);
      })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar o seiyuu"); })
      .finally(() => { if (active) setLoadingSeiyuu(false); });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError("");
    setSavedSlug("");
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || null;
    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para o seiyuu");
      const input = {
        displayName: displayName.trim(),
        nameKanji: optional("nameKanji"),
        imageUrl: uploadedImage,
        description: optional("description"),
        dateOfBirth: optional("dateOfBirth"),
        hometown: optional("hometown"),
        agency: optional("agency"),
        externalLinks: Object.fromEntries(externalLinks.flatMap(([key]) => {
          const value = optional(`external.${key}`);
          return value ? [[key, value]] : [];
        })),
        publicationStatus: String(form.get("publicationStatus")),
      };
      if (editSlug) {
        const data = await graphqlRequest<{ updateSeiyuu: { slug: string } }>(UPDATE_SEIYUU, { slug: editSlug, input }, accessToken);
        setSavedSlug(data.updateSeiyuu.slug);
      } else {
        const data = await graphqlRequest<{ createSeiyuu: { slug: string } }>(CREATE_SEIYUU, { input }, accessToken);
        setSavedSlug(data.createSeiyuu.slug);
      }
      setImageUrl(uploadedImage);
      setImageFile(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar o seiyuu");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingSeiyuu) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiMic /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar seiyuus.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}><div><span>Administração · Seiyuu</span><h1>{editSlug ? "Editar seiyuu" : "Cadastrar seiyuu"}</h1></div><p>Gerencie os dados exibidos no perfil público.</p></header>
      <form className={styles.form} autoComplete="off" onSubmit={submit}>
        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>01</span><div><h2>Perfil</h2><p>Identidade e informações profissionais.</p></div></div>
          <div className={styles.grid}>
            <label><span>Nome em Romaji *</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
            <label><span>Nome em Kanji</span><input name="nameKanji" defaultValue={initial?.nameKanji ?? ""} /></label>
            <label><span>Data de nascimento</span><input name="dateOfBirth" defaultValue={initial?.dateOfBirth ?? ""} /></label>
            <label><span>Cidade natal</span><input name="hometown" defaultValue={initial?.hometown ?? ""} /></label>
            <label><span>Agência</span><input name="agency" defaultValue={initial?.agency ?? ""} /></label>
            <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
            <label className={styles.wide}><span>Sinopse</span><textarea name="description" rows={7} defaultValue={initial?.description ?? ""} /></label>
            <div className={`${styles.wide} ${styles.imagePicker}`}>
              <div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia do seiyuu" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div>
              <div className={styles.imagePickerContent}><strong>Imagem de perfil *</strong><p>Envie JPEG, PNG ou WebP, ou mantenha a imagem cadastrada.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div>
            </div>
          </div>
        </section>
        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>02</span><div><h2>Links da página</h2><p>Campos vazios não serão exibidos ao público.</p></div></div>
          <h3 className={styles.subheading}>Links relacionados</h3>
          <div className={styles.linkGrid}>{externalLinks.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`external.${key}`} placeholder="https://…" defaultValue={initial?.externalLinks[key] ?? ""} /></label>)}</div>
        </section>
        {error && <p className={styles.error}>{error}</p>}
        {savedSlug && <p className={styles.success}>Seiyuu {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/seiyuu/${savedSlug}`}>Abrir perfil</Link></p>}
        <div className={styles.footerActions}><CancelLink className={styles.cancelAction} href="/admin/seiyuu">Cancelar</CancelLink><SaveButton disabled={saving}>{editSlug ? "Salvar alterações" : "Cadastrar seiyuu"}</SaveButton></div>
      </form>
    </main>
  );
}

export default function NewSeiyuuPage() {
  return <SeiyuuFormPage />;
}
