"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FiArrowLeft, FiImage, FiLock, FiLogIn, FiShield, FiUploadCloud, FiUser, FiX } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadAnimeCover } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { catalogMediumLabel, catalogStatusLabel } from "@/shared/catalog/labels";
import { staffRoleOptions, staffRoleValue } from "@/shared/catalog/staff-roles";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker/page";
import { CustomSelect as AdminSelect } from "@/shared/components/CustomSelect/page";
import styles from "./page.module.css";

const CREATE_ANIME = `
  mutation CreateAnime($input: CreateAnimeInput!) {
    createAnime(input: $input) { id title slug publicationStatus }
  }
`;
const UPDATE_ANIME = `
  mutation UpdateAnime($slug: String!, $input: CreateAnimeInput!) {
    updateAnime(slug: $slug, input: $input) { id title slug publicationStatus }
  }
`;
const ADMIN_ANIME = `query AdminAnime($slug: String!) {
  anime(slug: $slug) {
    id title slug synopsis coverUrl alternativeTitles { type title } genres producers demography rating publicationStatus
    installments { order title label format synopsis coverUrl episodes durationMinutes status startDate endDate broadcastSeason studio { id displayName slug imageUrl } studioName }
    characterCredits {
      character { id nameRomaji slug nameKanji imageUrl }
      seiyuu { id displayName slug nameKanji imageUrl }
    }
    songCredits {
      songTitle type sequence episodeRange
      artist { id displayName slug kind imageUrl }
      featuredArtists { id displayName slug kind imageUrl }
    }
    staffCredits { role contribution person { id displayName slug nameKanji imageUrl } }
    relatedWorks { id relationType title slug href coverUrl medium status }
    externalLinks { website x instagram pixiv youtube }
    streamingLinks { crunchyroll netflix primeVideo bilibili retrocrush hulu hidive uNext abemaTv adn museAsia laftel tver iqiyi tubi dAnimeStore }
  }
}`;
const SEARCH_WORKS = `query SearchWorks($query: String!) {
  searchWorks(query: $query) { id title slug medium coverUrl status href }
}`;
const SEARCH_PEOPLE = `query SearchPeople($query: String!) {
  searchPeople(query: $query) { id displayName slug nameKanji imageUrl }
}`;
const SEARCH_CHARACTERS = `query SearchCharacters($query: String) {
  adminCharacters(query: $query) { id nameRomaji slug nameKanji imageUrl }
}`;
const SEARCH_SEIYUUS = `query SearchSeiyuus($query: String) {
  adminSeiyuus(query: $query) { id displayName slug nameKanji imageUrl }
}`;
const SEARCH_MUSIC_ARTISTS = `query SearchMusicArtists($query: String) {
  adminMusicArtists(query: $query) { id displayName slug kind imageUrl }
}`;
const SEARCH_STUDIOS = `query SearchStudios($query: String!) {
  searchStudios(query: $query) { id displayName slug imageUrl }
}`;

const externalLinks = [
  ["website", "Site oficial"], ["x", "X/Twitter"], ["instagram", "Instagram"],
  ["pixiv", "Pixiv"], ["youtube", "YouTube"],
] as const;

const streamingLinks = [
  ["crunchyroll", "Crunchyroll"], ["netflix", "Netflix"], ["primeVideo", "Prime Video"],
  ["bilibili", "BiliBili"], ["retrocrush", "RetroCrush"], ["hulu", "Hulu"],
  ["hidive", "HiDive"], ["uNext", "U-Next"], ["abemaTv", "Abema TV"],
  ["adn", "Anime Digital Network"], ["museAsia", "Muse Asia"], ["laftel", "Laftel TV"],
  ["tver", "TVer"], ["iqiyi", "iQIYI"], ["tubi", "Tubi"], ["dAnimeStore", "d Anime Store"],
] as const;

const animeRatingOptions = [
  { value: "", label: "Não informada" },
  { value: "G", label: "G — Todas as idades" },
  { value: "PG", label: "PG — Recomendado para crianças" },
  { value: "PG13", label: "PG13 — 13 anos ou mais" },
  { value: "R17", label: "R17 — Violência e linguagem" },
  { value: "R18", label: "R18 — Conteúdo adulto" },
] as const;

function normalizeAnimeRating(value: string | null | undefined) {
  const legacyRatings: Record<string, string> = {
    "PG-13": "PG13",
    "R-17+": "R17",
    "R+": "R18",
    Rx: "R18",
  };
  return value ? legacyRatings[value] ?? value : "";
}

function ratingOptionsWithLegacyValue(current: string | null | undefined) {
  const normalized = normalizeAnimeRating(current);
  if (!normalized || animeRatingOptions.some((option) => option.value === normalized)) return animeRatingOptions;
  return [...animeRatingOptions, { value: normalized, label: `${normalized} — Classificação cadastrada` }];
}

type AlternativeTitle = { type: string; title: string };
type WorkOption = { id: string; title: string; slug: string; medium: string; coverUrl: string; status: string; href: string };
type PersonOption = { id: string; displayName: string; slug: string; nameKanji: string | null; imageUrl: string | null };
type CharacterOption = { id: string; nameRomaji: string; slug: string; nameKanji: string | null; imageUrl: string };
type MusicArtistOption = { id: string; displayName: string; slug: string; kind: "SOLO" | "BAND"; imageUrl: string };
type StudioOption = { id: string; displayName: string; slug: string; imageUrl: string };
type Installment = {
  title: string; label: string; format: string; synopsis: string; coverFile: File | null; coverUrl: string | null;
  episodes: number; durationMinutes: number | null; status: string; startDate: string; endDate: string;
  broadcastSeason: string; studio: StudioOption | null; studioName?: string | null;
};
type RelatedWork = {
  relationType: string; work: WorkOption | null;
};
type StaffCredit = { role: string; contribution: string | null; person: PersonOption | null };
type CharacterCredit = { character: CharacterOption | null; seiyuu: PersonOption | null };
type SongCredit = { artist: MusicArtistOption | null; featuredArtists: Array<MusicArtistOption | null>; songTitle: string; type: "OPENING" | "ENDING" | "INSERT"; sequence: number | null; episodeRange: string };

