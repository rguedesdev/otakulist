"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FiArrowLeft, FiImage, FiLock, FiUploadCloud, FiUser, FiX } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { catalogMediumLabel, catalogStatusLabel } from "@/shared/catalog/labels";
import { normalizeStaffCredit, publicationStaffRoleOptions } from "@/shared/catalog/staff-roles";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker/page";
import { CustomSelect as AdminSelect } from "@/shared/components/CustomSelect/page";
import styles from "../anime/new/page.module.css";
import { CancelLink } from "@/shared/components/AdminFormActions/CancelLink";
import { SaveButton } from "@/shared/components/AdminFormActions/SaveButton";
import { reorderItems, SortableItem } from "@/shared/components/SortableItem/SortableItem";

type Medium = "MANGA" | "LIGHT_NOVEL";
type AlternativeTitle = { type: string; title: string };
type PickedEntity = { id: string; title: string; subtitle: string; imageUrl: string | null; raw?: Record<string, unknown> };
type StaffCredit = { person: PickedEntity | null; role: string; contribution: string | null };
type RelatedWork = { work: PickedEntity | null; relationType: string | null };
type RawSearchItem = { id: string; title?: string; nameRomaji?: string; displayName?: string; nameKanji?: string | null; imageUrl?: string | null; coverUrl?: string | null; medium?: string; status?: string };
type WorkData = {
  title: string; synopsis: string; coverUrl: string; alternativeTitles: AlternativeTitle[];
  status: string; publicationStatus: string; adultContent: boolean; startDate: string | null; endDate: string | null;
  publisher: string | null; publisherEntity: { id: string; displayName: string; slug: string; imageUrl: string } | null; genres: string[]; chapters: number; volumes: number;
  magazine?: string | null; magazineEntity?: { id: string; title: string; slug: string; imageUrl: string } | null; demography?: string | null;
  source?: string | null;
  characters: Array<{ id: string; nameRomaji: string; nameKanji: string | null; imageUrl: string }>;
  staffCredits: Array<{ role: string; contribution: string | null; person: { id: string; displayName: string; nameKanji: string | null; imageUrl: string | null } }>;
  relatedWorks: Array<{ id: string; relationType: string; title: string; medium: string; status: string; coverUrl: string | null }>;
  externalLinks: Record<string, string | null>; storeLinks: Record<string, string | null>;
};

const externalLinks = [["website", "Site oficial"], ["x", "X/Twitter"], ["instagram", "Instagram"], ["pixiv", "Pixiv"], ["youtube", "YouTube"], ["tiktok", "TikTok"]] as const;
const storeLinks = [["amazon", "Amazon"], ["cdJapan", "CD Japan"], ["mercadoLivre", "Mercado Livre"], ["rakuten", "Rakuten"], ["shopee", "Shopee"], ["ebay", "eBay"], ["otakuyasan", "Otakuyasan"], ["hmv", "HMV"], ["honto", "Honto"], ["toranoana", "Toranoana"], ["animate", "Animate"]] as const;
const statusOptions = [{ value: "ANNOUNCED", label: "Anunciado" }, { value: "PUBLISHING", label: "Em publicação" }, { value: "HIATUS", label: "Em hiato" }, { value: "FINISHED", label: "Finalizado" }, { value: "CANCELLED", label: "Cancelado" }];
const titleTypeOptions = [{ value: "JAPANESE", label: "Japonês" }, { value: "ROMAJI", label: "Romaji" }, { value: "ENGLISH", label: "Inglês" }, { value: "PORTUGUESE", label: "Português" }, { value: "LITERAL", label: "Literal" }, { value: "SYNONYM", label: "Sinônimo" }, { value: "OTHER", label: "Outro" }];
const relationOptions = [{ value: "", label: "Sem tipo específico" }, { value: "SOURCE_MATERIAL", label: "Origem / material original" }, { value: "ADAPTATION", label: "Adaptação" }, { value: "REMAKE", label: "Remake" }, { value: "SPIN_OFF", label: "Spin-off" }];
function creditLabel(credit: { role: string; contribution: string | null }) {
  return `${credit.role}${credit.contribution ? ` • ${credit.contribution}` : ""}`;
}

