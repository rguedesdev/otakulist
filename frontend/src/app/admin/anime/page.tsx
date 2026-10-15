"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiEdit3, FiEye, FiFilm, FiPlus, FiSearch } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { formatSiteDate } from "@/shared/utils/date-format";
import styles from "./page.module.css";

const ADMIN_ANIMES = `query AdminAnimes($query: String) {
  adminAnimes(query: $query) {
    id title slug coverUrl publicationStatus updatedAt
    installments { episodes status format }
  }
}`;

type AdminAnime = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  publicationStatus: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  installments: Array<{ episodes: number; status: string; format: string }>;
};

const statusLabels: Record<AdminAnime["publicationStatus"], string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
};

export default function AnimeAdminPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [animes, setAnimes] = useState<AdminAnime[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnimes = useCallback(async (query: string) => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const data = await graphqlRequest<{ adminAnimes: AdminAnime[] }>(
        ADMIN_ANIMES,
        { query: query || null },
        accessToken,
      );
      setAnimes(data.adminAnimes);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar os animes");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const animationFrame = window.requestAnimationFrame(() => void loadAnimes(activeQuery));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [accessToken, activeQuery, loadAnimes, user?.role]);

  const totals = useMemo(() => ({
    all: animes.length,
    published: animes.filter((anime) => anime.publicationStatus === "PUBLISHED").length,
    drafts: animes.filter((anime) => anime.publicationStatus === "DRAFT").length,
  }), [animes]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveQuery(search.trim());
  };

  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiFilm /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar ao início" : "Entrar"}</Link></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>Administração · Catálogo</span><h1>Animes</h1><p>Cadastre, revise e publique as obras agrupadas do tracker.</p></div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href="/admin/character">Personagens</Link>
          <Link className={styles.createButton} href="/admin/anime/new"><FiPlus />Cadastrar anime</Link>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Resumo do catálogo">
        <article><small>Obras encontradas</small><strong>{totals.all}</strong></article>
        <article><small>Publicadas</small><strong>{totals.published}</strong></article>
        <article><small>Rascunhos</small><strong>{totals.drafts}</strong></article>
      </section>

      <section className={styles.catalog}>
        <div className={styles.toolbar}>
          <div><h2>Gerenciar obras</h2><p>Abra uma obra para alterar informações, temporadas, vínculos e links.</p></div>
          <form className={styles.search} autoComplete="off" onSubmit={submitSearch}>
            <FiSearch aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título" aria-label="Buscar anime por título" />
            <button type="submit">Buscar</button>
          </form>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <div className={styles.loadingList} aria-label="Carregando animes">{Array.from({ length: 3 }, (_, index) => <span key={index} />)}</div>
        ) : animes.length === 0 ? (
          <div className={styles.empty}><FiFilm /><h3>Nenhum anime encontrado</h3><p>{activeQuery ? "Tente buscar por outro título." : "Comece cadastrando a primeira obra."}</p></div>
        ) : (
          <div className={styles.list}>
            {animes.map((anime) => {
              const episodes = anime.installments.reduce((total, installment) => total + installment.episodes, 0);
              const formats = [...new Set(anime.installments.map((installment) => installment.format))].join(" · ");
              return <article className={styles.animeRow} key={anime.id}>
                <Image src={assetUrl(anime.coverUrl) ?? anime.coverUrl} alt={`Capa de ${anime.title}`} width={58} height={82} unoptimized />
                <div className={styles.identity}><strong>{anime.title}</strong><span>/{anime.slug}</span><small>{anime.installments.length} lançamento(s) · {episodes} episódios · {formats}</small></div>
                <span className={`${styles.status} ${anime.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{statusLabels[anime.publicationStatus]}</span>
                <time dateTime={anime.updatedAt}>Atualizado em {formatSiteDate(anime.updatedAt)}</time>
                <div className={styles.actions}>
                  <Link href={`/anime/${anime.slug}`} title="Abrir página pública"><FiEye /><span>Visualizar</span></Link>
                  <Link className={styles.editButton} href={`/admin/anime/${anime.slug}/edit`}><FiEdit3 /><span>Editar</span></Link>
                </div>
              </article>;
            })}
          </div>
        )}
      </section>
    </main>
  );
}
