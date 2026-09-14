"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiArrowLeft, FiImage, FiUploadCloud, FiUsers } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../anime/new/page.module.css";

type Kind = "staff" | "mangaka";
type PersonData = { displayName: string; nameKanji: string | null; imageUrl: string; description: string | null; dateOfBirth: string | null; hometown: string | null; activityPeriod: string | null; occupations: string[]; publicationStatus: "DRAFT" | "PUBLISHED" };
const settings = {
  staff: { label: "profissional", title: "Staff", query: "staff", create: "createStaff", update: "updateStaff" },
  mangaka: { label: "mangaka", title: "Mangaka", query: "mangaka", create: "createMangaka", update: "updateMangaka" },
} as const;

export function IndustryPersonFormPage({ kind, editSlug }: { kind: Kind; editSlug?: string }) {
  const config = settings[kind];
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<PersonData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);

  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    const query = `query IndustryPerson($slug: String!) { ${config.query}(slug: $slug) { displayName nameKanji imageUrl description dateOfBirth hometown activityPeriod occupations publicationStatus } }`;
    void graphqlRequest<Record<string, PersonData | null>>(query, { slug: editSlug }, accessToken).then((data) => {
      const person = data[config.query];
      if (!person) throw new Error("Perfil não encontrado");
      if (active) { setInitial(person); setDisplayName(person.displayName); setImageUrl(person.imageUrl); }
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar o perfil"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken, config.query, editSlug, user?.role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!accessToken) return;
    setSaving(true); setError(""); setSavedSlug("");
    const form = new FormData(event.currentTarget);
    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para o perfil");
      const input = {
        displayName: displayName.trim(), nameKanji: String(form.get("nameKanji") ?? "").trim() || null,
        imageUrl: uploadedImage, description: String(form.get("description") ?? "").trim() || null,
        dateOfBirth: String(form.get("dateOfBirth") ?? "").trim() || null, hometown: String(form.get("hometown") ?? "").trim() || null,
        activityPeriod: String(form.get("activityPeriod") ?? "").trim() || null,
        occupations: String(form.get("occupations") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
        publicationStatus: String(form.get("publicationStatus")),
      };
      const mutationField = editSlug ? config.update : config.create;
      const mutation = editSlug
        ? `mutation Save($slug: String!, $input: CreateIndustryPersonInput!) { ${mutationField}(slug: $slug, input: $input) { slug } }`
        : `mutation Save($input: CreateIndustryPersonInput!) { ${mutationField}(input: $input) { slug } }`;
      const data = await graphqlRequest<Record<string, { slug: string }>>(mutation, { ...(editSlug ? { slug: editSlug } : {}), input }, accessToken);
      setSavedSlug(data[mutationField].slug); setImageUrl(uploadedImage); setImageFile(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar o perfil"); } finally { setSaving(false); }
  };

  if (authLoading || loading) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiUsers /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar perfis.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return <main className={styles.page}><header className={styles.header}><div><span>Administração · {config.title}</span><h1>{editSlug ? `Editar ${config.label}` : `Cadastrar ${config.label}`}</h1></div><p>Gerencie os dados exibidos no perfil público.</p></header>
    <form className={styles.form} onSubmit={submit}><section className={styles.card}><div className={styles.sectionTitle}><span>01</span><div><h2>Perfil profissional</h2><p>Identidade, biografia e área de atuação.</p></div></div><div className={styles.grid}>
      <label><span>Nome em Romaji *</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
      <label><span>Nome em Kanji</span><input name="nameKanji" defaultValue={initial?.nameKanji ?? ""} /></label>
      <label><span>Data de nascimento</span><input name="dateOfBirth" defaultValue={initial?.dateOfBirth ?? ""} /></label>
      <label><span>Cidade natal</span><input name="hometown" defaultValue={initial?.hometown ?? ""} /></label>
      <label><span>Período de atividade</span><input name="activityPeriod" defaultValue={initial?.activityPeriod ?? ""} /></label>
      <label><span>Atuações</span><input name="occupations" defaultValue={initial?.occupations.join(", ") ?? ""} placeholder="Diretor, Animador" /></label>
      <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
      <label className={styles.wide}><span>Sinopse</span><textarea name="description" rows={7} defaultValue={initial?.description ?? ""} /></label>
      <div className={`${styles.wide} ${styles.imagePicker}`}><div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia do perfil" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div><div className={styles.imagePickerContent}><strong>Imagem de perfil *</strong><p>Envie JPEG, PNG ou WebP, ou mantenha a imagem cadastrada.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div></div>
    </div></section>{error && <p className={styles.error}>{error}</p>}{savedSlug && <p className={styles.success}>Perfil {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/${kind}/${savedSlug}`}>Abrir perfil</Link></p>}<div className={styles.footerActions}><Link className={styles.cancelAction} href={`/admin/${kind}`}><FiArrowLeft /> Cancelar</Link><button disabled={saving}>{saving ? "Salvando…" : editSlug ? "Salvar alterações" : "Cadastrar perfil"}</button></div></form>
  </main>;
}