const queries = {
  MANGA: {
    field: "manga", create: "createManga", update: "updateManga", publicPath: "manga", label: "manga",
    document: `id title slug synopsis coverUrl alternativeTitles { type title } status publicationStatus adultContent startDate endDate magazine magazineEntity { id title slug imageUrl } publisher publisherEntity { id displayName slug imageUrl } demography genres chapters volumes characters { id nameRomaji nameKanji imageUrl } staffCredits { role contribution person { id displayName nameKanji imageUrl } } relatedWorks { id relationType title medium status coverUrl } externalLinks { website x instagram pixiv youtube tiktok } storeLinks { amazon cdJapan mercadoLivre rakuten shopee ebay otakuyasan hmv honto toranoana animate }`,
  },
  LIGHT_NOVEL: {
    field: "lightNovel", create: "createLightNovel", update: "updateLightNovel", publicPath: "light-novel", label: "light novel",
    document: `id title slug synopsis coverUrl alternativeTitles { type title } status publicationStatus adultContent startDate endDate publisher publisherEntity { id displayName slug imageUrl } source genres chapters volumes characters { id nameRomaji nameKanji imageUrl } staffCredits { role contribution person { id displayName nameKanji imageUrl } } relatedWorks { id relationType title medium status coverUrl } externalLinks { website x instagram pixiv youtube tiktok } storeLinks { amazon cdJapan mercadoLivre rakuten shopee ebay otakuyasan hmv honto toranoana animate }`,
  },
} as const;

function optionalObject(form: FormData, prefix: string, fields: readonly (readonly [string, string])[]) {
  return Object.fromEntries(fields.map(([key]) => [key, String(form.get(`${prefix}.${key}`) ?? "").trim()]).filter(([, value]) => value));
}

