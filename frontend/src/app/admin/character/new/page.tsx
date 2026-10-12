"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiImage, FiPlus, FiTrash2, FiUploadCloud, FiUser } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";
import { CancelLink } from "@/shared/components/AdminFormActions/CancelLink";
import { SaveButton } from "@/shared/components/AdminFormActions/SaveButton";
import { reorderItems, SortableItem } from "@/shared/components/SortableItem/SortableItem";

const CREATE_CHARACTER = `mutation CreateCharacter($input: CreateCharacterInput!) {
  createCharacter(input: $input) { slug }
}`;
const UPDATE_CHARACTER = `mutation UpdateCharacter($slug: String!, $input: CreateCharacterInput!) {
  updateCharacter(slug: $slug, input: $input) { slug }
}`;
const ADMIN_CHARACTER = `query AdminCharacter($slug: String!) {
  character(slug: $slug) {
    nameRomaji nameKanji description imageUrl dateOfBirth hometown publicationStatus
    voiceCredits { seiyuuSlug animeTitle seiyuu { id displayName slug nameKanji imageUrl } }
  }
}`;

const SEARCH_SEIYUUS = `query SearchSeiyuus($query: String) {
  adminSeiyuus(query: $query) { id displayName slug nameKanji imageUrl }
}`;
const SEARCH_ANIMES = `query SearchAnimes($query: String) {
  adminAnimes(query: $query) { id title slug coverUrl }
}`;

type PersonOption = { id: string; displayName: string; slug: string; nameKanji: string | null; imageUrl: string | null };
type VoiceCredit = { seiyuuSlug: string; seiyuu: PersonOption | null; animeTitle: string };
type CharacterData = {
  nameRomaji: string;
  nameKanji: string | null;
  description: string | null;
  imageUrl: string;
  dateOfBirth: string | null;
  hometown: string | null;
  publicationStatus: "DRAFT" | "PUBLISHED";
  voiceCredits: VoiceCredit[];
};

