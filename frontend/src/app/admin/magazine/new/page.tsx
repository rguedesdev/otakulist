"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiArrowLeft, FiBookOpen, FiImage, FiUploadCloud, FiX } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";

type PublisherOption = { id: string; displayName: string; slug: string; imageUrl: string };
type MagazineData = { title: string; description: string; imageUrl: string; foundation: string | null; demography: string | null; frequency: string | null; publicationStatus: "DRAFT" | "PUBLISHED"; publisher: PublisherOption };
const CREATE_MAGAZINE = `mutation CreateMagazine($input: CreateMagazineInput!) { createMagazine(input: $input) { slug } }`;
const UPDATE_MAGAZINE = `mutation UpdateMagazine($slug: String!, $input: CreateMagazineInput!) { updateMagazine(slug: $slug, input: $input) { slug } }`;
const ADMIN_MAGAZINE = `query Magazine($slug: String!) { magazine(slug: $slug) { title description imageUrl foundation demography frequency publicationStatus publisher { id displayName slug imageUrl } } }`;
const SEARCH_PUBLISHERS = `query SearchPublishers($query: String!) { searchPublishers(query: $query) { id displayName slug imageUrl } }`;

function PublisherPicker({ value, accessToken, onChange }: { value: PublisherOption | null; accessToken: string; onChange(value: PublisherOption | null): void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PublisherOption[]>([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (value || search.trim().length < 2) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ searchPublishers: PublisherOption[] }>(SEARCH_PUBLISHERS, { query: search.trim() }, accessToken)
        .then((data) => { if (active) setResults(data.searchPublishers); })
        .catch(() => { if (active) setResults([]); })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search, value]);
  if (value) return <div className={styles.selectedStudioInput}><Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={28} height={28} unoptimized /><strong>{value.displayName}</strong><button type="button" aria-label="Remover editora" onClick={() => { onChange(null); setSearch(""); }}><FiX /></button></div>;
  return <div className={styles.studioPicker}><input value={search} placeholder="Buscar editora cadastrada" onChange={(event) => setSearch(event.target.value)} />{searching && <small className={styles.searchHint}>Buscando editoras…</small>}{!searching && search.trim().length >= 2 && results.length === 0 && <small className={styles.searchHint}>Nenhuma editora encontrada. Cadastre-a primeiro em Editoras.</small>}{results.length > 0 && <div className={styles.studioResults}>{results.map((publisher) => <button type="button" key={publisher.id} onClick={() => onChange(publisher)}><Image src={assetUrl(publisher.imageUrl) ?? publisher.imageUrl} alt="" width={32} height={32} unoptimized /><strong>{publisher.displayName}</strong></button>)}</div>}</div>;
}

export function MagazineFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<MagazineData | null>(null);
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState<PublisherOption | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadingMagazine, setLoadingMagazine] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ magazine: MagazineData | null }>(ADMIN_MAGAZINE, { slug: editSlug }, accessToken).then(({ magazine }) => {
      if (!active) return;
      if (!magazine) throw new Error("Magazine não encontrada");
      setInitial(magazine); setTitle(magazine.title); setImageUrl(magazine.imageUrl); setPublisher(magazine.publisher);
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar a magazine"); }).finally(() => { if (active) setLoadingMagazine(false); });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    if (!publisher) return setError("Selecione a editora da magazine");
    setSaving(true); setError(""); setSavedSlug("");
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || null;
    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para a magazine");
      const input = { title: title.trim(), description: String(form.get("description") ?? "").trim(), imageUrl: uploadedImage, foundation: optional("foundation"), publisherId: publisher.id, demography: optional("demography"), frequency: optional("frequency"), publicationStatus: String(form.get("publicationStatus")) };
      const data = editSlug ? await graphqlRequest<{ updateMagazine: { slug: string } }>(UPDATE_MAGAZINE, { slug: editSlug, input }, accessToken) : await graphqlRequest<{ createMagazine: { slug: string } }>(CREATE_MAGAZINE, { input }, accessToken);
      const slug = "updateMagazine" in data ? data.updateMagazine.slug : data.createMagazine.slug;
      setSavedSlug(slug); setImageUrl(uploadedImage); setImageFile(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar a magazine"); }
    finally { setSaving(false); }
  };

  if (authLoading || loadingMagazine) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS" || !accessToken) return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiBookOpen /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar magazines.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return <main className={styles.page}><header className={styles.header}><div><span>Administração · Magazine</span><h1>{editSlug ? "Editar magazine" : "Cadastrar magazine"}</h1></div><p>O vínculo com a editora é definido nesta magazine.</p></header><form className={styles.form} onSubmit={submit}><section className={styles.card}><div className={styles.sectionTitle}><span>01</span><div><h2>Dados da magazine</h2><p>Identidade, publicação e vínculo editorial.</p></div></div><div className={styles.grid}>
    <label><span>Título *</span><input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <label><span>Editora *</span><PublisherPicker value={publisher} accessToken={accessToken} onChange={setPublisher} /></label>
    <label><span>Ano de criação</span><input name="foundation" defaultValue={initial?.foundation ?? ""} placeholder="Ex.: 1968" /></label><label><span>Demografia</span><input name="demography" defaultValue={initial?.demography ?? ""} /></label><label><span>Periodicidade</span><input name="frequency" defaultValue={initial?.frequency ?? ""} /></label><label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
    <label className={styles.wide}><span>Descrição *</span><textarea required name="description" rows={7} defaultValue={initial?.description ?? ""} /></label>
    <div className={`${styles.wide} ${styles.imagePicker}`}><div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia da magazine" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div><div className={styles.imagePickerContent}><strong>Imagem da magazine *</strong><p>Envie JPEG, PNG ou WebP.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div></div>
  </div></section>{error && <p className={styles.error}>{error}</p>}{savedSlug && <p className={styles.success}>Magazine salva. <Link href={`/magazine/${savedSlug}`}>Abrir página</Link></p>}<div className={styles.footerActions}><Link className={styles.cancelAction} href="/admin/magazine"><FiArrowLeft /> Cancelar</Link><button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar magazine"}</button></div></form></main>;
}

export default function NewMagazinePage() { return <MagazineFormPage />; }
