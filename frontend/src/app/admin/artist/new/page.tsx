"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiImage, FiMusic, FiUploadCloud } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";
import { CancelLink } from "@/shared/components/AdminFormActions/CancelLink";
import { SaveButton } from "@/shared/components/AdminFormActions/SaveButton";
import { reorderItems, SortableItem } from "@/shared/components/SortableItem/SortableItem";

const CREATE_ARTIST = `mutation CreateMusicArtist($input: CreateMusicArtistInput!) { createMusicArtist(input: $input) { slug } }`;
const UPDATE_ARTIST = `mutation UpdateMusicArtist($slug: String!, $input: CreateMusicArtistInput!) { updateMusicArtist(slug: $slug, input: $input) { slug } }`;
const ADMIN_ARTIST = `query MusicArtist($slug: String!) { musicArtist(slug: $slug) { displayName kind nameKanji imageUrl description origin dateOfBirth activityPeriod recordLabel genres discography { title releaseType year tracks cover } platformLinks { spotify tidal deezer amazonMusic } externalLinks { website x instagram pixiv youtube tiktok } publicationStatus } }`;
type DiscographyRelease = { title: string; releaseType: string; year: string; tracks: number; cover: string };
type DiscographyEditorRelease = DiscographyRelease & { coverFile: File | null };
type ArtistData = { displayName: string; kind: "SOLO" | "BAND"; nameKanji: string | null; imageUrl: string; description: string | null; origin: string | null; dateOfBirth: string | null; activityPeriod: string | null; recordLabel: string | null; genres: string[]; discography: DiscographyRelease[]; platformLinks: Record<string, string | null>; externalLinks: Record<string, string | null>; publicationStatus: "DRAFT" | "PUBLISHED" };
const platforms = [["spotify", "Spotify"], ["tidal", "Tidal"], ["deezer", "Deezer"], ["amazonMusic", "Amazon Music"]] as const;
const socialLinks = [["website", "Site oficial"], ["x", "X / Twitter"], ["instagram", "Instagram"], ["pixiv", "Pixiv"], ["youtube", "YouTube"], ["tiktok", "TikTok"]] as const;
const releaseTypes = ["Álbum", "Single", "EP", "Mini álbum", "Coletânea", "Trilha sonora"].map((value) => ({ value, label: value }));
const emptyRelease = (): DiscographyEditorRelease => ({ title: "", releaseType: "Álbum", year: "", tracks: 0, cover: "", coverFile: null });

