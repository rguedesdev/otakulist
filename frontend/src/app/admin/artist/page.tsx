"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiEdit3, FiEye, FiMusic, FiPlus, FiSearch } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "../anime/page.module.css";

const ADMIN_ARTISTS = `query AdminMusicArtists($query: String) {
  adminMusicArtists(query: $query) { id displayName slug kind imageUrl recordLabel publicationStatus updatedAt }
}`;
type AdminArtist = { id: string; displayName: string; slug: string; kind: "SOLO" | "BAND"; imageUrl: string; recordLabel: string | null; publicationStatus: "DRAFT" | "PUBLISHED"; updatedAt: string };
const statusLabels = { DRAFT: "Rascunho", PUBLISHED: "Publicado" } as const;

export default function ArtistAdminPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [artists, setArtists] = useState<AdminArtist[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArtists = useCallback(async (query: string) => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const data = await graphqlRequest<{ adminMusicArtists: AdminArtist[] }>(ADMIN_ARTISTS, { query: query || null }, accessToken);
      setArtists(data.adminMusicArtists);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar os artistas");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const frame = window.requestAnimationFrame(() => void loadArtists(activeQuery));
    return () => window.cancelAnimationFrame(frame);
  }, [accessToken, activeQuery, loadArtists, user?.role]);

  const totals = useMemo(() => ({ all: artists.length, published: artists.filter((item) => item.publicationStatus === "PUBLISHED").length, drafts: artists.filter((item) => item.publicationStatus === "DRAFT").length }), [artists]);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setActiveQuery(search.trim()); };

  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiMusic /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar ao início" : "Entrar"}</Link></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><span>Administração · Catálogo</span><h1>Artistas musicais</h1><p>Cadastre cantores, cantoras, grupos e bandas.</p></div><div className={styles.headerActions}><Link className={styles.secondaryButton} href="/admin">Catálogo</Link><Link className={styles.createButton} href="/admin/artist/new"><FiPlus />Cadastrar artista</Link></div></header>
    <section className={styles.metrics}><article><small>Artistas encontrados</small><strong>{totals.all}</strong></article><article><small>Publicados</small><strong>{totals.published}</strong></article><article><small>Rascunhos</small><strong>{totals.drafts}</strong></article></section>
    <section className={styles.catalog}>
      <div className={styles.toolbar}><div><h2>Gerenciar artistas</h2><p>Edite perfil, imagem, gravadora e plataformas.</p></div><form className={styles.search} onSubmit={submitSearch}><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar artista ou banda" /><button type="submit">Buscar</button></form></div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <div className={styles.loadingList}>{Array.from({ length: 3 }, (_, index) => <span key={index} />)}</div> : artists.length === 0 ? <div className={styles.empty}><FiMusic /><h3>Nenhum artista encontrado</h3><p>Comece cadastrando o primeiro artista.</p></div> : <div className={styles.list}>{artists.map((artist) => <article className={styles.animeRow} key={artist.id}>
        <Image src={assetUrl(artist.imageUrl) ?? artist.imageUrl} alt={artist.displayName} width={58} height={82} unoptimized />
        <div className={styles.identity}><strong>{artist.displayName}</strong><span>/{artist.slug}</span><small>{artist.kind === "BAND" ? "Banda" : "Artista solo"} · {artist.recordLabel || "Sem gravadora informada"}</small></div>
        <span className={`${styles.status} ${artist.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{statusLabels[artist.publicationStatus]}</span>
        <time dateTime={artist.updatedAt}>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(artist.updatedAt))}</time>
        <div className={styles.actions}><Link href={`/artist/${artist.slug}`}><FiEye /><span>Visualizar</span></Link><Link className={styles.editButton} href={`/admin/artist/${artist.slug}/edit`}><FiEdit3 /><span>Editar</span></Link></div>
      </article>)}</div>}
    </section>
  </main>;
}
