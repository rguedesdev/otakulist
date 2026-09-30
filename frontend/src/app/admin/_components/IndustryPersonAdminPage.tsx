"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiEdit3, FiEye, FiPlus, FiSearch, FiUsers } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "../anime/page.module.css";

type Kind = "staff" | "mangaka";
type Person = { id: string; displayName: string; slug: string; imageUrl: string | null; occupations: string[]; publicationStatus: "DRAFT" | "PUBLISHED"; updatedAt: string };
const settings = {
  staff: { title: "Staff", singular: "profissional", queryField: "adminStaff", description: "profissionais da produção", publicPath: "staff" },
  mangaka: { title: "Mangakas", singular: "mangaka", queryField: "adminMangakas", description: "autores e artistas de manga", publicPath: "mangaka" },
} as const;

export function IndustryPersonAdminPage({ kind }: { kind: Kind }) {
  const config = settings[kind];
  const { user, accessToken, loading: authLoading } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const queryDocument = `query IndustryPeople($query: String) { ${config.queryField}(query: $query) { id displayName slug imageUrl occupations publicationStatus updatedAt } }`;

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true); setError("");
    try {
      const data = await graphqlRequest<Record<string, Person[]>>(queryDocument, { query: activeQuery || null }, accessToken);
      setPeople(data[config.queryField] ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar os perfis");
    } finally { setLoading(false); }
  }, [accessToken, activeQuery, config.queryField, queryDocument]);

  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const frame = requestAnimationFrame(() => void load());
    return () => cancelAnimationFrame(frame);
  }, [accessToken, load, user?.role]);

  const totals = useMemo(() => ({ published: people.filter((person) => person.publicationStatus === "PUBLISHED").length, drafts: people.filter((person) => person.publicationStatus === "DRAFT").length }), [people]);
  const submitSearch = (event: FormEvent) => { event.preventDefault(); setActiveQuery(search.trim()); };

  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiUsers /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><span>Administração · Catálogo</span><h1>{config.title}</h1><p>Cadastre e revise {config.description}.</p></div><div className={styles.headerActions}><Link className={styles.secondaryButton} href="/admin">Catálogo</Link><Link className={styles.createButton} href={`/admin/${kind}/new`}><FiPlus />Cadastrar {config.singular}</Link></div></header>
    <section className={styles.metrics}><article><small>Perfis encontrados</small><strong>{people.length}</strong></article><article><small>Publicados</small><strong>{totals.published}</strong></article><article><small>Rascunhos</small><strong>{totals.drafts}</strong></article></section>
    <section className={styles.catalog}>
      <div className={styles.toolbar}><div><h2>Gerenciar {config.title.toLowerCase()}</h2><p>Edite identidade, biografia, atuação, imagem e publicação.</p></div><form className={styles.search} autoComplete="off" onSubmit={submitSearch}><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${config.singular}`} /><button>Buscar</button></form></div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <div className={styles.loadingList}>{[0, 1, 2].map((item) => <span key={item} />)}</div> : people.length === 0 ? <div className={styles.empty}><FiUsers /><h3>Nenhum perfil encontrado</h3><p>Comece cadastrando o primeiro perfil.</p></div> : <div className={styles.list}>{people.map((person) => <article className={styles.animeRow} key={person.id}>
        {person.imageUrl ? <Image src={assetUrl(person.imageUrl) ?? person.imageUrl} alt={person.displayName} width={58} height={82} unoptimized /> : <span />}
        <div className={styles.identity}><strong>{person.displayName}</strong><span>/{person.slug}</span><small>{person.occupations.join(", ") || "Atuação não informada"}</small></div>
        <span className={`${styles.status} ${person.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{person.publicationStatus === "PUBLISHED" ? "Publicado" : "Rascunho"}</span>
        <time>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(person.updatedAt))}</time>
        <div className={styles.actions}><Link href={`/${config.publicPath}/${person.slug}`}><FiEye /><span>Visualizar</span></Link><Link className={styles.editButton} href={`/admin/${kind}/${person.slug}/edit`}><FiEdit3 /><span>Editar</span></Link></div>
      </article>)}</div>}
    </section>
  </main>;
}