const emptyCharacterCredit = (): CharacterCredit => ({ character: null, seiyuu: null });
const emptySongCredit = (): SongCredit => ({ artist: null, featuredArtists: [], songTitle: "", type: "OPENING", sequence: 1, episodeRange: "" });

const emptyInstallment = (): Installment => ({
  title: "", label: "", format: "TV", synopsis: "", coverFile: null, coverUrl: null, episodes: 1,
  durationMinutes: null, status: "ANNOUNCED", startDate: "", endDate: "",
  broadcastSeason: "", studio: null,
});

const emptyRelatedWork = (): RelatedWork => ({
  relationType: "OTHER", work: null,
});

function optionalObject(form: FormData, prefix: string, fields: readonly (readonly [string, string])[]) {
  return Object.fromEntries(
    fields.map(([key]) => [key, String(form.get(`${prefix}.${key}`) ?? "").trim()]).filter(([, value]) => value),
  );
}

type AnimeEditData = {
  id: string; title: string; slug: string; synopsis: string; coverUrl: string;
  alternativeTitles: AlternativeTitle[]; genres: string[]; producers: string[]; demography: string | null; rating: string | null;
  publicationStatus: string;
  installments: Array<Omit<Installment, "coverFile"> & { order: number }>;
  characterCredits: Array<{ character: CharacterOption; seiyuu: PersonOption }>;
  songCredits: Array<{ artist: MusicArtistOption; featuredArtists: MusicArtistOption[]; songTitle: string; type: "OPENING" | "ENDING" | "INSERT"; sequence: number | null; episodeRange: string | null }>;
  staffCredits: Array<{ role: string; contribution: string | null; person: PersonOption }>;
  relatedWorks: Array<WorkOption & { relationType: string }>;
  externalLinks: Record<string, string | null>;
  streamingLinks: Record<string, string | null>;
};

