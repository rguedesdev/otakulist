"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FiArrowLeft, FiDownloadCloud, FiSearch } from "react-icons/fi";

import { catalogSourceRequest, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "./page.module.css";

type Kind = "anime" | "character" | "seiyuu" | "mangaka" | "staff" | "studio" | "artist" | "publisher";
// Jikan returns different record shapes for each endpoint, so fields are normalized at the mapping boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JikanItem = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ImportDraft = Record<string, any>;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function jikan<T>(kind: string, accessToken: string, options: { id?: number; action?: string; q?: string; limit?: number } = {}): Promise<T> {
  const params = new URLSearchParams({ kind });
  if (options.id) params.set("id", String(options.id));
  if (options.action) params.set("action", options.action);
  if (options.q) params.set("q", options.q);
  if (options.limit) params.set("limit", String(options.limit));
  const body = await catalogSourceRequest<{ data: T }>(params, accessToken);
  return body.data as T;
}

function bestImage(item: JikanItem) {
  return item.images?.jpg?.image_url || item.images?.webp?.image_url || "";
}

function datePart(value?: { year?: number | null; month?: number | null; day?: number | null } | null) {
  if (!value?.year) return null;
  return `${value.year}-${String(value.month || 1).padStart(2, "0")}-${String(value.day || 1).padStart(2, "0")}`;
}

function installmentStatus(value: string) {
  if (value === "Currently Airing") return "AIRING";
  if (value === "Not yet aired") return "ANNOUNCED";
  if (value === "Discontinued") return "CANCELLED";
  return "FINISHED";
}

function jikanFormat(value?: string | null) {
  if (value === "Movie") return "MOVIE";
  if (value === "OVA") return "OVA";
  if (value === "ONA") return "ONA";
  if (value === "Special") return "SPECIAL";
  if (value === "Music") return "SPECIAL";
  return "TV";
}

function broadcastParts(value?: string | null) {
  if (!value) return { broadcastDay: null, broadcastTime: null };
  const match = value.match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)s?\s+at\s+(\d{1,2}:\d{2})(?:\s*\(JST\))?$/i);
  if (!match) return { broadcastDay: null, broadcastTime: null };
  return { broadcastDay: match[1].toUpperCase() as string, broadcastTime: match[2].padStart(5, "0") };
}

const broadcastDayOptions = [
  ["", "Não informada"], ["MONDAY", "Segunda-feira"], ["TUESDAY", "Terça-feira"],
  ["WEDNESDAY", "Quarta-feira"], ["THURSDAY", "Quinta-feira"], ["FRIDAY", "Sexta-feira"],
  ["SATURDAY", "Sábado"], ["SUNDAY", "Domingo"],
] as const;

function seasonName(season?: string | null, year?: number | null) {
  if (!season || !year) return null;
  const labels: Record<string, string> = { winter: "Inverno", spring: "Primavera", summer: "Verão", fall: "Outono" };
  return `${labels[season.toLowerCase()] || `${season[0].toUpperCase()}${season.slice(1)}`} ${year}`;
}

const genreTranslations: Record<string, string> = {
  action: "Ação",
  adventure: "Aventura",
  "avant garde": "Experimental",
  "award winning": "Premiado",
  "boys love": "BL",
  comedy: "Comédia",
  drama: "Drama",
  ecchi: "Ecchi",
  erotica: "Erótico",
  fantasy: "Fantasia",
  "girls love": "GL",
  gourmet: "Culinária",
  hentai: "Hentai",
  horror: "Terror",
  mystery: "Mistério",
  romance: "Romance",
  "sci-fi": "Sci-Fi",
  "slice of life": "Cotidiano",
  sports: "Esportes",
  supernatural: "Sobrenatural",
  suspense: "Suspense",
};

function translateGenre(value: string) {
  return genreTranslations[value.trim().toLowerCase()] || value;
}

function personJapaneseName(item: JikanItem) {
  const explicitName = typeof item.name_kanji === "string" ? item.name_kanji.trim() : "";
  if (explicitName) return explicitName;

  // Jikan's people records often expose the Japanese name in split fields,
  // while character records use name_kanji directly.
  const familyName = typeof item.family_name === "string" ? item.family_name.trim() : "";
  const givenName = typeof item.given_name === "string" ? item.given_name.trim() : "";
  const splitName = [familyName, givenName].filter(Boolean).join(" ");
  return /[\u3040-\u30ff\u3400-\u9fff]/u.test(splitName) ? splitName : null;
}

