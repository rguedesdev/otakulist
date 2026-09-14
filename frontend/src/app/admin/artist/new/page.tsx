"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiArrowLeft, FiImage, FiMusic, FiUploadCloud } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";

const CREATE_ARTIST = `mutation CreateMusicArtist($input: CreateMusicArtistInput!) { createMusicArtist(input: $input) { slug } }`;
const UPDATE_ARTIST = `mutation UpdateMusicArtist($slug: String!, $input: CreateMusicArtistInput!) { updateMusicArtist(slug: $slug, input: $input) { slug } }`;
const ADMIN_ARTIST = `query MusicArtist($slug: String!) { musicArtist(slug: $slug) { displayName kind nameKanji imageUrl description origin dateOfBirth activityPeriod recordLabel genres platformLinks { spotify tidal deezer amazonMusic } publicationStatus } }`;
type ArtistData = { displayName: string; kind: "SOLO" | "BAND"; nameKanji: string | null; imageUrl: string; description: string | null; origin: string | null; dateOfBirth: string | null; activityPeriod: string | null; recordLabel: string | null; genres: string[]; platformLinks: Record<string, string | null>; publicationStatus: "DRAFT" | "PUBLISHED" };
const platforms = [["spotify", "Spotify"], ["tidal", "Tidal"], ["deezer", "Deezer"], ["amazonMusic", "Amazon Music"]] as const;

export function ArtistFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<ArtistData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadingArtist, setLoadingArtist] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ musicArtist: ArtistData | null }>(ADMIN_ARTIST, { slug: editSlug }, accessToken).then(({ musicArtist }) => {
      if (!active) return;
      if (!musicArtist) throw new Error("Artista não encontrado");
      setInitial(musicArtist); setDisplayName(musicArtist.displayName); setImageUrl(musicArtist.imageUrl);
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar o artista"); }).finally(() => { if (active) setLoadingArtist(false); });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!accessToken) return; setSaving(true); setError(""); setSavedSlug("");
    const form = new FormData(event.currentTarget);
    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para o artista");
      const optional = (name: string) => String(form.get(name) ?? "").trim() || null;
      const platformLinks = Object.fromEntries(platforms.map(([key]) => [key, optional(`platform.${key}`)]).filter(([, value]) => value));
      const input = { displayName: displayName.trim(), kind: String(form.get("kind")), nameKanji: optional("nameKanji"), imageUrl: uploadedImage, description: optional("description"), origin: optional("origin"), dateOfBirth: optional("dateOfBirth"), activityPeriod: optional("activityPeriod"), recordLabel: optional("recordLabel"), genres: String(form.get("genres") ?? "").split(",").map((item) => item.trim()).filter(Boolean), platformLinks, publicationStatus: String(form.get("publicationStatus")) };
      if (editSlug) { const data = await graphqlRequest<{ updateMusicArtist: { slug: string } }>(UPDATE_ARTIST, { slug: editSlug, input }, accessToken); setSavedSlug(data.updateMusicArtist.slug); }
      else { const data = await graphqlRequest<{ createMusicArtist: { slug: string } }>(CREATE_ARTIST, { input }, accessToken); setSavedSlug(data.createMusicArtist.slug); }
      setImageUrl(uploadedImage); setImageFile(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar o artista"); }
    finally { setSaving(false); }
  };

  if (authLoading || loadingArtist) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiMusic /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar artistas.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return <main className={styles.page}><header className={styles.header}><div><span>Administração · Artista musical</span><h1>{editSlug ? "Editar artista" : "Cadastrar artista ou banda"}</h1></div><p>Este perfil poderá ser vinculado às canções dos animes.</p></header>
    <form className={styles.form} onSubmit={submit}><section className={styles.card}><div className={styles.sectionTitle}><span>01</span><div><h2>Perfil musical</h2><p>Identidade e informações profissionais.</p></div></div><div className={styles.grid}>
      <label><span>Nome artístico *</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
      <label><span>Tipo *</span><CustomSelect name="kind" defaultValue={initial?.kind ?? "SOLO"} options={[{ value: "SOLO", label: "Artista solo" }, { value: "BAND", label: "Banda ou grupo" }]} /></label>
      <label><span>Nome em Kanji</span><input name="nameKanji" defaultValue={initial?.nameKanji ?? ""} /></label><label><span>Origem</span><input name="origin" defaultValue={initial?.origin ?? ""} /></label>
      <label><span>Data de nascimento</span><input name="dateOfBirth" defaultValue={initial?.dateOfBirth ?? ""} /></label><label><span>Período de atividade</span><input name="activityPeriod" defaultValue={initial?.activityPeriod ?? ""} /></label>
      <label><span>Gravadora</span><input name="recordLabel" defaultValue={initial?.recordLabel ?? ""} /></label><label><span>Gêneros musicais</span><input name="genres" defaultValue={initial?.genres.join(", ") ?? ""} placeholder="J-Pop, Anisong" /></label>
      <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
      <label className={styles.wide}><span>Sinopse</span><textarea name="description" rows={7} defaultValue={initial?.description ?? ""} /></label>
      <div className={`${styles.wide} ${styles.imagePicker}`}><div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia do artista" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div><div className={styles.imagePickerContent}><strong>Imagem de perfil *</strong><p>Envie JPEG, PNG ou WebP.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div></div>
    </div></section>
    <section className={styles.card}><div className={styles.sectionTitle}><span>02</span><div><h2>Plataformas</h2><p>Campos vazios não aparecem no perfil.</p></div></div><div className={styles.linkGrid}>{platforms.map(([key, label]) => <label key={key}><span>{label}</span><input name={`platform.${key}`} defaultValue={initial?.platformLinks[key] ?? ""} placeholder="https://…" /></label>)}</div></section>
    {error && <p className={styles.error}>{error}</p>}{savedSlug && <p className={styles.success}>Artista {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/artist/${savedSlug}`}>Abrir perfil</Link></p>}<div className={styles.footerActions}><Link className={styles.cancelAction} href="/admin/artist"><FiArrowLeft /> Cancelar</Link><button type="submit" disabled={saving}>{saving ? "Salvando…" : editSlug ? "Salvar alterações" : "Cadastrar artista"}</button></div></form>
  </main>;
}

export default function NewArtistPage() { return <ArtistFormPage />; }