function ReleaseCoverPicker({ release, onChange }: { release: DiscographyEditorRelease; onChange(file: File | null): void }) {
  const preview = useMemo(() => release.coverFile ? URL.createObjectURL(release.coverFile) : assetUrl(release.cover), [release.cover, release.coverFile]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  return <div className={styles.imagePicker}>
    <div className={styles.coverPreview}>{preview ? <Image src={preview} alt={`Prévia da capa de ${release.title || "lançamento"}`} fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma capa</small></span>}</div>
    <div className={styles.imagePickerContent}>
      <strong>Capa do lançamento *</strong>
      <p>Envie JPEG, PNG ou WebP. A capa atual será mantida enquanto nenhuma nova imagem for selecionada.</p>
      <label className={styles.fileButton}><FiUploadCloud />Selecionar capa<input required={!release.cover} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label>
      {release.coverFile && <small className={styles.fileName}>{release.coverFile.name}</small>}
    </div>
  </div>;
}

export function ArtistFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<ArtistData | null>(null);
  const [artistKind, setArtistKind] = useState<ArtistData["kind"]>("SOLO");
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [discography, setDiscography] = useState<DiscographyEditorRelease[]>([]);
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
      setInitial(musicArtist); setArtistKind(musicArtist.kind); setDisplayName(musicArtist.displayName); setImageUrl(musicArtist.imageUrl); setDiscography((musicArtist.discography ?? []).map((release) => ({ ...release, coverFile: null })));
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar o artista"); }).finally(() => { if (active) setLoadingArtist(false); });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!accessToken) return; setSaving(true); setError(""); setSavedSlug("");
    const form = new FormData(event.currentTarget);
    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para o artista");
      const uploadedDiscography = await Promise.all(discography.map(async ({ coverFile, ...release }) => {
        const cover = coverFile ? await uploadCatalogImage(coverFile, accessToken) : release.cover;
        if (!cover) throw new Error(`Selecione uma capa para ${release.title || "o lançamento"}`);
        return { ...release, cover };
      }));
      const optional = (name: string) => String(form.get(name) ?? "").trim() || null;
      const platformLinks = Object.fromEntries(platforms.map(([key]) => [key, optional(`platform.${key}`)]).filter(([, value]) => value));
      const externalLinks = Object.fromEntries(socialLinks.map(([key]) => [key, optional(`social.${key}`)]).filter(([, value]) => value));
      const input = { displayName: displayName.trim(), kind: String(form.get("kind")), nameKanji: optional("nameKanji"), imageUrl: uploadedImage, description: optional("description"), origin: optional("origin"), dateOfBirth: optional("dateOfBirth"), activityPeriod: optional("activityPeriod"), recordLabel: optional("recordLabel"), genres: String(form.get("genres") ?? "").split(",").map((item) => item.trim()).filter(Boolean), discography: uploadedDiscography, platformLinks, externalLinks, publicationStatus: String(form.get("publicationStatus")) };
      if (editSlug) { const data = await graphqlRequest<{ updateMusicArtist: { slug: string } }>(UPDATE_ARTIST, { slug: editSlug, input }, accessToken); setSavedSlug(data.updateMusicArtist.slug); }
      else { const data = await graphqlRequest<{ createMusicArtist: { slug: string } }>(CREATE_ARTIST, { input }, accessToken); setSavedSlug(data.createMusicArtist.slug); }
      setImageUrl(uploadedImage); setImageFile(null); setDiscography(uploadedDiscography.map((release) => ({ ...release, coverFile: null })));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar o artista"); }
    finally { setSaving(false); }
  };

  if (authLoading || loadingArtist) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiMusic /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar artistas.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return <main className={styles.page}><header className={styles.header}><div><span>Administração · Artista musical</span><h1>{editSlug ? "Editar artista" : "Cadastrar artista ou banda"}</h1></div><p>Este perfil poderá ser vinculado às canções dos animes.</p></header>
    <form className={styles.form} autoComplete="off" onSubmit={submit}><section className={styles.card}><div className={styles.sectionTitle}><span>01</span><div><h2>Perfil musical</h2><p>Identidade e informações profissionais.</p></div></div><div className={styles.grid}>
      <label><span>Nome artístico *</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
      <label><span>Tipo *</span><CustomSelect name="kind" value={artistKind} onChange={(value) => setArtistKind(value as ArtistData["kind"])} options={[{ value: "SOLO", label: "Artista solo" }, { value: "BAND", label: "Banda ou grupo" }]} /></label>
      <label><span>Nome em Japonês</span><input name="nameKanji" defaultValue={initial?.nameKanji ?? ""} /></label><label><span>Origem</span><input name="origin" defaultValue={initial?.origin ?? ""} /></label>
      <label><span>{artistKind === "BAND" ? "Data de criação" : "Data de nascimento"}</span><input name="dateOfBirth" defaultValue={initial?.dateOfBirth ?? ""} /></label><label><span>Período de atividade</span><input name="activityPeriod" defaultValue={initial?.activityPeriod ?? ""} /></label>
      <label><span>Gravadora</span><input name="recordLabel" defaultValue={initial?.recordLabel ?? ""} /></label><label><span>Gêneros musicais</span><input name="genres" defaultValue={initial?.genres.join(", ") ?? ""} placeholder="J-Pop, Anisong" /></label>
      <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
      <label className={styles.wide}><span>Sinopse</span><textarea name="description" rows={7} defaultValue={initial?.description ?? ""} /></label>
      <div className={`${styles.wide} ${styles.imagePicker}`}><div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia do artista" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div><div className={styles.imagePickerContent}><strong>Imagem de perfil *</strong><p>Envie JPEG, PNG ou WebP.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div></div>
    </div></section>
    <section className={styles.card}>
      <div className={styles.sectionTitle}><span>02</span><div><h2>Links da página</h2><p>Campos vazios não serão exibidos ao público.</p></div></div>
      <h3 className={styles.subheading}>Links relacionados</h3>
      <div className={styles.linkGrid}>{socialLinks.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`social.${key}`} defaultValue={initial?.externalLinks?.[key] ?? ""} placeholder="https://…" /></label>)}</div>
      <hr className={styles.linkDivider} />
      <h3 className={styles.subheading}>Ouça em</h3>
      <div className={styles.linkGrid}>{platforms.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`platform.${key}`} defaultValue={initial?.platformLinks[key] ?? ""} placeholder="https://…" /></label>)}</div>
    </section>
    <section className={styles.card}>
      <div className={styles.sectionTitle}><span>03</span><div><h2>Discografia</h2><p>Cadastre os lançamentos exibidos na seção de discografia do perfil.</p></div></div>
      {discography.map((release, index) => (
        <SortableItem key={`discography-${index}`} listId="artist-discography" index={index} count={discography.length} onMove={(from, to) => setDiscography((items) => reorderItems(items, from, to))}><fieldset className={styles.nestedCard}>
          <legend><span className={styles.sequenceBadge}>LANÇAMENTO</span> {index + 1}</legend>
          <div className={styles.grid}>
            <label><span>Título *</span><input required value={release.title} onChange={(event) => setDiscography((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /></label>
            <label><span>Tipo *</span><CustomSelect required value={release.releaseType} options={releaseTypes} onChange={(releaseType) => setDiscography((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, releaseType } : item))} /></label>
            <label><span>Ano *</span><input required value={release.year} placeholder="2024" onChange={(event) => setDiscography((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, year: event.target.value } : item))} /></label>
            <label><span>Quantidade de faixas *</span><input required type="number" min="0" max="10000" value={release.tracks} onChange={(event) => setDiscography((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, tracks: Number(event.target.value) } : item))} /></label>
            <div className={styles.wide}><ReleaseCoverPicker release={release} onChange={(coverFile) => setDiscography((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, coverFile } : item))} /></div>
          </div>
          <button type="button" className={styles.remove} onClick={() => setDiscography((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remover lançamento</button>
        </fieldset></SortableItem>
      ))}
      <button type="button" className={styles.add} onClick={() => setDiscography((items) => [...items, emptyRelease()])}>+ Adicionar lançamento</button>
    </section>
    {error && <p className={styles.error}>{error}</p>}{savedSlug && <p className={styles.success}>Artista {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/artist/${savedSlug}`}>Abrir perfil</Link></p>}<div className={styles.footerActions}><CancelLink className={styles.cancelAction} href="/admin/artist">Cancelar</CancelLink><SaveButton disabled={saving}>{editSlug ? "Salvar alterações" : "Cadastrar artista"}</SaveButton></div></form>
  </main>;
}

export default function NewArtistPage() { return <ArtistFormPage />; }