function producerTitle(item: JikanItem) {
  return item.title || item.name || item.titles?.find((title: JikanItem) => title.type === "Default")?.title || item.titles?.[0]?.title || "";
}

function studioDraft(item: JikanItem): ImportDraft {
  const titles = (item.titles || []).map((entry: JikanItem) => String(entry.title || ""));
  const nameKanji = titles.find((title: string) => /[\u3040-\u30ff\u3400-\u9fff]/u.test(title)) || null;
  const about = String(item.about || "");
  const officialSite = about.match(/(?:official\s*(?:site|website)|website)\s*:\s*(https?:\/\/[^\s]+)/i)?.[1] || null;
  const externalLinks = mapExternalLinks([item]);
  return {
    displayName: producerTitle(item), nameKanji, imageUrl: bestImage(item),
    description: about || null,
    foundation: item.established || null,
    headquarters: null,
    website: externalLinks.website || officialSite,
    externalLinks,
  };
}

function publisherDraft(item: JikanItem): ImportDraft {
  const about = String(item.about || "");
  const externalLinks = mapExternalLinks([item]);
  const officialSite = about.match(/(?:official\s*(?:site|website)|website)\s*:\s*(https?:\/\/[^\s]+)/i)?.[1];
  if (!externalLinks.website && officialSite) externalLinks.website = officialSite;
  return {
    displayName: producerTitle(item), imageUrl: bestImage(item),
    description: about || null, foundation: item.established || null,
    headquarters: null, externalLinks,
  };
}