export function CharacterFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<CharacterData | null>(null);
  const [nameRomaji, setNameRomaji] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [voiceCredits, setVoiceCredits] = useState<VoiceCredit[]>([]);
  const [loadingCharacter, setLoadingCharacter] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");

  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ character: CharacterData | null }>(ADMIN_CHARACTER, { slug: editSlug }, accessToken)
      .then((data) => {
        if (!active) return;
        if (!data.character) throw new Error("Personagem não encontrado");
        setInitial(data.character);
        setNameRomaji(data.character.nameRomaji);
        setImageUrl(data.character.imageUrl);
        setVoiceCredits(data.character.voiceCredits);
      })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar o personagem"); })
      .finally(() => { if (active) setLoadingCharacter(false); });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const updateAnimeTitle = (index: number, animeTitle: string) => {
    setVoiceCredits((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, animeTitle } : item));
  };
  const updateSeiyuu = (index: number, seiyuu: PersonOption | null) => {
    setVoiceCredits((items) => items.map((item, itemIndex) => itemIndex === index
      ? { ...item, seiyuu, seiyuuSlug: seiyuu?.slug ?? "" }
      : item));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError("");
    setSavedSlug("");
    if (voiceCredits.some((credit) => !credit.seiyuu?.slug && !credit.seiyuuSlug.trim())) {
      setError("Selecione um seiyuu para cada trabalho de voz");
      setSaving(false);
      return;
    }
    const form = new FormData(event.currentTarget);

    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para o personagem");
      const input = {
        nameRomaji: nameRomaji.trim(),
        nameKanji: String(form.get("nameKanji") ?? "").trim() || null,
        description: String(form.get("description") ?? "").trim() || null,
        imageUrl: uploadedImage,
        dateOfBirth: String(form.get("dateOfBirth") ?? "").trim() || null,
        hometown: String(form.get("hometown") ?? "").trim() || null,
        publicationStatus: String(form.get("publicationStatus")),
        voiceCredits: voiceCredits.map((credit) => ({
          seiyuuSlug: credit.seiyuu?.slug ?? credit.seiyuuSlug.trim(),
          animeTitle: credit.animeTitle.trim(),
        })),
      };
      if (editSlug) {
        const data = await graphqlRequest<{ updateCharacter: { slug: string } }>(
          UPDATE_CHARACTER,
          { slug: editSlug, input },
          accessToken,
        );
        setSavedSlug(data.updateCharacter.slug);
      } else {
        const data = await graphqlRequest<{ createCharacter: { slug: string } }>(
          CREATE_CHARACTER,
          { input },
          accessToken,
        );
        setSavedSlug(data.createCharacter.slug);
      }
      setImageUrl(uploadedImage);
      setImageFile(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar o personagem");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingCharacter) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiUser /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar personagens.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>Administração · Personagem</span><h1>{editSlug ? "Editar personagem" : "Cadastrar personagem"}</h1></div>
        <p>Gerencie os dados exibidos na página pública e nos perfis de seiyuus.</p>
      </header>

      <form className={styles.form} autoComplete="off" onSubmit={submit}>
        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>01</span><div><h2>Identidade</h2><p>Informações principais do personagem.</p></div></div>
          <div className={styles.grid}>
            <label><span>Nome em Romaji *</span><input required value={nameRomaji} onChange={(event) => setNameRomaji(event.target.value)} /></label>
            <label><span>Nome em Japonês</span><input name="nameKanji" defaultValue={initial?.nameKanji ?? ""} /></label>
            <label><span>Data de nascimento</span><input name="dateOfBirth" defaultValue={initial?.dateOfBirth ?? ""} /></label>
            <label><span>Cidade natal</span><input name="hometown" defaultValue={initial?.hometown ?? ""} /></label>
            <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
            <label className={styles.wide}><span>Descrição</span><textarea name="description" rows={6} defaultValue={initial?.description ?? ""} /></label>
            <div className={`${styles.wide} ${styles.imagePicker}`}>
              <div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia do personagem" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div>
              <div className={styles.imagePickerContent}>
                <strong>Imagem do personagem *</strong><p>Envie JPEG, PNG ou WebP, ou mantenha a imagem já cadastrada.</p>
                <label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>02</span><div><h2>Trabalhos de voz</h2><p>Vincule o personagem ao perfil do seiyuu e informe o anime.</p></div></div>
          {voiceCredits.map((credit, index) => (
            <SortableItem key={`voice-${index}`} listId="character-voice-credits" index={index} count={voiceCredits.length} onMove={(from, to) => setVoiceCredits((items) => reorderItems(items, from, to))}><div className={styles.row}>
              <SeiyuuPicker value={credit.seiyuu} accessToken={accessToken!} onChange={(seiyuu) => updateSeiyuu(index, seiyuu)} />
              <AnimePicker value={credit.animeTitle} accessToken={accessToken!} onChange={(title) => updateAnimeTitle(index, title)} />
              <button className={styles.remove} type="button" onClick={() => setVoiceCredits((items) => items.filter((_, itemIndex) => itemIndex !== index))}><FiTrash2 /> Remover</button>
            </div></SortableItem>
          ))}
          <button className={styles.add} type="button" onClick={() => setVoiceCredits((items) => [...items, { seiyuuSlug: "", seiyuu: null, animeTitle: "" }])}><FiPlus /> Vincular seiyuu</button>
        </section>

        {error && <p className={styles.error}>{error}</p>}
        {savedSlug && <p className={styles.success}>Personagem {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/character/${savedSlug}`}>Abrir página</Link></p>}
        <div className={styles.footerActions}><CancelLink className={styles.cancelAction} href="/admin/character">Cancelar</CancelLink><SaveButton disabled={saving}>{editSlug ? "Salvar alterações" : "Cadastrar personagem"}</SaveButton></div>
      </form>
    </main>
  );
}

function SeiyuuPicker({ value, accessToken, onChange }: {
  value: PersonOption | null;
  accessToken: string;
  onChange(seiyuu: PersonOption | null): void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PersonOption[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const query = search.trim();
    if (value || query.length < 2) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ adminSeiyuus: PersonOption[] }>(SEARCH_SEIYUUS, { query }, accessToken)
        .then((data) => { if (active) { setResults(data.adminSeiyuus); setResultsFor(query); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(query); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search, value]);

  const visibleResults = resultsFor === search.trim() ? results : [];
  return <div className={styles.workPicker}>
    <label>
      <span className={styles.voicePickerLabel}>Seiyuu *</span>
      {value ? <div className={styles.selectedWork}>
        {value.imageUrl ? <Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={48} height={68} unoptimized /> : <span className={styles.personFallback}><FiUser /></span>}
        <span><strong>{value.displayName}</strong></span>
        <button type="button" onClick={() => { onChange(null); setSearch(""); }}>Trocar</button>
      </div> : <input value={search} placeholder="Buscar pelo nome" onChange={(event) => setSearch(event.target.value)} />}
    </label>
    {searching && <small className={styles.searchHint}>Buscando seiyuus…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhum seiyuu encontrado.</small>}
    {!value && visibleResults.length > 0 && <div className={styles.workResults}>{visibleResults.map((seiyuu) => <button type="button" key={seiyuu.id} onClick={() => {
      onChange(seiyuu);
      setSearch("");
      setResults([]);
      setResultsFor("");
    }}>
      {seiyuu.imageUrl ? <Image src={assetUrl(seiyuu.imageUrl) ?? seiyuu.imageUrl} alt="" width={38} height={54} unoptimized /> : <span className={styles.personFallback}><FiUser /></span>}
      <span><strong>{seiyuu.displayName}</strong><small>{seiyuu.nameKanji || "Seiyuu"}</small></span>
    </button>)}</div>}
  </div>;
}

function AnimePicker({ value, accessToken, onChange }: {
  value: string;
  accessToken: string;
  onChange(title: string): void;
}) {
  const [search, setSearch] = useState("");
  const [selectedAnime, setSelectedAnime] = useState<{ id: string; title: string; slug: string; coverUrl: string } | null>(null);
  const [results, setResults] = useState<Array<{ id: string; title: string; slug: string; coverUrl: string }>>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ adminAnimes: typeof results }>(SEARCH_ANIMES, { query }, accessToken)
        .then((data) => { if (active) { setResults(data.adminAnimes); setResultsFor(query); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(query); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search]);

  const visibleResults = resultsFor === search.trim() ? results : [];
  return <label className={styles.voiceAnimeField}>
    <span>Anime *</span>
    {selectedAnime ? <div className={styles.selectedWork}>
      <Image src={assetUrl(selectedAnime.coverUrl) ?? selectedAnime.coverUrl} alt="" width={38} height={54} unoptimized />
      <span><strong>{selectedAnime.title}</strong></span>
      <button type="button" onClick={() => { setSelectedAnime(null); onChange(""); setSearch(""); }}>Trocar</button>
    </div> : <input required value={value} placeholder="Buscar pelo título" onChange={(event) => {
      onChange(event.target.value);
      setSelectedAnime(null);
      setSearch(event.target.value);
    }} />}
    {searching && <small className={styles.searchHint}>Buscando animes…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhum anime encontrado.</small>}
    {visibleResults.length > 0 && <div className={styles.workResults}>{visibleResults.map((anime) => <button type="button" key={anime.id} onClick={() => {
      setSelectedAnime(anime);
      onChange(anime.title);
      setSearch("");
      setResults([]);
      setResultsFor("");
    }}>
      <Image src={assetUrl(anime.coverUrl) ?? anime.coverUrl} alt="" width={38} height={54} unoptimized />
      <span><strong>{anime.title}</strong><small>Anime</small></span>
    </button>)}</div>}
  </label>;
}

export default function NewCharacterPage() {
  return <CharacterFormPage />;
}