function ImagePicker({ file, currentUrl = null, onChange, required = false, label = "Capa" }: {
  file: File | null;
  currentUrl?: string | null;
  onChange(file: File | null): void;
  required?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const localPreview = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  const preview = localPreview ?? assetUrl(currentUrl);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  return (
    <div className={styles.imagePicker}>
      <div className={styles.coverPreview}>
        {preview ? (
          <Image src={preview} alt={`Prévia da ${label.toLowerCase()}`} fill sizes="150px" unoptimized />
        ) : (
          <span><FiImage aria-hidden="true" /><small>Nenhuma imagem</small></span>
        )}
      </div>
      <div className={styles.imagePickerContent}>
        <strong>{label}{required ? " *" : ""}</strong>
        <p>JPEG, PNG ou WebP. A imagem será ajustada para a proporção 2:3.</p>
        <div className={styles.imagePickerActions}>
          <label className={styles.fileButton}>
            <FiUploadCloud aria-hidden="true" />{file ? "Trocar imagem" : "Selecionar imagem"}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" required={required && !file && !currentUrl} onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
          </label>
          {file && <button type="button" className={styles.clearImage} onClick={() => { if (inputRef.current) inputRef.current.value = ""; onChange(null); }}><FiX aria-hidden="true" />Remover</button>}
        </div>
        {file && <small className={styles.fileName}>{file.name}</small>}
      </div>
    </div>
  );
}

function WorkPicker({ value, onChange }: { value: WorkOption | null; onChange(work: WorkOption | null): void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<WorkOption[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (value || search.trim().length < 2) return;
    let active = true;
    const normalizedSearch = search.trim();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ searchWorks: WorkOption[] }>(SEARCH_WORKS, { query: normalizedSearch })
        .then((data) => { if (active) { setResults(data.searchWorks); setResultsFor(normalizedSearch); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(normalizedSearch); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [search, value]);
  const visibleResults = resultsFor === search.trim() ? results : [];

  if (value) {
    return <div className={styles.selectedWork}>
      <Image src={assetUrl(value.coverUrl) ?? value.coverUrl} alt="" width={48} height={68} unoptimized />
      <span><strong>{value.title}</strong><small>{catalogMediumLabel(value.medium)} · {catalogStatusLabel(value.status)}</small></span>
      <button type="button" onClick={() => { onChange(null); setSearch(""); }}>Trocar</button>
    </div>;
  }

  return <div className={styles.workPicker}>
    <label><span>Buscar obra cadastrada *</span><input value={search} placeholder="Digite ao menos 2 caracteres" onChange={(event) => setSearch(event.target.value)} /></label>
    {searching && search.trim().length >= 2 && <small className={styles.searchHint}>Buscando no catálogo…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhuma obra cadastrada encontrada.</small>}
    {visibleResults.length > 0 && <div className={styles.workResults}>{visibleResults.map((work) => <button type="button" key={work.id} onClick={() => onChange(work)}>
      <Image src={assetUrl(work.coverUrl) ?? work.coverUrl} alt="" width={38} height={54} unoptimized />
      <span><strong>{work.title}</strong><small>{catalogMediumLabel(work.medium)} · {catalogStatusLabel(work.status)}</small></span>
    </button>)}</div>}
  </div>;
}

function PersonPicker({ value, accessToken, subtitle, onChange }: {
  value: PersonOption | null;
  accessToken: string;
  subtitle?: string;
  onChange(person: PersonOption | null): void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PersonOption[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (value || search.trim().length < 2) return;
    let active = true;
    const normalizedSearch = search.trim();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ searchPeople: PersonOption[] }>(SEARCH_PEOPLE, { query: normalizedSearch }, accessToken)
        .then((data) => { if (active) { setResults(data.searchPeople); setResultsFor(normalizedSearch); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(normalizedSearch); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search, value]);
  const visibleResults = resultsFor === search.trim() ? results : [];

  if (value) return <div className={styles.selectedWork}>
    {value.imageUrl ? <Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={48} height={68} unoptimized /> : <span className={styles.personFallback}><FiUser /></span>}
    <span><strong>{value.displayName}</strong><small>{subtitle || "Função não selecionada"}</small></span>
    <button type="button" onClick={() => { onChange(null); setSearch(""); }}>Trocar</button>
  </div>;

  return <div className={styles.workPicker}>
    <label><span>Buscar pessoa cadastrada *</span><input value={search} placeholder="Digite ao menos 2 caracteres" onChange={(event) => setSearch(event.target.value)} /></label>
    {searching && search.trim().length >= 2 && <small className={styles.searchHint}>Buscando pessoas…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhuma pessoa cadastrada encontrada.</small>}
    {visibleResults.length > 0 && <div className={styles.workResults}>{visibleResults.map((person) => <button type="button" key={person.id} onClick={() => onChange(person)}>
      {person.imageUrl ? <Image src={assetUrl(person.imageUrl) ?? person.imageUrl} alt="" width={38} height={54} unoptimized /> : <span className={styles.personFallback}><FiUser /></span>}
      <span><strong>{person.displayName}</strong><small>{person.nameKanji || "Pessoa da indústria"}</small></span>
    </button>)}</div>}
  </div>;
}

function CharacterPicker({ value, accessToken, onChange }: {
  value: CharacterOption | null;
  accessToken: string;
  onChange(character: CharacterOption | null): void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CharacterOption[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (value || search.trim().length < 2) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ adminCharacters: CharacterOption[] }>(SEARCH_CHARACTERS, { query: search.trim() }, accessToken)
        .then((data) => { if (active) { setResults(data.adminCharacters); setResultsFor(search.trim()); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(search.trim()); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search, value]);
  const visibleResults = resultsFor === search.trim() ? results : [];

  if (value) return <div className={styles.selectedWork}>
    <Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={48} height={68} unoptimized />
    <span><strong>{value.nameRomaji}</strong><small>Personagem</small></span>
    <button type="button" onClick={() => { onChange(null); setSearch(""); }}>Trocar</button>
  </div>;

  return <div className={styles.workPicker}>
    <label><span>Buscar personagem cadastrado *</span><input value={search} placeholder="Digite ao menos 2 caracteres" onChange={(event) => setSearch(event.target.value)} /></label>
    {searching && <small className={styles.searchHint}>Buscando personagens…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhum personagem encontrado.</small>}
    {visibleResults.length > 0 && <div className={styles.workResults}>{visibleResults.map((character) => <button type="button" key={character.id} onClick={() => onChange(character)}>
      <Image src={assetUrl(character.imageUrl) ?? character.imageUrl} alt="" width={38} height={54} unoptimized />
      <span><strong>{character.nameRomaji}</strong><small>{character.nameKanji || "Personagem"}</small></span>
    </button>)}</div>}
  </div>;
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
    if (value || search.trim().length < 2) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ adminSeiyuus: PersonOption[] }>(SEARCH_SEIYUUS, { query: search.trim() }, accessToken)
        .then((data) => { if (active) { setResults(data.adminSeiyuus); setResultsFor(search.trim()); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(search.trim()); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search, value]);
  const visibleResults = resultsFor === search.trim() ? results : [];

  if (value) return <div className={styles.selectedWork}>
    {value.imageUrl ? <Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={48} height={68} unoptimized /> : <span className={styles.personFallback}><FiUser /></span>}
    <span><strong>{value.displayName}</strong><small>Seiyuu</small></span>
    <button type="button" onClick={() => { onChange(null); setSearch(""); }}>Trocar</button>
  </div>;

  return <div className={styles.workPicker}>
    <label><span>Buscar seiyuu cadastrado *</span><input value={search} placeholder="Digite ao menos 2 caracteres" onChange={(event) => setSearch(event.target.value)} /></label>
    {searching && <small className={styles.searchHint}>Buscando seiyuus…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhum seiyuu encontrado.</small>}
    {visibleResults.length > 0 && <div className={styles.workResults}>{visibleResults.map((seiyuu) => <button type="button" key={seiyuu.id} onClick={() => onChange(seiyuu)}>
      {seiyuu.imageUrl ? <Image src={assetUrl(seiyuu.imageUrl) ?? seiyuu.imageUrl} alt="" width={38} height={54} unoptimized /> : <span className={styles.personFallback}><FiUser /></span>}
      <span><strong>{seiyuu.displayName}</strong><small>{seiyuu.nameKanji || "Seiyuu"}</small></span>
    </button>)}</div>}
  </div>;
}

function MusicArtistPicker({ value, accessToken, onChange }: {
  value: MusicArtistOption | null;
  accessToken: string;
  onChange(artist: MusicArtistOption | null): void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<MusicArtistOption[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (value || search.trim().length < 2) return;
    let active = true;
    const normalizedSearch = search.trim();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ adminMusicArtists: MusicArtistOption[] }>(SEARCH_MUSIC_ARTISTS, { query: normalizedSearch }, accessToken)
        .then((data) => { if (active) { setResults(data.adminMusicArtists); setResultsFor(normalizedSearch); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(normalizedSearch); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search, value]);
  const visibleResults = resultsFor === search.trim() ? results : [];

  if (value) return <div className={styles.selectedWork}>
    <Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={48} height={68} unoptimized />
    <span><strong>{value.displayName}</strong><small>{value.kind === "BAND" ? "Banda" : "Artista solo"}</small></span>
    <button type="button" onClick={() => { onChange(null); setSearch(""); }}>Trocar</button>
  </div>;

  return <div className={styles.workPicker}>
    <label><span>Buscar cantor ou banda *</span><input value={search} placeholder="Digite ao menos 2 caracteres" onChange={(event) => setSearch(event.target.value)} /></label>
    {searching && <small className={styles.searchHint}>Buscando artistas…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhum artista encontrado. Cadastre-o primeiro em Artistas musicais.</small>}
    {visibleResults.length > 0 && <div className={styles.workResults}>{visibleResults.map((artist) => <button type="button" key={artist.id} onClick={() => onChange(artist)}>
      <Image src={assetUrl(artist.imageUrl) ?? artist.imageUrl} alt="" width={38} height={54} unoptimized />
      <span><strong>{artist.displayName}</strong><small>{artist.kind === "BAND" ? "Banda" : "Artista solo"}</small></span>
    </button>)}</div>}
  </div>;
}

function StudioPicker({ value, accessToken, onChange }: {
  value: StudioOption | null;
  accessToken: string;
  onChange(studio: StudioOption | null): void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<StudioOption[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (value || search.trim().length < 2) return;
    let active = true;
    const normalizedSearch = search.trim();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      void graphqlRequest<{ searchStudios: StudioOption[] }>(SEARCH_STUDIOS, { query: normalizedSearch }, accessToken)
        .then((data) => { if (active) { setResults(data.searchStudios); setResultsFor(normalizedSearch); } })
        .catch(() => { if (active) { setResults([]); setResultsFor(normalizedSearch); } })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, search, value]);

  if (value) return <div className={styles.selectedStudioInput}>
    <Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={28} height={28} unoptimized />
    <strong>{value.displayName}</strong>
    <button type="button" aria-label="Remover estúdio" onClick={() => { onChange(null); setSearch(""); }}><FiX /></button>
  </div>;

  const visibleResults = resultsFor === search.trim() ? results : [];
  return <div className={styles.studioPicker}>
    <input value={search} placeholder="Buscar estúdio cadastrado" onChange={(event) => setSearch(event.target.value)} />
    {searching && <small className={styles.searchHint}>Buscando estúdios…</small>}
    {!searching && search.trim().length >= 2 && resultsFor === search.trim() && visibleResults.length === 0 && <small className={styles.searchHint}>Nenhum estúdio encontrado. Cadastre-o primeiro em Estúdios.</small>}
    {visibleResults.length > 0 && <div className={styles.studioResults}>{visibleResults.map((studio) => <button type="button" key={studio.id} onClick={() => onChange(studio)}>
      <Image src={assetUrl(studio.imageUrl) ?? studio.imageUrl} alt="" width={32} height={32} unoptimized />
      <strong>{studio.displayName}</strong>
    </button>)}</div>}
  </div>;
}

function AccessLoading() {
  return (
    <main className={styles.accessPage} aria-busy="true" aria-live="polite">
      <span className={styles.srOnly}>Verificando acesso à administração</span>
      <div className={styles.loadingHeader} aria-hidden="true">
        <div>
          <span className={`${styles.skeleton} ${styles.skeletonEyebrow}`} />
          <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        </div>
        <span className={`${styles.skeleton} ${styles.skeletonDescription}`} />
      </div>
      <section className={styles.loadingCard} aria-hidden="true">
        <div className={styles.loadingCardHeading}>
          <span className={styles.loadingSeal}><FiShield /></span>
          <div>
            <span className={`${styles.skeleton} ${styles.skeletonSectionTitle}`} />
            <span className={`${styles.skeleton} ${styles.skeletonSectionCopy}`} />
          </div>
        </div>
        <div className={styles.loadingFields}>
          {Array.from({ length: 6 }, (_, index) => (
            <div className={index === 2 || index === 3 ? styles.loadingFieldWide : undefined} key={index}>
              <span className={`${styles.skeleton} ${styles.skeletonLabel}`} />
              <span className={`${styles.skeleton} ${styles.skeletonInput}`} />
            </div>
          ))}
        </div>
      </section>
      <div className={styles.loadingStatus}>
        <span className={styles.spinner} aria-hidden="true" />
        <span><strong>Preparando o painel</strong><small>Validando sua sessão administrativa…</small></span>
      </div>
    </main>
  );
}

function AccessMessage({ authenticated }: { authenticated: boolean }) {
  return (
    <main className={styles.accessPage}>
      <section className={styles.accessCard}>
        <span className={styles.accessIcon}>{authenticated ? <FiLock /> : <FiLogIn />}</span>
        <span className={styles.accessEyebrow}>Administração · OtakuList</span>
        <h1>{authenticated ? "Acesso restrito" : "Sessão necessária"}</h1>
        <p>{authenticated
          ? "Sua conta está conectada, mas não possui permissão para cadastrar obras."
          : "Entre com uma conta administrativa para acessar o cadastro de anime."}</p>
        <Link className={styles.accessAction} href={authenticated ? "/" : "/login"}>
          {authenticated ? <FiArrowLeft /> : <FiLogIn />}
          {authenticated ? "Voltar ao início" : "Entrar na conta"}
        </Link>
      </section>
    </main>
  );
}

export function AnimeFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [alternativeTitles, setAlternativeTitles] = useState<AlternativeTitle[]>([]);
  const [sourceWork, setSourceWork] = useState<WorkOption | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([emptyInstallment()]);
  const [relatedWorks, setRelatedWorks] = useState<RelatedWork[]>([]);
  const [characterCredits, setCharacterCredits] = useState<CharacterCredit[]>([emptyCharacterCredit()]);
  const [songCredits, setSongCredits] = useState<SongCredit[]>([emptySongCredit()]);
  const [staffCredits, setStaffCredits] = useState<StaffCredit[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [initialAnime, setInitialAnime] = useState<AnimeEditData | null>(null);
  const [loadingAnime, setLoadingAnime] = useState(Boolean(editSlug));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ anime: AnimeEditData | null }>(ADMIN_ANIME, { slug: editSlug }, accessToken)
      .then(({ anime }) => {
        if (!active) return;
        if (!anime) {
          setLoadError("Anime não encontrado ou indisponível para edição.");
          return;
        }
        setInitialAnime(anime);
        setTitle(anime.title);
        setCoverUrl(anime.coverUrl);
        setAlternativeTitles(anime.alternativeTitles);
        setInstallments(anime.installments.map((installment) => {
          const { order, ...values } = installment;
          void order;
          return { ...values, coverFile: null };
        }));
        const source = anime.relatedWorks.find((work) => work.relationType === "SOURCE_MATERIAL") ?? null;
        setSourceWork(source);
        setRelatedWorks(
          anime.relatedWorks
            .filter((work) => work.relationType !== "SOURCE_MATERIAL")
            .map((work) => ({ relationType: work.relationType, work })),
        );
        setCharacterCredits(anime.characterCredits.length > 0
          ? anime.characterCredits.map((credit) => ({ character: credit.character, seiyuu: credit.seiyuu }))
          : [emptyCharacterCredit()]);
        setSongCredits(anime.songCredits.length > 0
          ? anime.songCredits.map((credit) => ({ ...credit, featuredArtists: credit.featuredArtists ?? [], episodeRange: credit.episodeRange ?? "" }))
          : [emptySongCredit()]);
        setStaffCredits(anime.staffCredits.map((credit) => ({ role: credit.role, contribution: credit.contribution, person: credit.person })));
      })
      .catch((caught) => {
        if (active) setLoadError(caught instanceof Error ? caught.message : "Não foi possível carregar o anime");
      })
      .finally(() => {
        if (active) setLoadingAnime(false);
      });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const updateInstallment = <K extends keyof Installment>(index: number, field: K, value: Installment[K]) => {
    setInstallments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };
  const updateRelated = <K extends keyof RelatedWork>(index: number, field: K, value: RelatedWork[K]) => {
    setRelatedWorks((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };
  const updateSongCredit = <K extends keyof SongCredit>(index: number, field: K, value: SongCredit[K]) => {
    setSongCredits((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCreatedSlug("");
    const activeCharacterCredits = characterCredits.filter((credit) => credit.character || credit.seiyuu);
    const activeSongCredits = songCredits.filter((credit) => credit.artist || credit.songTitle.trim());
    if (!coverFile && !coverUrl) {
      setError("Selecione a capa principal da obra");
      return;
    }
    if (!accessToken) {
      setError("Sua sessão expirou. Entre novamente para continuar.");
      return;
    }
    if (relatedWorks.some((item) => !item.work)) {
      setError("Selecione uma obra cadastrada em todos os vínculos relacionados");
      return;
    }
    if (staffCredits.some((credit) => !credit.person || !credit.role.trim())) {
      setError("Selecione uma pessoa e informe sua função em todos os vínculos de staff");
      return;
    }
    if (activeCharacterCredits.some((credit) => !credit.character || !credit.seiyuu)) {
      setError("Selecione um personagem e um seiyuu em todos os vínculos de voz");
      return;
    }
    if (activeSongCredits.some((credit) => !credit.artist || !credit.songTitle.trim())) {
      setError("Selecione um artista e informe o título em todos os vínculos de canções");
      return;
    }
    if (activeSongCredits.some((credit) => credit.featuredArtists.some((artist) => !artist))) {
      setError("Selecione um artista em todas as participações adicionadas");
      return;
    }
    if (activeSongCredits.some((credit) => {
      const ids = credit.featuredArtists.flatMap((artist) => artist ? [artist.id] : []);
      return ids.includes(credit.artist!.id) || new Set(ids).size !== ids.length;
    })) {
      setError("O artista principal não pode ser repetido nas participações");
      return;
    }
    if (installments.some((item) => !Number.isInteger(Number(item.episodes)) || Number(item.episodes) < 1)) {
      setError("A quantidade de episódios deve ser um número inteiro maior que zero");
      return;
    }
    if (installments.some((item) => item.durationMinutes !== null && (!Number.isInteger(Number(item.durationMinutes)) || Number(item.durationMinutes) < 1))) {
      setError("A duração deve ser informada em minutos inteiros, por exemplo: 24");
      return;
    }
    setSaving(true);
    const form = new FormData(event.currentTarget);

    try {
      const [uploadedCover, installmentCovers] = await Promise.all([
        coverFile ? uploadAnimeCover(coverFile, accessToken) : Promise.resolve(coverUrl!),
        Promise.all(installments.map((item) => item.coverFile ? uploadAnimeCover(item.coverFile, accessToken) : item.coverUrl)),
      ]);
      const input = {
        title: title.trim(), synopsis: String(form.get("synopsis") ?? "").trim(), coverUrl: uploadedCover,
        alternativeTitles: alternativeTitles.filter((item) => item.title.trim()).map((item) => ({ ...item, title: item.title.trim() })),
        genres: String(form.get("genres") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
        producers: String(form.get("producers") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
        demography: String(form.get("demography") ?? "").trim() || null,
        rating: String(form.get("rating") ?? "").trim() || null,
        publicationStatus: String(form.get("publicationStatus")),
        installments: installments.map((installment, index) => {
          const { coverFile: selectedCover, coverUrl: currentCover, studio, studioName, ...item } = installment;
          void selectedCover;
          void currentCover;
          return {
            ...item, order: index + 1, episodes: Number(item.episodes),
            durationMinutes: item.durationMinutes === null ? null : Number(item.durationMinutes),
            coverUrl: installmentCovers[index],
            startDate: item.startDate || null, endDate: item.endDate || null,
            broadcastSeason: item.broadcastSeason || null, studioId: studio?.id ?? null,
            studioName: studio ? null : studioName ?? null,
          };
        }),
        staffCredits: staffCredits.map((credit) => ({ personId: credit.person!.id, role: credit.role.trim(), contribution: credit.contribution })),
        characterCredits: activeCharacterCredits.map((credit) => ({
          characterId: credit.character!.id,
          seiyuuId: credit.seiyuu!.id,
        })),
        songCredits: activeSongCredits.map((credit) => ({
          artistId: credit.artist!.id,
          featuredArtistIds: credit.featuredArtists.flatMap((artist) => artist ? [artist.id] : []),
          songTitle: credit.songTitle.trim(),
          type: credit.type,
          sequence: credit.sequence,
          episodeRange: credit.episodeRange.trim() || null,
        })),
        relatedWorks: [
          ...(sourceWork ? [{ relationType: "SOURCE_MATERIAL", workId: sourceWork.id }] : []),
          ...relatedWorks.map((item) => ({ relationType: item.relationType, workId: item.work!.id })),
        ],
        externalLinks: optionalObject(form, "external", externalLinks),
        streamingLinks: optionalObject(form, "streaming", streamingLinks),
      };

      if (editSlug) {
        const data = await graphqlRequest<{ updateAnime: { slug: string } }>(UPDATE_ANIME, { slug: editSlug, input }, accessToken);
        setCreatedSlug(data.updateAnime.slug);
      } else {
        const data = await graphqlRequest<{ createAnime: { slug: string } }>(CREATE_ANIME, { input }, accessToken);
        setCreatedSlug(data.createAnime.slug);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Não foi possível ${editSlug ? "atualizar" : "cadastrar"} o anime`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingAnime) return <AccessLoading />;
  if (!user) return <AccessMessage authenticated={false} />;
  if (user.role !== "ZEUS") return <AccessMessage authenticated />;
  if (loadError) return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiLock /></span><span className={styles.accessEyebrow}>Administração · Anime</span><h1>Não foi possível editar</h1><p>{loadError}</p><Link className={styles.accessAction} href="/admin/anime"><FiArrowLeft />Voltar aos animes</Link></section></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>Administração · Anime</span><h1>{editSlug ? "Editar obra" : "Cadastrar uma obra"}</h1></div>
        <p>{editSlug ? "Revise os dados, vínculos e lançamentos desta obra." : "A obra agrupa todos os lançamentos que formam sua sequência acompanhável."}</p>
      </header>

      <form className={styles.form} onSubmit={submit}>
        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>01</span><div><h2>Identidade da obra</h2><p>Informações compartilhadas por toda a franquia agrupada.</p></div></div>
          <div className={styles.grid}>
            <label className={styles.wide}><span>Título principal *</span><input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label className={styles.wide}><span>Sinopse geral *</span><textarea required name="synopsis" rows={6} defaultValue={initialAnime?.synopsis} /></label>
            <div className={styles.wide}><ImagePicker file={coverFile} currentUrl={coverUrl} onChange={setCoverFile} required label="Capa principal" /></div>
            <label><span>Gêneros</span><input name="genres" placeholder="Ação, Fantasia, Drama" defaultValue={initialAnime?.genres.join(", ")} /></label>
            <label><span>Produtores</span><input name="producers" placeholder="Aniplex, TOHO animation" defaultValue={initialAnime?.producers.join(", ")} /></label>
            <label><span>Demografia</span><input name="demography" placeholder="Shounen" defaultValue={initialAnime?.demography ?? ""} /></label>
            <label><span>Classificação</span><AdminSelect name="rating" defaultValue={normalizeAnimeRating(initialAnime?.rating)} options={ratingOptionsWithLegacyValue(initialAnime?.rating)} /></label>
            <label><span>Visibilidade</span><AdminSelect name="publicationStatus" defaultValue={initialAnime?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
            <div className={`${styles.wide} ${styles.originField}`}>
              <div className={styles.originHeading}>
                <strong>Origem / material original</strong>
                <p>Selecione uma obra já cadastrada. Deixe vazio quando o anime for uma obra original.</p>
              </div>
              <WorkPicker value={sourceWork} onChange={setSourceWork} />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>02</span><div><h2>Títulos alternativos</h2><p>Cadastre apenas as versões conhecidas.</p></div></div>
          {alternativeTitles.map((item, index) => (
            <div className={styles.row} key={index}>
              <AdminSelect value={item.type} onChange={(type) => setAlternativeTitles((items) => items.map((value, i) => i === index ? { ...value, type } : value))} options={[{ value: "JAPANESE", label: "Japonês" }, { value: "ROMAJI", label: "Romaji" }, { value: "ENGLISH", label: "Inglês" }, { value: "PORTUGUESE", label: "Português" }, { value: "LITERAL", label: "Literal" }, { value: "OTHER", label: "Outro" }]} />
              <input value={item.title} placeholder="Título alternativo" onChange={(event) => setAlternativeTitles((items) => items.map((value, i) => i === index ? { ...value, title: event.target.value } : value))} />
              <button type="button" className={styles.remove} onClick={() => setAlternativeTitles((items) => items.filter((_, i) => i !== index))}>Remover</button>
            </div>
          ))}
          <button type="button" className={styles.add} onClick={() => setAlternativeTitles((items) => [...items, { type: "ROMAJI", title: "" }])}>+ Adicionar título</button>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>03</span><div><h2>Sequência e relacionados</h2><p><strong>Sequenciais</strong> entram no tracker; outras obras aparecem apenas em Relacionados.</p></div></div>
          <div className={styles.relationshipActions}>
            <button type="button" onClick={() => setInstallments((items) => [...items, emptyInstallment()])}>+ Lançamento sequencial</button>
            <button type="button" onClick={() => setRelatedWorks((items) => [...items, emptyRelatedWork()])}>+ Vincular obra cadastrada</button>
          </div>

          {installments.map((item, index) => (
            <fieldset className={styles.nestedCard} key={`installment-${index}`}>
              <legend><span className={styles.sequenceBadge}>SEQUENCIAL</span> {index + 1}º lançamento</legend>
              <div className={styles.grid}>
                <label><span>Título *</span><input required value={item.title} onChange={(e) => updateInstallment(index, "title", e.target.value)} /></label>
                <label><span>Rótulo *</span><input required value={item.label} placeholder="1ª Temporada" onChange={(e) => updateInstallment(index, "label", e.target.value)} /></label>
                <label><span>Formato *</span><AdminSelect value={item.format} onChange={(format) => updateInstallment(index, "format", format)} options={[{ value: "TV", label: "TV" }, { value: "MOVIE", label: "Filme" }, { value: "OVA", label: "OVA" }, { value: "ONA", label: "ONA" }, { value: "SPECIAL", label: "Especial" }]} /></label>
                <label><span>Status *</span><AdminSelect value={item.status} onChange={(status) => updateInstallment(index, "status", status)} options={[{ value: "ANNOUNCED", label: "Anunciado" }, { value: "AIRING", label: "Em exibição" }, { value: "FINISHED", label: "Finalizado" }, { value: "CANCELLED", label: "Cancelado" }]} /></label>
                <label><span>Episódios *</span><input required min="1" step="1" inputMode="numeric" type="number" value={item.episodes} onChange={(e) => updateInstallment(index, "episodes", Number.isNaN(e.currentTarget.valueAsNumber) ? 1 : e.currentTarget.valueAsNumber)} /></label>
                <label><span>Duração por episódio (min)</span><input min="1" step="1" inputMode="numeric" type="number" value={item.durationMinutes ?? ""} placeholder="Ex.: 24" onChange={(e) => updateInstallment(index, "durationMinutes", Number.isNaN(e.currentTarget.valueAsNumber) ? null : e.currentTarget.valueAsNumber)} /></label>
                <label><span>Início</span><CustomDatePicker value={item.startDate} onChange={(value) => updateInstallment(index, "startDate", value)} /></label>
                <label><span>Término</span><CustomDatePicker value={item.endDate} min={item.startDate || undefined} onChange={(value) => updateInstallment(index, "endDate", value)} /></label>
                <label><span>Temporada de exibição</span><input value={item.broadcastSeason} placeholder="Outono 2026" onChange={(e) => updateInstallment(index, "broadcastSeason", e.target.value)} /></label>
                <label><span>Estúdio</span><StudioPicker value={item.studio} accessToken={accessToken ?? ""} onChange={(studio) => updateInstallment(index, "studio", studio)} />{!item.studio && item.studioName && <small className={styles.searchHint}>Vínculo antigo: {item.studioName}. Selecione o estúdio cadastrado para atualizar o vínculo.</small>}</label>
                <label className={styles.wide}><span>Sinopse do lançamento *</span><textarea required rows={4} value={item.synopsis} onChange={(e) => updateInstallment(index, "synopsis", e.target.value)} /></label>
                <div className={styles.wide}><ImagePicker file={item.coverFile} currentUrl={item.coverUrl} onChange={(file) => updateInstallment(index, "coverFile", file)} label="Capa específica do lançamento" /></div>
              </div>
              {installments.length > 1 && <button type="button" className={styles.remove} onClick={() => setInstallments((items) => items.filter((_, i) => i !== index))}>Remover lançamento</button>}
            </fieldset>
          ))}

          {relatedWorks.map((item, index) => (
            <fieldset className={styles.nestedCard} key={`related-${index}`}>
              <legend><span className={styles.relatedBadge}>VÍNCULO ENTRE OBRAS</span></legend>
              <div className={styles.grid}>
                <label><span>Tipo da relação *</span><AdminSelect value={item.relationType} onChange={(relationType) => updateRelated(index, "relationType", relationType)} options={[{ value: "ADAPTATION", label: "Adaptação" }, { value: "PARENT_STORY", label: "Obra principal" }, { value: "SIDE_STORY", label: "História paralela" }, { value: "SPIN_OFF", label: "Spin-off" }, { value: "ALTERNATIVE_VERSION", label: "Versão alternativa" }, { value: "CHARACTER", label: "Personagens" }, { value: "OTHER", label: "Outro" }]} /></label>
                <div className={styles.wide}><WorkPicker value={item.work} onChange={(work) => updateRelated(index, "work", work)} /></div>
              </div>
              <button type="button" className={styles.remove} onClick={() => setRelatedWorks((items) => items.filter((_, i) => i !== index))}>Remover relacionado</button>
            </fieldset>
          ))}
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>04</span><div><h2>Personagens &amp; Seiyuus</h2><p>Selecione um personagem da obra e o seiyuu responsável por sua voz.</p></div></div>
          {characterCredits.map((credit, index) => (
            <fieldset className={styles.nestedCard} key={`character-credit-${index}`}>
              <legend><span className={styles.staffBadge}>VÍNCULO DE VOZ</span></legend>
              <div className={styles.grid}>
                <div><CharacterPicker value={credit.character} accessToken={accessToken!} onChange={(character) => setCharacterCredits((credits) => credits.map((item, itemIndex) => itemIndex === index ? { ...item, character } : item))} /></div>
                <div><SeiyuuPicker value={credit.seiyuu} accessToken={accessToken!} onChange={(seiyuu) => setCharacterCredits((credits) => credits.map((item, itemIndex) => itemIndex === index ? { ...item, seiyuu } : item))} /></div>
              </div>
              <button type="button" className={styles.remove} onClick={() => setCharacterCredits((credits) => credits.length === 1 ? [emptyCharacterCredit()] : credits.filter((_, itemIndex) => itemIndex !== index))}>Limpar vínculo</button>
            </fieldset>
          ))}
          <button type="button" className={styles.add} onClick={() => setCharacterCredits((credits) => [...credits, emptyCharacterCredit()])}>+ Adicionar outro vínculo</button>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>05</span><div><h2>Canções</h2><p>Vincule openings, endings e insert songs a um cantor ou banda já cadastrados.</p></div></div>
          {songCredits.map((credit, index) => (
            <fieldset className={styles.nestedCard} key={`song-credit-${index}`}>
              <legend><span className={styles.staffBadge}>VÍNCULO MUSICAL</span></legend>
              <div className={styles.grid}>
                <div className={styles.wide}><MusicArtistPicker value={credit.artist} accessToken={accessToken!} onChange={(artist) => updateSongCredit(index, "artist", artist)} /></div>
                <label className={styles.wide}><span>Título da canção *</span><input value={credit.songTitle} placeholder="Ex.: Scramble" onChange={(event) => updateSongCredit(index, "songTitle", event.target.value)} /></label>
                <div className={styles.wide}>
                  {credit.featuredArtists.map((artist, featuredIndex) => <fieldset className={styles.nestedCard} key={`${artist?.id ?? "new"}-${featuredIndex}`}>
                    <legend>Participação {featuredIndex + 1} (feat.)</legend>
                    <MusicArtistPicker value={artist} accessToken={accessToken!} onChange={(nextArtist) => {
                      updateSongCredit(index, "featuredArtists", credit.featuredArtists.map((item, itemIndex) => itemIndex === featuredIndex ? nextArtist : item));
                    }} />
                    <button type="button" className={styles.remove} onClick={() => updateSongCredit(index, "featuredArtists", credit.featuredArtists.filter((_, itemIndex) => itemIndex !== featuredIndex))}>Remover participação</button>
                  </fieldset>)}
                  <button type="button" className={`${styles.add} ${styles.addParticipation}`} onClick={() => updateSongCredit(index, "featuredArtists", [...credit.featuredArtists, null])}>+ Adicionar participação</button>
                </div>
                <label><span>Uso *</span><AdminSelect value={credit.type} onChange={(type) => updateSongCredit(index, "type", type as SongCredit["type"])} options={[{ value: "OPENING", label: "Opening" }, { value: "ENDING", label: "Ending" }, { value: "INSERT", label: "Insert song" }]} /></label>
                <label><span>Número</span><input type="number" min="1" step="1" value={credit.sequence ?? ""} placeholder="Ex.: 1" onChange={(event) => updateSongCredit(index, "sequence", Number.isNaN(event.currentTarget.valueAsNumber) ? null : event.currentTarget.valueAsNumber)} /></label>
                <label className={styles.wide}><span>Episódios</span><input value={credit.episodeRange} placeholder="Ex.: 1–12" onChange={(event) => updateSongCredit(index, "episodeRange", event.target.value)} /><small>Informe somente o número ou intervalo; “Episódios” será acrescentado no card.</small></label>
              </div>
              <button type="button" className={styles.remove} onClick={() => setSongCredits((credits) => credits.length === 1 ? [emptySongCredit()] : credits.filter((_, itemIndex) => itemIndex !== index))}>Limpar canção</button>
            </fieldset>
          ))}
          <button type="button" className={styles.add} onClick={() => setSongCredits((credits) => [...credits, emptySongCredit()])}>+ Adicionar outra canção</button>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>06</span><div><h2>Staff</h2><p>Vincule pessoas já cadastradas e informe a função exercida nesta obra.</p></div></div>
          {staffCredits.map((credit, index) => <fieldset className={styles.nestedCard} key={`staff-${index}`}>
            <legend><span className={styles.staffBadge}>VÍNCULO DE STAFF</span></legend>
            <div className={styles.grid}>
              <label><span>Função na obra *</span><AdminSelect required value={staffRoleValue(credit.role, credit.contribution)} onChange={(roleValue) => {
                const selected = staffRoleOptions.find((option) => option.value === roleValue);
                setStaffCredits((credits) => credits.map((item, itemIndex) => itemIndex === index && selected ? { ...item, role: selected.role, contribution: selected.contribution } : item));
              }} options={[{ value: "", label: "Selecione a função" }, ...staffRoleOptions.map((option) => ({ value: option.value, label: `${option.role}${option.contribution ? ` • ${option.contribution}` : ""}` }))]} /></label>
              <div className={styles.wide}><PersonPicker value={credit.person} accessToken={accessToken!} subtitle={credit.role} onChange={(person) => setStaffCredits((credits) => credits.map((item, itemIndex) => itemIndex === index ? { ...item, person } : item))} /></div>
            </div>
            <button type="button" className={styles.remove} onClick={() => setStaffCredits((credits) => credits.filter((_, itemIndex) => itemIndex !== index))}>Remover vínculo</button>
          </fieldset>)}
          <button type="button" className={styles.add} onClick={() => setStaffCredits((credits) => [...credits, { role: "", contribution: null, person: null }])}>+ Vincular pessoa da staff</button>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>07</span><div><h2>Links da página</h2><p>Campos vazios não serão exibidos ao público.</p></div></div>
          <h3 className={styles.subheading}>Links relacionados</h3><div className={styles.linkGrid}>{externalLinks.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`external.${key}`} placeholder="https://…" defaultValue={initialAnime?.externalLinks[key] ?? ""} /></label>)}</div>
          <hr className={styles.linkDivider} />
          <h3 className={styles.subheading}>Assista em</h3><div className={styles.linkGrid}>{streamingLinks.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`streaming.${key}`} placeholder="https://…" defaultValue={initialAnime?.streamingLinks[key] ?? ""} /></label>)}</div>
        </section>

        {error && <p className={styles.error}>{error}</p>}
        {createdSlug && <p className={styles.success}>Anime {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/anime/${createdSlug}`}>Abrir página</Link></p>}
        <div className={styles.footerActions}><Link className={styles.cancelAction} href="/admin/anime">Cancelar</Link><button type="submit" disabled={saving}>{saving ? "Salvando…" : editSlug ? "Salvar alterações" : "Cadastrar anime"}</button></div>
      </form>
    </main>
  );
}

export default function NewAnimePage() {
  return <AnimeFormPage />;
}
