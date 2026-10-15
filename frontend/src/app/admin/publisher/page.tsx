"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiBookOpen, FiEdit3, FiEye, FiPlus, FiSearch } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { formatSiteDate } from "@/shared/utils/date-format";
import styles from "../anime/page.module.css";

const ADMIN_PUBLISHERS = `query AdminPublishers($query: String) { adminPublishers(query: $query) { id displayName slug imageUrl foundation publicationStatus updatedAt } }`;
type AdminPublisher = { id: string; displayName: string; slug: string; imageUrl: string; foundation: string | null; publicationStatus: "DRAFT" | "PUBLISHED"; updatedAt: string };

export default function PublisherAdminPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [publishers, setPublishers] = useState<AdminPublisher[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadPublishers = useCallback(async (query: string) => {
    if (!accessToken) return;
    setLoading(true); setError("");
    try { const data = await graphqlRequest<{ adminPublishers: AdminPublisher[] }>(ADMIN_PUBLISHERS, { query: query || null }, accessToken); setPublishers(data.adminPublishers); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar as editoras"); }
    finally { setLoading(false); }
  }, [accessToken]);
  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const frame = window.requestAnimationFrame(() => void loadPublishers(activeQuery));
    return () => window.cancelAnimationFrame(frame);
  }, [accessToken, activeQuery, loadPublishers, user?.role]);
  const totals = useMemo(() => ({ all: publishers.length, published: publishers.filter((item) => item.publicationStatus === "PUBLISHED").length, drafts: publishers.filter((item) => item.publicationStatus === "DRAFT").length }), [publishers]);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setActiveQuery(search.trim()); };

  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiBookOpen /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar ao início" : "Entrar"}</Link></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><span>Administração · Catálogo</span><h1>Editoras</h1><p>Cadastre e edite as editoras vinculadas às obras.</p></div><div className={styles.headerActions}><Link className={styles.secondaryButton} href="/admin">Catálogo</Link><Link className={styles.createButton} href="/admin/publisher/new"><FiPlus />Cadastrar editora</Link></div></header>
    <section className={styles.metrics}><article><small>Editoras encontradas</small><strong>{totals.all}</strong></article><article><small>Publicadas</small><strong>{totals.published}</strong></article><article><small>Rascunhos</small><strong>{totals.drafts}</strong></article></section>
    <section className={styles.catalog}><div className={styles.toolbar}><div><h2>Gerenciar editoras</h2><p>Edite perfil, imagem e informações institucionais.</p></div><form className={styles.search} autoComplete="off" onSubmit={submitSearch}><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar editora" /><button type="submit">Buscar</button></form></div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <div className={styles.loadingList}>{Array.from({ length: 3 }, (_, index) => <span key={index} />)}</div> : publishers.length === 0 ? <div className={styles.empty}><FiBookOpen /><h3>Nenhuma editora encontrada</h3><p>Comece cadastrando a primeira editora.</p></div> : <div className={styles.list}>{publishers.map((publisher) => <article className={`${styles.animeRow} ${styles.studioRow}`} key={publisher.id}>
        <Image className={styles.studioThumbnail} src={assetUrl(publisher.imageUrl) ?? publisher.imageUrl} alt={publisher.displayName} width={92} height={58} unoptimized />
        <div className={styles.identity}><strong>{publisher.displayName}</strong><span>/{publisher.slug}</span><small>{publisher.foundation ? `Fundada em ${publisher.foundation}` : "Fundação não informada"}</small></div>
        <span className={`${styles.status} ${publisher.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{publisher.publicationStatus === "PUBLISHED" ? "Publicado" : "Rascunho"}</span>
        <time dateTime={publisher.updatedAt}>Atualizado em {formatSiteDate(publisher.updatedAt)}</time>
        <div className={styles.actions}><Link href={`/publisher/${publisher.slug}`}><FiEye /><span>Visualizar</span></Link><Link className={styles.editButton} href={`/admin/publisher/${publisher.slug}/edit`}><FiEdit3 /><span>Editar</span></Link></div>
      </article>)}</div>}
    </section>
  </main>;
}
