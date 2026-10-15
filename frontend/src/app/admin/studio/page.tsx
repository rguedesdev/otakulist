"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiEdit3, FiEye, FiHome, FiPlus, FiSearch } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { formatSiteDate } from "@/shared/utils/date-format";
import styles from "../anime/page.module.css";

const ADMIN_STUDIOS = `query AdminStudios($query: String) { adminStudios(query: $query) { id displayName slug imageUrl headquarters publicationStatus updatedAt } }`;
type AdminStudio = { id: string; displayName: string; slug: string; imageUrl: string; headquarters: string | null; publicationStatus: "DRAFT" | "PUBLISHED"; updatedAt: string };
const statusLabels = { DRAFT: "Rascunho", PUBLISHED: "Publicado" } as const;

export default function StudioAdminPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [studios, setStudios] = useState<AdminStudio[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadStudios = useCallback(async (query: string) => {
    if (!accessToken) return;
    setLoading(true); setError("");
    try { const data = await graphqlRequest<{ adminStudios: AdminStudio[] }>(ADMIN_STUDIOS, { query: query || null }, accessToken); setStudios(data.adminStudios); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar os estúdios"); }
    finally { setLoading(false); }
  }, [accessToken]);
  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const frame = window.requestAnimationFrame(() => void loadStudios(activeQuery));
    return () => window.cancelAnimationFrame(frame);
  }, [accessToken, activeQuery, loadStudios, user?.role]);
  const totals = useMemo(() => ({ all: studios.length, published: studios.filter((item) => item.publicationStatus === "PUBLISHED").length, drafts: studios.filter((item) => item.publicationStatus === "DRAFT").length }), [studios]);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setActiveQuery(search.trim()); };

  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiHome /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar ao início" : "Entrar"}</Link></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><span>Administração · Catálogo</span><h1>Estúdios</h1><p>Cadastre e edite os estúdios vinculados aos lançamentos de anime.</p></div><div className={styles.headerActions}><Link className={styles.secondaryButton} href="/admin">Catálogo</Link><Link className={styles.createButton} href="/admin/studio/new"><FiPlus />Cadastrar estúdio</Link></div></header>
    <section className={styles.metrics}><article><small>Estúdios encontrados</small><strong>{totals.all}</strong></article><article><small>Publicados</small><strong>{totals.published}</strong></article><article><small>Rascunhos</small><strong>{totals.drafts}</strong></article></section>
    <section className={styles.catalog}><div className={styles.toolbar}><div><h2>Gerenciar estúdios</h2><p>Edite perfil, imagem e informações institucionais.</p></div><form className={styles.search} autoComplete="off" onSubmit={submitSearch}><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estúdio" /><button type="submit">Buscar</button></form></div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <div className={styles.loadingList}>{Array.from({ length: 3 }, (_, index) => <span key={index} />)}</div> : studios.length === 0 ? <div className={styles.empty}><FiHome /><h3>Nenhum estúdio encontrado</h3><p>Comece cadastrando o primeiro estúdio.</p></div> : <div className={styles.list}>{studios.map((studio) => <article className={`${styles.animeRow} ${styles.studioRow}`} key={studio.id}>
        <Image className={styles.studioThumbnail} src={assetUrl(studio.imageUrl) ?? studio.imageUrl} alt={studio.displayName} width={92} height={58} unoptimized />
        <div className={styles.identity}><strong>{studio.displayName}</strong><span>/{studio.slug}</span><small>{studio.headquarters || "Sede não informada"}</small></div>
        <span className={`${styles.status} ${studio.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{statusLabels[studio.publicationStatus]}</span>
        <time dateTime={studio.updatedAt}>Atualizado em {formatSiteDate(studio.updatedAt)}</time>
        <div className={styles.actions}><Link href={`/studio/${studio.slug}`}><FiEye /><span>Visualizar</span></Link><Link className={styles.editButton} href={`/admin/studio/${studio.slug}/edit`}><FiEdit3 /><span>Editar</span></Link></div>
      </article>)}</div>}
    </section>
  </main>;
}