function EntityPicker({ kind, value, accessToken, onChange }: { kind: "character" | "magazine" | "person" | "publisher" | "work"; value: PickedEntity | null; accessToken: string; onChange(value: PickedEntity | null): void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PickedEntity[]>([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (value || search.trim().length < 2) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setSearching(true);
      const query = kind === "character"
        ? `query($query: String) { adminCharacters(query: $query) { id nameRomaji nameKanji imageUrl } }`
        : kind === "person"
          ? `query($query: String!) { searchPeople(query: $query) { id displayName nameKanji imageUrl roles } }`
          : kind === "publisher"
            ? `query($query: String!) { searchPublishers(query: $query) { id displayName slug imageUrl } }`
            : kind === "magazine"
              ? `query($query: String!) { searchMagazines(query: $query) { id title slug imageUrl } }`
              : `query($query: String!) { searchWorks(query: $query, includeAdult: true) { id title medium coverUrl status } }`;
      const field = kind === "character" ? "adminCharacters" : kind === "person" ? "searchPeople" : kind === "publisher" ? "searchPublishers" : kind === "magazine" ? "searchMagazines" : "searchWorks";
      void graphqlRequest<Record<string, RawSearchItem[]>>(query, { query: search.trim() }, accessToken).then((data) => {
        if (!active) return;
        setResults((data[field] ?? []).map((item) => kind === "character"
          ? { id: item.id, title: item.nameRomaji ?? "Personagem", subtitle: item.nameKanji || "Personagem", imageUrl: item.imageUrl ?? null }
          : kind === "person"
            ? { id: item.id, title: item.displayName ?? "Pessoa", subtitle: item.nameKanji || "Pessoa da indústria", imageUrl: item.imageUrl ?? null }
            : kind === "publisher"
              ? { id: item.id, title: item.displayName ?? "Editora", subtitle: "Editora", imageUrl: item.imageUrl ?? null }
              : kind === "magazine"
                ? { id: item.id, title: item.title ?? "Magazine", subtitle: "Magazine", imageUrl: item.imageUrl ?? null }
                : { id: item.id, title: item.title ?? "Obra", subtitle: `${catalogMediumLabel(item.medium ?? "")} · ${catalogStatusLabel(item.status)}`, imageUrl: item.coverUrl ?? null }));
      }).catch(() => { if (active) setResults([]); }).finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [accessToken, kind, search, value]);

  if (kind === "publisher" || kind === "magazine") {
    const entityLabel = kind === "publisher" ? "editora" : "magazine";
    if (value) return <div className={styles.selectedStudioInput}>
      {value.imageUrl && <Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" width={28} height={28} unoptimized />}
      <strong>{value.title}</strong>
      <button type="button" aria-label={`Remover ${entityLabel}`} onClick={() => { onChange(null); setSearch(""); }}><FiX /></button>
    </div>;
    return <div className={styles.studioPicker}>
      <input value={search} placeholder={`Buscar ${entityLabel} cadastrada`} onChange={(event) => setSearch(event.target.value)} />
      {searching && <small className={styles.searchHint}>Buscando {entityLabel}s…</small>}
      {!searching && search.trim().length >= 2 && results.length === 0 && <small className={styles.searchHint}>Nenhuma {entityLabel} encontrada. Cadastre-a primeiro.</small>}
      {results.length > 0 && <div className={styles.studioResults}>{results.map((item) => <button type="button" key={item.id} onClick={() => onChange(item)}>
        {item.imageUrl && <Image src={assetUrl(item.imageUrl) ?? item.imageUrl} alt="" width={32} height={32} unoptimized />}
        <strong>{item.title}</strong>
      </button>)}</div>}
    </div>;
  }

  if (value) return <div className={styles.selectedWork}>
    {value.imageUrl ? <span className={styles.pickerImageLarge}><Image src={assetUrl(value.imageUrl) ?? value.imageUrl} alt="" fill sizes="48px" unoptimized /></span> : <span className={styles.personFallback}><FiUser /></span>}
    <span><strong>{value.title}</strong><small>{value.subtitle}</small></span>
    <button type="button" onClick={() => { onChange(null); setSearch(""); }}>Trocar</button>
  </div>;
  return <div className={styles.workPicker}>
    <label><span>{kind === "character" ? "Buscar personagem" : kind === "person" ? "Buscar pessoa" : "Buscar obra relacionada"}</span><input value={search} placeholder="Digite ao menos 2 caracteres" onChange={(event) => setSearch(event.target.value)} /></label>
    {searching && <small className={styles.searchHint}>Buscando…</small>}
    {!searching && search.trim().length >= 2 && results.length === 0 && <small className={styles.searchHint}>Nenhum resultado encontrado.</small>}
    {results.length > 0 && <div className={styles.workResults}>{results.map((item) => <button type="button" key={item.id} onClick={() => onChange(item)}>
      {item.imageUrl ? <span className={styles.pickerImageSmall}><Image src={assetUrl(item.imageUrl) ?? item.imageUrl} alt="" fill sizes="38px" unoptimized /></span> : <span className={styles.personFallback}><FiUser /></span>}
      <span><strong>{item.title}</strong><small>{item.subtitle}</small></span>
    </button>)}</div>}
  </div>;
}

export function PublicationWorkFormPage({ medium, editSlug }: { medium: Medium; editSlug?: string }) {
  const config = queries[medium];
  const staffOptions: ReadonlyArray<{ value: string; role: string; contribution: string | null }> = publicationStaffRoleOptions[medium];
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<WorkData | null>(null);
  const [loading, setLoading] = useState(Boolean(editSlug));
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [alternativeTitles, setAlternativeTitles] = useState<AlternativeTitle[]>([]);
  const [characters, setCharacters] = useState<Array<PickedEntity | null>>([]);
  const [staff, setStaff] = useState<StaffCredit[]>([]);
  const [related, setRelated] = useState<RelatedWork[]>([]);
  const [publisher, setPublisher] = useState<PickedEntity | null>(null);
  const [magazine, setMagazine] = useState<PickedEntity | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const localCoverPreview = useMemo(() => coverFile ? URL.createObjectURL(coverFile) : null, [coverFile]);
  const coverPreview = localCoverPreview ?? assetUrl(coverUrl);

  useEffect(() => () => { if (localCoverPreview) URL.revokeObjectURL(localCoverPreview); }, [localCoverPreview]);

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    const query = `query($slug: String!) { ${config.field}(slug: $slug, includeAdult: true) { ${config.document} } }`;
    void graphqlRequest<Record<string, WorkData | null>>(query, { slug: editSlug }, accessToken).then((data) => {
      if (!active) return;
      const work = data[config.field];
      if (!work) { setLoadError(`${config.label} não encontrado.`); return; }
      setInitial(work); setTitle(work.title); setCoverUrl(work.coverUrl); setAlternativeTitles(work.alternativeTitles);
      setPublisher(work.publisherEntity ? { id: work.publisherEntity.id, title: work.publisherEntity.displayName, subtitle: "Editora", imageUrl: work.publisherEntity.imageUrl } : null);
      setMagazine(work.magazineEntity ? { id: work.magazineEntity.id, title: work.magazineEntity.title, subtitle: "Magazine", imageUrl: work.magazineEntity.imageUrl } : null);
      setCharacters(work.characters.map((item) => ({ id: item.id, title: item.nameRomaji, subtitle: item.nameKanji || "Personagem", imageUrl: item.imageUrl })));
      setStaff(work.staffCredits.map((item) => {
        const normalized = normalizeStaffCredit(item);
        return { role: normalized.role, contribution: normalized.contribution ?? null, person: { id: item.person.id, title: item.person.displayName, subtitle: creditLabel({ role: normalized.role, contribution: normalized.contribution ?? null }), imageUrl: item.person.imageUrl } };
      }));
      setRelated(work.relatedWorks.map((item) => ({ relationType: item.relationType === "SOURCE_MATERIAL" || item.relationType === "ADAPTATION" || item.relationType === "REMAKE" || item.relationType === "SPIN_OFF" ? item.relationType : null, work: { id: item.id, title: item.title, subtitle: `${catalogMediumLabel(item.medium)} · ${catalogStatusLabel(item.status)}`, imageUrl: item.coverUrl } })));
    }).catch((caught) => { if (active) setLoadError(caught instanceof Error ? caught.message : "Não foi possível carregar a obra"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken, config, editSlug, user?.role]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return setError("Sua sessão expirou. Entre novamente.");
    if (!coverFile && !coverUrl) return setError("Selecione a capa da obra");
    if (characters.some((item) => !item) || staff.some((item) => !item.person || !item.role) || related.some((item) => !item.work)) return setError("Preencha ou remova todos os vínculos incompletos");
    setSaving(true); setError(""); setSavedSlug("");
    const form = new FormData(event.currentTarget);
    try {
      const uploadedCover = coverFile ? await uploadCatalogImage(coverFile, accessToken) : coverUrl!;
      const common = {
        title: title.trim(), synopsis: String(form.get("synopsis") ?? "").trim(), coverUrl: uploadedCover,
        alternativeTitles: alternativeTitles.filter((item) => item.title.trim()).map((item) => ({ ...item, title: item.title.trim() })),
        status: String(form.get("status")), publicationStatus: String(form.get("publicationStatus")), adultContent: form.get("adultContent") === "on",
        startDate: String(form.get("startDate") ?? "") || null, endDate: String(form.get("endDate") ?? "") || null,
        publisherId: publisher?.id ?? null,
        publisher: publisher ? null : initial?.publisher ?? null,
        genres: String(form.get("genres") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
        chapters: Number(form.get("chapters")), volumes: Number(form.get("volumes")),
        characterIds: characters.map((item) => item!.id), staffCredits: staff.map((item) => ({ personId: item.person!.id, role: item.role, contribution: item.contribution })),
        relatedWorks: related.map((item) => ({ workId: item.work!.id, relationType: item.relationType })),
        externalLinks: optionalObject(form, "external", externalLinks), storeLinks: optionalObject(form, "store", storeLinks),
      };
      const input = medium === "MANGA"
        ? { ...common, magazineId: magazine?.id ?? null, magazine: magazine ? null : initial?.magazine ?? null, demography: String(form.get("demography") ?? "").trim() || null }
        : { ...common, source: String(form.get("source") ?? "").trim() || null };
      const mutation = editSlug
        ? `mutation($slug: String!, $input: Create${medium === "MANGA" ? "Manga" : "LightNovel"}Input!) { ${config.update}(slug: $slug, input: $input) { slug } }`
        : `mutation($input: Create${medium === "MANGA" ? "Manga" : "LightNovel"}Input!) { ${config.create}(input: $input) { slug } }`;
      const data = await graphqlRequest<Record<string, { slug: string }>>(mutation, { ...(editSlug ? { slug: editSlug } : {}), input }, accessToken);
      setSavedSlug(data[editSlug ? config.update : config.create].slug);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar a obra"); }
    finally { setSaving(false); }
  }

  if (authLoading || loading) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS" || !accessToken) return <main className={styles.accessPage}><section className={styles.accessCard}><FiLock /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>Voltar</Link></section></main>;
  if (loadError) return <main className={styles.accessPage}><section className={styles.accessCard}><FiLock /><h1>Não foi possível editar</h1><p>{loadError}</p><Link className={styles.accessAction} href={`/admin/${config.publicPath}`}><FiArrowLeft />Voltar</Link></section></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><span>Administração · {config.label}</span><h1>{editSlug ? "Editar obra" : `Cadastrar ${config.label}`}</h1></div><p>Preencha os dados editoriais e os vínculos próprios desta mídia.</p></header>
    <form className={styles.form} autoComplete="off" onSubmit={submit}>
      <section className={styles.card}><div className={styles.sectionTitle}><span>01</span><div><h2>Identidade da obra</h2><p>Dados principais usados na página e no catálogo.</p></div></div><div className={styles.grid}>
        <label className={styles.wide}><span>Título principal *</span><input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className={styles.wide}><span>Sinopse *</span><textarea required name="synopsis" rows={6} defaultValue={initial?.synopsis} /></label>
        <div className={`${styles.wide} ${styles.imagePicker}`}><div className={styles.coverPreview}>{coverPreview ? <Image src={coverPreview} alt="Prévia da capa" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div><div className={styles.imagePickerContent}><strong>Capa principal *</strong><p>JPEG, PNG ou WebP na proporção editorial da obra.</p><label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} /></label>{coverFile && <button type="button" className={styles.clearImage} onClick={() => { setCoverFile(null); if (fileInput.current) fileInput.current.value = ""; }}><FiX />Remover</button>}</div></div>
        <label><span>Gêneros</span><input name="genres" placeholder="Fantasia, Drama" defaultValue={initial?.genres.join(", ")} /></label><label><span>Editora</span><EntityPicker kind="publisher" value={publisher} accessToken={accessToken} onChange={setPublisher} />{!publisher && initial?.publisher && <small className={styles.searchHint}>Vínculo antigo: {initial.publisher}. Selecione a editora cadastrada para atualizar o vínculo.</small>}</label>
      </div></section>
      <section className={styles.card}><div className={styles.sectionTitle}><span>02</span><div><h2>Publicação</h2><p>Estado e informações editoriais da série.</p></div></div><div className={styles.grid}>
        <label><span>Status *</span><AdminSelect name="status" defaultValue={initial?.status ?? "ANNOUNCED"} options={statusOptions} /></label><label><span>Visibilidade</span><AdminSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
        <label><span>Conteúdo +18</span><div className={styles.adultControl}><span><strong>Obra adulta</strong><small>Ocultar para usuários que não ativaram conteúdo adulto.</small></span><input type="checkbox" name="adultContent" defaultChecked={initial?.adultContent ?? false} /></div></label>
        <label><span>Início</span><CustomDatePicker name="startDate" defaultValue={initial?.startDate ?? ""} /></label><label><span>Término</span><CustomDatePicker name="endDate" defaultValue={initial?.endDate ?? ""} min={initial?.startDate ?? undefined} /></label>
        <label><span>Capítulos</span><input required type="number" min="0" step="1" name="chapters" defaultValue={initial?.chapters ?? 0} /></label><label><span>Volumes</span><input required type="number" min="0" step="1" name="volumes" defaultValue={initial?.volumes ?? 0} /></label>
        {medium === "MANGA" ? <><label><span>Magazine</span><EntityPicker kind="magazine" value={magazine} accessToken={accessToken} onChange={setMagazine} />{!magazine && initial?.magazine && <small className={styles.searchHint}>Vínculo antigo: {initial.magazine}. Selecione a magazine cadastrada para atualizar o vínculo.</small>}</label><label><span>Demografia</span><input name="demography" defaultValue={initial?.demography ?? ""} /></label></> : <label><span>Origem</span><input name="source" placeholder="Light novel, web novel…" defaultValue={initial?.source ?? ""} /></label>}
      </div></section>
      <section className={styles.card}><div className={styles.sectionTitle}><span>03</span><div><h2>Títulos alternativos</h2><p>Versões conhecidas do título.</p></div></div>{alternativeTitles.map((item, index) => <SortableItem key={`alternative-${index}`} listId="publication-alternatives" index={index} count={alternativeTitles.length} onMove={(from, to) => setAlternativeTitles((items) => reorderItems(items, from, to))}><div className={styles.row}><AdminSelect value={item.type} onChange={(type) => setAlternativeTitles((items) => items.map((current, i) => i === index ? { ...current, type } : current))} options={titleTypeOptions} /><input value={item.title} onChange={(event) => setAlternativeTitles((items) => items.map((current, i) => i === index ? { ...current, title: event.target.value } : current))} /><button type="button" className={styles.remove} onClick={() => setAlternativeTitles((items) => items.filter((_, i) => i !== index))}>Remover</button></div></SortableItem>)}<button type="button" className={styles.add} onClick={() => setAlternativeTitles((items) => [...items, { type: "ROMAJI", title: "" }])}>+ Adicionar título</button></section>
      <section className={styles.card}><div className={styles.sectionTitle}><span>04</span><div><h2>Personagens</h2><p>Vincule personagens cadastrados, sem vínculo de voz.</p></div></div>{characters.map((character, index) => <SortableItem key={`character-${index}`} listId="publication-characters" index={index} count={characters.length} onMove={(from, to) => setCharacters((items) => reorderItems(items, from, to))}><fieldset className={styles.nestedCard}><EntityPicker kind="character" value={character} accessToken={accessToken} onChange={(next) => setCharacters((items) => items.map((item, i) => i === index ? next : item))} /><button type="button" className={styles.remove} onClick={() => setCharacters((items) => items.filter((_, i) => i !== index))}>Remover</button></fieldset></SortableItem>)}<button type="button" className={styles.add} onClick={() => setCharacters((items) => [...items, null])}>+ Vincular personagem</button></section>
      <section className={styles.card}><div className={styles.sectionTitle}><span>05</span><div><h2>Autores &amp; staff</h2><p>Informe a função exercida especificamente nesta obra.</p></div></div>{staff.map((credit, index) => {
        const selectedValue = staffOptions.find((option) => option.role === credit.role && option.contribution === credit.contribution)?.value ?? (credit.role ? `LEGACY_${index}` : "");
        return <SortableItem key={`staff-${index}`} listId="publication-staff" index={index} count={staff.length} onMove={(from, to) => setStaff((items) => reorderItems(items, from, to))}><fieldset className={styles.nestedCard}><div className={styles.grid}><label><span>Função *</span><AdminSelect required value={selectedValue} onChange={(value) => {
          const selected = staffOptions.find((option) => option.value === value);
          if (!selected) return;
          setStaff((items) => items.map((item, i) => i === index ? { ...item, role: selected.role, contribution: selected.contribution, person: item.person ? { ...item.person, subtitle: creditLabel(selected) } : null } : item));
        }} options={[{ value: "", label: "Selecione a função" }, ...(selectedValue.startsWith("LEGACY_") ? [{ value: selectedValue, label: creditLabel(credit) }] : []), ...staffOptions.map((option) => ({ value: option.value, label: creditLabel(option) }))]} /></label><div className={styles.wide}><EntityPicker kind="person" value={credit.person ? { ...credit.person, subtitle: credit.role ? creditLabel(credit) : "Função não selecionada" } : null} accessToken={accessToken} onChange={(person) => setStaff((items) => items.map((item, i) => i === index ? { ...item, person } : item))} /></div></div><button type="button" className={styles.remove} onClick={() => setStaff((items) => items.filter((_, i) => i !== index))}>Remover vínculo</button></fieldset></SortableItem>;
      })}<button type="button" className={styles.add} onClick={() => setStaff((items) => [...items, { person: null, role: "", contribution: null }])}>+ Vincular autor ou staff</button></section>
      <section className={styles.card}><div className={styles.sectionTitle}><span>06</span><div><h2>Obras relacionadas</h2><p>O tipo de vínculo é opcional; a mídia já identifica a obra.</p></div></div>{related.map((item, index) => <SortableItem key={`related-${index}`} listId="publication-related" index={index} count={related.length} onMove={(from, to) => setRelated((items) => reorderItems(items, from, to))}><fieldset className={styles.nestedCard}><div className={styles.grid}><label><span>Tipo da relação</span><AdminSelect value={item.relationType ?? ""} onChange={(relationType) => setRelated((items) => items.map((current, i) => i === index ? { ...current, relationType: relationType || null } : current))} options={relationOptions} /></label><div className={styles.wide}><EntityPicker kind="work" value={item.work} accessToken={accessToken} onChange={(work) => setRelated((items) => items.map((current, i) => i === index ? { ...current, work } : current))} /></div></div><button type="button" className={styles.remove} onClick={() => setRelated((items) => items.filter((_, i) => i !== index))}>Remover relacionado</button></fieldset></SortableItem>)}<button type="button" className={styles.add} onClick={() => setRelated((items) => [...items, { work: null, relationType: null }])}>+ Vincular obra</button></section>
      <section className={styles.card}><div className={styles.sectionTitle}><span>07</span><div><h2>Links da página</h2><p>Campos vazios não serão exibidos ao público.</p></div></div><h3 className={styles.subheading}>Links relacionados</h3><div className={styles.linkGrid}>{externalLinks.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`external.${key}`} defaultValue={initial?.externalLinks[key] ?? ""} /></label>)}</div><hr className={styles.linkDivider} /><h3 className={styles.subheading}>Compre em</h3><div className={styles.linkGrid}>{storeLinks.map(([key, label]) => <label key={key}><span>{label}</span><input type="url" name={`store.${key}`} defaultValue={initial?.storeLinks[key] ?? ""} /></label>)}</div></section>
      {error && <p className={styles.error}>{error}</p>}{savedSlug && <p className={styles.success}>Obra salva. <Link href={`/${config.publicPath}/${savedSlug}`}>Abrir página</Link></p>}<div className={styles.footerActions}><CancelLink className={styles.cancelAction} href={`/admin/${config.publicPath}`}>Cancelar</CancelLink><SaveButton disabled={saving}>Salvar obra</SaveButton></div>
    </form>
  </main>;
}