function musicArtistDraft(item: JikanItem): ImportDraft {
  const externalLinks = mapExternalLinks([item]);
  const website = String(item.website_url || "").trim();
  if (!externalLinks.website && /^https?:\/\//i.test(website)) externalLinks.website = website;
  return {
    displayName: item.name || "", kind: "SOLO", nameKanji: personJapaneseName(item),
    imageUrl: bestImage(item), description: item.about || null,
    origin: null, dateOfBirth: item.birthday ? item.birthday.slice(0, 10) : null,
    activityPeriod: null, recordLabel: null, genres: [], discography: [],
    platformLinks: {}, externalLinks,
  };
}

function mapExternalLinks(anime: JikanItem[]) {
  const links: Record<string, string> = {};
  for (const entry of anime) {
    for (const link of entry.external || []) {
      const name = String(link.name || "").toLowerCase();
      const url = String(link.url || "");
      if (!/^https?:\/\//i.test(url)) continue;
      let key: string | null = null;
      if (/official\s*(site|website)|official website|official site|homepage/i.test(name)) key = "website";
      else if (/twitter|^x$|x\.com|twitter\.com/i.test(name) || /(?:twitter\.com|x\.com)/i.test(url)) key = "x";
      else if (/instagram/i.test(name) || /instagram\.com/i.test(url)) key = "instagram";
      else if (/pixiv/i.test(name) || /pixiv\.net/i.test(url)) key = "pixiv";
      else if (/youtube/i.test(name) || /youtube\.com|youtu\.be/i.test(url)) key = "youtube";
      else if (/tiktok/i.test(name) || /tiktok\.com/i.test(url)) key = "tiktok";
      if (key && !links[key]) links[key] = url;
    }
  }
  return links;
}

function mapStreamingLinks(anime: JikanItem[]) {
  const links: Record<string, string> = {};
  for (const entry of anime) {
    for (const link of entry.streaming || []) {
      const name = String(link.name || "").toLowerCase();
      const url = String(link.url || "");
      if (!/^https?:\/\//i.test(url)) continue;
      let key: string | null = null;
      if (/crunchyroll/i.test(name)) key = "crunchyroll";
      else if (/netflix/i.test(name)) key = "netflix";
      else if (/prime video|amazon prime/i.test(name)) key = "primeVideo";
      else if (/bilibili/i.test(name)) key = "bilibili";
      else if (/retrocrush/i.test(name)) key = "retrocrush";
      else if (/hulu/i.test(name)) key = "hulu";
      else if (/hidive/i.test(name)) key = "hidive";
      else if (/u-next|unext/i.test(name)) key = "uNext";
      else if (/abema/i.test(name)) key = "abemaTv";
      else if (/animation digital network|\badn\b/i.test(name)) key = "adn";
      else if (/muse asia/i.test(name)) key = "museAsia";
      else if (/tver/i.test(name)) key = "tver";
      else if (/iqiyi/i.test(name)) key = "iqiyi";
      else if (/tubi/i.test(name)) key = "tubi";
      else if (/d-anime|d anime store/i.test(name)) key = "dAnimeStore";
      if (key && !links[key]) links[key] = url;
    }
  }
  return links;
}

const externalLinkFields = [["website", "Site oficial"], ["x", "X / Twitter"], ["instagram", "Instagram"], ["pixiv", "Pixiv"], ["youtube", "YouTube"], ["tiktok", "TikTok"]] as const;
const streamingLinkFields = [["crunchyroll", "Crunchyroll"], ["netflix", "Netflix"], ["primeVideo", "Prime Video"], ["bilibili", "Bilibili"], ["retrocrush", "RetroCrush"], ["hulu", "Hulu"], ["hidive", "HIDIVE"], ["uNext", "U-NEXT"], ["abemaTv", "ABEMA TV"], ["adn", "ADN"], ["museAsia", "Muse Asia"], ["laftel", "Laftel"], ["tver", "TVer"], ["iqiyi", "iQIYI"], ["tubi", "Tubi"], ["dAnimeStore", "d Anime Store"]] as const;

function animeInstallment(item: JikanItem, index: number) {
  const broadcast = broadcastParts(item.broadcast?.string);
  return {
    include: true,
    sourceId: item.mal_id,
    order: index + 1,
    title: item.title_english || item.title || `Lançamento ${index + 1}`,
    label: `${index + 1}ª Temporada`,
    format: jikanFormat(item.type),
    synopsis: item.synopsis || item.title_english || item.title || "Sinopse não informada pela fonte.",
    coverUrl: bestImage(item) || null,
    episodes: item.episodes || 0,
    durationMinutes: Number.parseInt(item.duration || "", 10) || null,
    status: installmentStatus(item.status),
    startDate: datePart(item.aired?.from ? { year: Number(item.aired.from.slice(0, 4)), month: Number(item.aired.from.slice(5, 7)) || null, day: Number(item.aired.from.slice(8, 10)) || null } : item.aired?.prop?.from),
    endDate: datePart(item.aired?.to ? { year: Number(item.aired.to.slice(0, 4)), month: Number(item.aired.to.slice(5, 7)) || null, day: Number(item.aired.to.slice(8, 10)) || null } : item.aired?.prop?.to),
    broadcastSeason: seasonName(item.season, item.year),
    ...broadcast,
    studioName: item.studios?.[0]?.name || null,
  };
}

async function relatedAnimeIds(id: number, accessToken: string) {
  const relations = await jikan<JikanItem[]>("anime", accessToken, { id, action: "relations" });
  return relations.flatMap((relation) => ["Prequel", "Sequel"].includes(relation.relation)
    ? (relation.entry || []).filter((entry: JikanItem) => entry.type === "anime").map((entry: JikanItem) => entry.mal_id as number)
    : []);
}

async function animeDraft(seed: JikanItem, accessToken: string, onProgress: (message: string) => void): Promise<ImportDraft> {
  const seen = new Map<number, JikanItem>();
  const queue = [seed.mal_id as number];
  while (queue.length && seen.size < 12) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    onProgress(`Lendo ficha e temporadas relacionadas (${seen.size + 1} encontradas)`);
    const full = await jikan<JikanItem>("anime", accessToken, { id, action: "full" });
    seen.set(id, full);
    await pause(380);
    const relations = await relatedAnimeIds(id, accessToken);
    await pause(380);
    relations.forEach((relationId) => { if (!seen.has(relationId) && !queue.includes(relationId) && seen.size + queue.length < 12) queue.push(relationId); });
  }
  const entries = [...seen.values()].sort((a, b) => (a.aired?.from || "9999").localeCompare(b.aired?.from || "9999"));
  const root = entries[0] || seen.get(seed.mal_id) || seed;
  const ratingText = String(root.rating || "");
  const rating = ratingText.startsWith("PG-13") ? "PG13"
    : ratingText.startsWith("PG") ? "PG"
      : ratingText.startsWith("R -") ? "R17"
        : ratingText.startsWith("R+") ? "RPLUS"
          : ratingText.startsWith("Rx") ? "R18"
            : ratingText.startsWith("G") ? "G" : null;
  const titles = [
    ...(root.title_english ? [{ type: "ENGLISH", title: root.title_english }] : []),
    ...(root.title_japanese ? [{ type: "JAPANESE", title: root.title_japanese }] : []),
    ...(root.title ? [{ type: "ROMAJI", title: root.title }] : []),
    ...(root.title_synonyms || []).map((title: string) => ({ type: "SYNONYM", title })),
  ].filter((value, index, all) => value.title && all.findIndex((entry) => entry.title === value.title) === index).slice(0, 30);
  return {
    title: root.title_english || root.title || seed.title,
    synopsis: root.synopsis || "Sinopse não informada pela fonte.",
    coverUrl: bestImage(root),
    alternativeTitles: titles,
    genres: (root.genres || []).map((item: JikanItem) => translateGenre(item.name)),
    producers: (root.producers || []).map((item: JikanItem) => item.name),
    demography: root.demographics?.[0]?.name || null,
    rating,
    adultContent: Boolean(root.rating?.startsWith("Rx")),
    publicationStatus: "DRAFT",
    installments: entries.map(animeInstallment),
    externalLinks: mapExternalLinks(entries),
    streamingLinks: mapStreamingLinks(entries),
    characterCredits: [], songCredits: [], staffCredits: [], relatedWorks: [],
  };
}

function personDraft(item: JikanItem, kind: Kind): ImportDraft {
  const nameKanji = personJapaneseName(item);
  const dateOfBirth = item.birthday ? item.birthday.slice(0, 10) : null;
  if (kind === "character") return {
    nameRomaji: item.name || "", nameKanji,
    description: item.about || null, imageUrl: bestImage(item), dateOfBirth,
    hometown: null, publicationStatus: "DRAFT", voiceCredits: [],
  };
  const draft: ImportDraft = {
    displayName: item.name || "", nameKanji, imageUrl: bestImage(item),
    description: item.about || null, dateOfBirth,
    hometown: null, publicationStatus: "DRAFT", externalLinks: {},
  };
  if (kind === "seiyuu") draft.agency = item.about?.match(/Agency:\s*([^\n]+)/i)?.[1]?.trim() || null;
  if (kind === "mangaka" || kind === "staff") {
    draft.activityPeriod = null;
    const positions = kind === "mangaka" ? item.manga_positions : item.anime_staff_positions;
    draft.occupations = [...new Set((positions || []).map((position: JikanItem) => position.position).filter(Boolean))];
  }
  return draft;
}

const configs: Record<Kind, { label: string; endpoint: string; query: string; resultTitle(item: JikanItem): string; subtitle(item: JikanItem): string }> = {
  anime: { label: "Anime (inclui temporadas relacionadas)", endpoint: "/anime", query: "anime", resultTitle: (item) => item.title_english || item.title, subtitle: (item) => `${item.type || "Anime"} · ${item.year || item.aired?.prop?.from?.year || "ano desconhecido"} · ${item.episodes || "?"} episódios` },
  character: { label: "Personagem", endpoint: "/characters", query: "character", resultTitle: (item) => item.name, subtitle: (item) => `${item.name_kanji || "Personagem"} · ${item.favorites || 0} favoritos` },
  seiyuu: { label: "Seiyuu", endpoint: "/people", query: "person", resultTitle: (item) => item.name, subtitle: (item) => `${personJapaneseName(item) || "Dublador(a)"} · ${item.favorites || 0} favoritos` },
  mangaka: { label: "Mangaka", endpoint: "/people", query: "person", resultTitle: (item) => item.name, subtitle: (item) => `${personJapaneseName(item) || "Autor(a)"} · ${item.favorites || 0} favoritos` },
  staff: { label: "Profissional de staff", endpoint: "/people", query: "person", resultTitle: (item) => item.name, subtitle: (item) => `${personJapaneseName(item) || "Profissional da indústria"} · ${item.favorites || 0} favoritos` },
  studio: { label: "Estúdio", endpoint: "/producers", query: "producer", resultTitle: producerTitle, subtitle: (item) => `${item.count || 0} animes no catálogo · ${item.established || "fundação desconhecida"}` },
  artist: { label: "Artista musical", endpoint: "/people", query: "person", resultTitle: (item) => item.name, subtitle: (item) => `${personJapaneseName(item) || "Artista musical"} · ${item.favorites || 0} favoritos` },
  publisher: { label: "Editora", endpoint: "/producers", query: "producer", resultTitle: producerTitle, subtitle: (item) => `${item.count || 0} obras no catálogo · ${item.established || "fundação desconhecida"}` },
};

export default function CatalogImportPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [kind, setKind] = useState<Kind>("anime");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanItem[]>([]);
  const [draft, setDraft] = useState<ImportDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("");
  const [loadingDetail, setLoadingDetail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true); setLoadingTitle("Buscando no catálogo"); setLoadingDetail("Consultando o catálogo público MyAnimeList via Tenrai…"); setError(""); setDraft(null); setSavedSlug("");
    try {
      const data = await jikan<JikanItem[]>(configs[kind].endpoint.slice(1), accessToken!, { q: query.trim(), limit: 12 });
      setResults(data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível buscar na fonte."); }
    finally { setLoading(false); }
  };

  const choose = async (item: JikanItem) => {
    setResults([]); setLoading(true); setLoadingTitle("Preparando importação"); setLoadingDetail(kind === "anime" ? "Carregando ficha, relações e temporadas…" : "Carregando os dados completos do perfil…"); setError(""); setSavedSlug(""); setDraft(null);
    try {
      const endpoint = configs[kind].endpoint.slice(1);
      const detail = kind === "anime" ? item : await jikan<JikanItem>(endpoint, accessToken!, { id: item.mal_id, action: "full" });
      const next = kind === "anime" ? await animeDraft(detail, accessToken!, setLoadingDetail) : kind === "studio" ? studioDraft(detail) : kind === "publisher" ? publisherDraft(detail) : kind === "artist" ? musicArtistDraft(detail) : personDraft(detail, kind);
      setDraft(next);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível preparar a importação."); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!draft || !accessToken) return;
    const createField = { anime: "createAnime", character: "createCharacter", seiyuu: "createSeiyuu", mangaka: "createMangaka", staff: "createStaff", studio: "createStudio", artist: "createMusicArtist", publisher: "createPublisher" }[kind];
    const inputType = { anime: "CreateAnimeInput", character: "CreateCharacterInput", seiyuu: "CreateSeiyuuInput", mangaka: "CreateIndustryPersonInput", staff: "CreateIndustryPersonInput", studio: "CreateStudioInput", artist: "CreateMusicArtistInput", publisher: "CreatePublisherInput" }[kind];
    if (kind === "anime" && !draft.installments.some((item: ImportDraft) => item.include)) {
      setError("Mantenha ao menos um lançamento para criar o anime.");
      return;
    }
    setSaving(true); setError("");
    try {
      const input = kind === "anime"
        ? { ...draft, publicationStatus: "DRAFT", installments: draft.installments.filter((item: ImportDraft) => item.include).map((item: ImportDraft, index: number) => ({ ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== "include" && key !== "sourceId")), order: index + 1 })) }
        : { ...draft, publicationStatus: "DRAFT" };
      const data = await graphqlRequest<Record<string, { slug: string }>>(
        `mutation ImportCatalog($input: ${inputType}!) { ${createField}(input: $input) { slug } }`,
        { input }, accessToken,
      );
      setSavedSlug(data[createField].slug);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar os dados importados."); }
    finally { setSaving(false); }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateDraft = (field: string, value: any) => setDraft((current) => current ? { ...current, [field]: value } : current);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateInstallment = (index: number, field: string, value: any) => setDraft((current) => current ? { ...current, installments: current.installments.map((item: ImportDraft, itemIndex: number) => itemIndex === index ? { ...item, [field]: value } : item) } : current);
  const updateLink = (group: "externalLinks" | "streamingLinks", field: string, value: string) => setDraft((current) => current ? { ...current, [group]: { ...(current[group] || {}), [field]: value || undefined } } : current);
  const moveInstallment = (index: number, direction: -1 | 1) => setDraft((current) => {
    if (!current) return current;
    const installments = [...current.installments];
    const target = index + direction;
    if (target < 0 || target >= installments.length) return current;
    [installments[index], installments[target]] = [installments[target], installments[index]];
    return { ...current, installments };
  });

  if (authLoading) return <main className={styles.state}><span />Carregando…</main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.state}><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para importar dados.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></main>;

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/admin"><FiArrowLeft /> Administração</Link><span>Importador de catálogo · Tenrai / MyAnimeList</span><h1>Importe o começo do trabalho</h1><p>Busque uma obra ou pessoa, confira os dados encontrados e salve como rascunho para revisar no catálogo.</p></header>
    <section className={styles.panel}>
      <div className={styles.kindRow}>{(Object.keys(configs) as Kind[]).map((value) => <button type="button" key={value} className={kind === value ? styles.activeKind : ""} onClick={() => { setKind(value); setResults([]); setDraft(null); setError(""); setSavedSlug(""); }}>{configs[value].label}</button>)}</div>
      <form className={styles.search} onSubmit={search}><label htmlFor="import-query">Buscar em MyAnimeList</label><div><input id="import-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={kind === "anime" ? "Ex.: Dandadan" : "Nome em romaji ou inglês"} /><button disabled={loading}>{loading && loadingTitle === "Buscando no catálogo" ? <span className={styles.buttonSpinner} /> : <FiSearch />}{loading && loadingTitle === "Buscando no catálogo" ? "Buscando…" : "Buscar"}</button></div></form>
      {error && <p className={styles.error}>{error}</p>}
      {results.length > 0 && <div className={styles.results}><h2>Resultados</h2>{results.map((item) => <button type="button" key={item.mal_id} className={styles.result} onClick={() => void choose(item)}><span>{bestImage(item) && <Image src={bestImage(item)} alt="" width={48} height={64} unoptimized />}</span><span><strong>{configs[kind].resultTitle(item)}</strong><small>{configs[kind].subtitle(item)}</small></span><span>Selecionar →</span></button>)}</div>}
    </section>

    {draft && <section className={styles.panel}>
      <div className={styles.reviewHeader}><div><span>Revisão antes de salvar</span><h2>{kind === "anime" ? "Anime e lançamentos" : configs[kind].label}</h2><p>Os dados serão gravados como rascunho. Confira títulos, campos e imagem.</p></div>{draft.coverUrl || draft.imageUrl ? <Image src={draft.coverUrl || draft.imageUrl} alt="Imagem importada" width={72} height={96} unoptimized /> : null}</div>
      <div className={styles.fields}>
        {kind === "anime" ? <>
          <label>Título principal<input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} /></label>
          <label className={styles.wide}>Sinopse<textarea rows={5} value={draft.synopsis} onChange={(event) => updateDraft("synopsis", event.target.value)} /></label>
          <label className={styles.wide}>URL da capa<input value={draft.coverUrl} onChange={(event) => updateDraft("coverUrl", event.target.value)} /></label>
          <div className={styles.wide}><h3>{draft.installments.length} lançamentos relacionados</h3><p className={styles.muted}>Você pode mudar rótulos e ordem depois no editor de anime.</p></div>
          <details className={`${styles.wide} ${styles.linkEditor}`}><summary>Site oficial e redes sociais</summary><div className={styles.linkGrid}>{externalLinkFields.map(([key, label]) => <label key={key}>{label}<input type="url" value={draft.externalLinks?.[key] || ""} onChange={(event) => updateLink("externalLinks", key, event.target.value)} placeholder="https://…" /></label>)}</div></details>
          <details className={`${styles.wide} ${styles.linkEditor}`}><summary>Serviços de streaming</summary><div className={styles.linkGrid}>{streamingLinkFields.map(([key, label]) => <label key={key}>{label}<input type="url" value={draft.streamingLinks?.[key] || ""} onChange={(event) => updateLink("streamingLinks", key, event.target.value)} placeholder="https://…" /></label>)}</div></details>
          {draft.installments.map((installment: ImportDraft, index: number) => <fieldset className={`${styles.installment} ${!installment.include ? styles.excluded : ""}`} key={installment.sourceId}><legend>{index + 1} · {installment.format}</legend><div className={styles.installmentTools}><label className={styles.include}><input type="checkbox" checked={installment.include} onChange={(event) => updateInstallment(index, "include", event.target.checked)} /> Incluir este lançamento</label><div><button type="button" disabled={index === 0} onClick={() => moveInstallment(index, -1)}>↑ Subir</button><button type="button" disabled={index === draft.installments.length - 1} onClick={() => moveInstallment(index, 1)}>↓ Descer</button></div></div><label>Título<input value={installment.title} onChange={(event) => updateInstallment(index, "title", event.target.value)} /></label><label>Rótulo<input value={installment.label} onChange={(event) => updateInstallment(index, "label", event.target.value)} /></label><label>Episódios<input type="number" min="0" value={installment.episodes} onChange={(event) => updateInstallment(index, "episodes", Number(event.target.value))} /></label><label>Duração por episódio (min)<input type="number" min="1" step="1" inputMode="numeric" value={installment.durationMinutes ?? ""} placeholder="Ex.: 24" onChange={(event) => updateInstallment(index, "durationMinutes", Number.isNaN(event.currentTarget.valueAsNumber) ? null : event.currentTarget.valueAsNumber)} /></label>{installment.format === "TV" && <><label>Dia da transmissão (JST)<select value={installment.broadcastDay || ""} onChange={(event) => updateInstallment(index, "broadcastDay", event.target.value || null)}>{broadcastDayOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Horário da transmissão (JST)<input type="time" value={installment.broadcastTime || ""} onChange={(event) => updateInstallment(index, "broadcastTime", event.target.value || null)} /></label></>}<label>Estúdio<input value={installment.studioName || ""} onChange={(event) => updateInstallment(index, "studioName", event.target.value || null)} /></label></fieldset>)}
          <p className={styles.note}>As relações identificam possíveis continuações. Verifique se algum filme, OVA ou especial deve permanecer separado antes de salvar.</p>
        </> : kind === "artist" ? <>
          <label>Nome artístico<input value={draft.displayName} onChange={(event) => updateDraft("displayName", event.target.value)} /></label>
          <label>Tipo<CustomSelect value={draft.kind} onChange={(value) => updateDraft("kind", value)} options={[{ value: "SOLO", label: "Solo" }, { value: "BAND", label: "Banda" }]} /></label>
          <label>Nome em japonês<input value={draft.nameKanji || ""} onChange={(event) => updateDraft("nameKanji", event.target.value || null)} /></label>
          <label>{draft.kind === "BAND" ? "Data de criação" : "Data de nascimento"}<input value={draft.dateOfBirth || ""} onChange={(event) => updateDraft("dateOfBirth", event.target.value || null)} placeholder="AAAA-MM-DD" /></label>
          <label>Origem<input value={draft.origin || ""} onChange={(event) => updateDraft("origin", event.target.value || null)} /></label>
          <label>Período de atividade<input value={draft.activityPeriod || ""} onChange={(event) => updateDraft("activityPeriod", event.target.value || null)} placeholder="Ex.: 1990–presente" /></label>
          <label>Gravadora<input value={draft.recordLabel || ""} onChange={(event) => updateDraft("recordLabel", event.target.value || null)} /></label>
          <label>Gêneros<input value={(draft.genres || []).join(", ")} onChange={(event) => updateDraft("genres", event.target.value.split(",").map((part: string) => part.trim()).filter(Boolean))} placeholder="Separe por vírgulas" /></label>
          <label className={styles.wide}>URL da imagem<input value={draft.imageUrl} onChange={(event) => updateDraft("imageUrl", event.target.value)} /></label>
          <label className={styles.wide}>Biografia / descrição<textarea rows={6} value={draft.description || ""} onChange={(event) => updateDraft("description", event.target.value || null)} /></label>
          <details className={`${styles.wide} ${styles.linkEditor}`}><summary>Redes sociais</summary><div className={styles.linkGrid}>{externalLinkFields.map(([key, label]) => <label key={key}>{label}<input type="url" value={draft.externalLinks?.[key] || ""} onChange={(event) => updateLink("externalLinks", key, event.target.value)} placeholder="https://…" /></label>)}</div></details>
          <details className={`${styles.wide} ${styles.linkEditor}`}><summary>Ouça em</summary><div className={styles.linkGrid}>{[["spotify", "Spotify"], ["tidal", "Tidal"], ["deezer", "Deezer"], ["amazonMusic", "Amazon Music"]].map(([key, label]) => <label key={key}>{label}<input type="url" value={draft.platformLinks?.[key] || ""} onChange={(event) => updateDraft("platformLinks", { ...draft.platformLinks, [key]: event.target.value || undefined })} placeholder="https://…" /></label>)}</div></details>
          <p className={styles.note}>O MAL fornece dados básicos da pessoa, mas não uma discografia estruturada. Depois de salvar, adicione os lançamentos no editor do artista.</p>
        </> : kind === "publisher" ? <>
          <label>Nome<input value={draft.displayName} onChange={(event) => updateDraft("displayName", event.target.value)} /></label>
          <label>Fundação<input value={draft.foundation || ""} onChange={(event) => updateDraft("foundation", event.target.value || null)} /></label>
          <label>Sede<input value={draft.headquarters || ""} onChange={(event) => updateDraft("headquarters", event.target.value || null)} /></label>
          <label className={styles.wide}>URL da imagem<input value={draft.imageUrl} onChange={(event) => updateDraft("imageUrl", event.target.value)} /></label>
          <label className={styles.wide}>Descrição<textarea rows={6} value={draft.description || ""} onChange={(event) => updateDraft("description", event.target.value || null)} /></label>
          <details className={`${styles.wide} ${styles.linkEditor}`}><summary>Site e redes sociais</summary><div className={styles.linkGrid}>{externalLinkFields.map(([key, label]) => <label key={key}>{label}<input type="url" value={draft.externalLinks?.[key] || ""} onChange={(event) => updateLink("externalLinks", key, event.target.value)} placeholder="https://…" /></label>)}</div></details>
        </> : kind === "studio" ? <>
          <label>Nome<input value={draft.displayName} onChange={(event) => updateDraft("displayName", event.target.value)} /></label>
          <label>Nome em japonês<input value={draft.nameKanji || ""} onChange={(event) => updateDraft("nameKanji", event.target.value || null)} /></label>
          <label>Fundação<input value={draft.foundation || ""} onChange={(event) => updateDraft("foundation", event.target.value || null)} /></label>
          <label>Sede<input value={draft.headquarters || ""} onChange={(event) => updateDraft("headquarters", event.target.value || null)} /></label>
          <label className={styles.wide}>Site oficial<input type="url" value={draft.website || ""} onChange={(event) => updateDraft("website", event.target.value || null)} placeholder="https://…" /></label>
          <label className={styles.wide}>URL da imagem<input value={draft.imageUrl} onChange={(event) => updateDraft("imageUrl", event.target.value)} /></label>
          <label className={styles.wide}>Descrição<textarea rows={6} value={draft.description || ""} onChange={(event) => updateDraft("description", event.target.value || null)} /></label>
          <details className={`${styles.wide} ${styles.linkEditor}`}><summary>Redes sociais</summary><div className={styles.linkGrid}>{externalLinkFields.filter(([key]) => key !== "website").map(([key, label]) => <label key={key}>{label}<input type="url" value={draft.externalLinks?.[key] || ""} onChange={(event) => updateLink("externalLinks", key, event.target.value)} placeholder="https://…" /></label>)}</div></details>
        </> : <>
          <label>Nome<input value={kind === "character" ? draft.nameRomaji : draft.displayName} onChange={(event) => updateDraft(kind === "character" ? "nameRomaji" : "displayName", event.target.value)} /></label>
          <label>Nome em japonês<input value={draft.nameKanji || ""} onChange={(event) => updateDraft("nameKanji", event.target.value || null)} /></label>
          <label className={styles.wide}>URL da imagem<input value={draft.imageUrl} onChange={(event) => updateDraft("imageUrl", event.target.value)} /></label>
          <label className={styles.wide}>Biografia / descrição<textarea rows={6} value={draft.description || ""} onChange={(event) => updateDraft("description", event.target.value || null)} /></label>
          {kind === "seiyuu" && <label>Agência<input value={draft.agency || ""} onChange={(event) => updateDraft("agency", event.target.value || null)} /></label>}
          {(kind === "mangaka" || kind === "staff") && <label className={styles.wide}>Atuações / funções<input value={(draft.occupations || []).join(", ")} onChange={(event) => updateDraft("occupations", event.target.value.split(",").map((part: string) => part.trim()).filter(Boolean))} /></label>}
          {kind === "character" && <p className={styles.note}>Créditos de voz são importados depois de cadastrar os seiyuus correspondentes, para evitar vínculos quebrados.</p>}
        </>}
      </div>
      {savedSlug && <p className={styles.success}>Rascunho criado. <Link href={`/admin/${kind}/${savedSlug}/edit`}>Abrir no editor</Link></p>}
      <button className={styles.save} type="button" disabled={saving || !draft.coverUrl && kind === "anime" || !draft.imageUrl && kind !== "anime"} onClick={() => void save()}><FiDownloadCloud />{saving ? "Salvando…" : "Salvar como rascunho"}</button>
    </section>}
    {loading && <div className={styles.progressBackdrop} role="dialog" aria-modal="true" aria-labelledby="import-progress-title"><div className={styles.progressModal}><span className={styles.progressSpinner} /><span className={styles.progressEyebrow}>Importador OtakuList</span><h2 id="import-progress-title">{loadingTitle}</h2><p>{loadingDetail}</p><div className={styles.progressTrack} aria-label="Operação em andamento"><span /></div><small>Isso pode levar alguns segundos enquanto consultamos a fonte.</small></div></div>}
    <footer>Fonte: <a href="https://api.tenrai.org/documentation" target="_blank" rel="noreferrer">Tenrai API</a>, compatível com o formato Jikan v4 e baseada no catálogo público do MyAnimeList. O serviço está em beta; confira os dados e as condições de uso das imagens antes de publicar.</footer>
  </main>;
}
