"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiBookOpen, FiEdit3, FiEye, FiPlus, FiSearch } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "../anime/page.module.css";

type Medium = "MANGA" | "LIGHT_NOVEL";
type Work = { id: string; title: string; slug: string; coverUrl: string; status: string; publicationStatus: "DRAFT" | "PUBLISHED"; chapters: number; volumes: number; updatedAt: string };

const configs = {
  MANGA: { field: "adminMangas", segment: "manga", title: "Mangas", singular: "manga" },
  LIGHT_NOVEL: { field: "adminLightNovels", segment: "light-novel", title: "Light novels", singular: "light novel" },
} as const;

export function PublicationWorkAdminPage({ medium }: { medium: Medium }) {
  const config = configs[medium];
  const { user, accessToken, loading: authLoading } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (queryValue: string) => {
    if (!accessToken) return;
    setLoading(true); setError("");
    try {
      const query = `query($query: String) { ${config.field}(query: $query) { id title slug coverUrl status publicationStatus chapters volumes updatedAt } }`;
      const data = await graphqlRequest<Record<string, Work[]>>(query, { query: queryValue || null }, accessToken);
      setWorks(data[config.field]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar as obras"); }
    finally { setLoading(false); }
  }, [accessToken, config.field]);
  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const frame = window.requestAnimationFrame(() => void load(activeQuery));
    return () => window.cancelAnimationFrame(frame);
  }, [accessToken, activeQuery, load, user?.role]);
  const totals = useMemo(() => ({ published: works.filter((item) => item.publicationStatus === "PUBLISHED").length, drafts: works.filter((item) => item.publicationStatus === "DRAFT").length }), [works]);
  const submit = (event: FormEvent) => { event.preventDefault(); setActiveQuery(search.trim()); };
  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiBookOpen /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS.</p><Link href={user ? "/" : "/login"}>Voltar</Link></main>;
  return <main className={styles.page}>
    <header className={styles.header}><div><span>Administração · Catálogo</span><h1>{config.title}</h1><p>Cadastre, revise e publique dados editoriais e vínculos.</p></div><div className={styles.headerActions}><Link className={styles.createButton} href={`/admin/${config.segment}/new`}><FiPlus />Cadastrar {config.singular}</Link></div></header>
    <section className={styles.metrics}><article><small>Obras encontradas</small><strong>{works.length}</strong></article><article><small>Publicadas</small><strong>{totals.published}</strong></article><article><small>Rascunhos</small><strong>{totals.drafts}</strong></article></section>
    <section className={styles.catalog}><div className={styles.toolbar}><div><h2>Gerenciar obras</h2><p>Abra uma obra para atualizar suas informações.</p></div><form className={styles.search} onSubmit={submit}><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${config.singular}`} /><button>Buscar</button></form></div>
      {error && <p className={styles.error}>{error}</p>}{loading ? <div className={styles.loadingList}>{[0, 1, 2].map((item) => <span key={item} />)}</div> : works.length === 0 ? <div className={styles.empty}><FiBookOpen /><h3>Nenhuma obra encontrada</h3><p>Comece cadastrando a primeira.</p></div> : <div className={styles.list}>{works.map((work) => <article className={styles.animeRow} key={work.id}><Image src={assetUrl(work.coverUrl) ?? work.coverUrl} alt={`Capa de ${work.title}`} width={58} height={82} unoptimized /><div className={styles.identity}><strong>{work.title}</strong><span>/{work.slug}</span><small>{work.chapters} capítulos · {work.volumes} volumes</small></div><span className={`${styles.status} ${work.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{work.publicationStatus === "PUBLISHED" ? "Publicado" : "Rascunho"}</span><time dateTime={work.updatedAt}>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(work.updatedAt))}</time><div className={styles.actions}><Link href={`/${config.segment}/${work.slug}`}><FiEye /><span>Visualizar</span></Link><Link className={styles.editButton} href={`/admin/${config.segment}/${work.slug}/edit`}><FiEdit3 /><span>Editar</span></Link></div></article>)}</div>}
    </section>
  </main>;
}
