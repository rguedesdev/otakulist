"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiEdit3, FiEye, FiPlus, FiSearch, FiUser } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "../anime/page.module.css";

const ADMIN_CHARACTERS = `query AdminCharacters($query: String) {
  adminCharacters(query: $query) {
    id nameRomaji slug imageUrl publicationStatus updatedAt
    voiceCredits { seiyuuSlug animeTitle }
  }
}`;

type AdminCharacter = {
  id: string;
  nameRomaji: string;
  slug: string;
  imageUrl: string;
  publicationStatus: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  voiceCredits: Array<{ seiyuuSlug: string; animeTitle: string }>;
};

const statusLabels = { DRAFT: "Rascunho", PUBLISHED: "Publicado" } as const;

export default function CharacterAdminPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCharacters = useCallback(async (query: string) => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const data = await graphqlRequest<{ adminCharacters: AdminCharacter[] }>(
        ADMIN_CHARACTERS,
        { query: query || null },
        accessToken,
      );
      setCharacters(data.adminCharacters);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar os personagens");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const frame = window.requestAnimationFrame(() => void loadCharacters(activeQuery));
    return () => window.cancelAnimationFrame(frame);
  }, [accessToken, activeQuery, loadCharacters, user?.role]);

  const totals = useMemo(() => ({
    all: characters.length,
    published: characters.filter((item) => item.publicationStatus === "PUBLISHED").length,
    drafts: characters.filter((item) => item.publicationStatus === "DRAFT").length,
  }), [characters]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveQuery(search.trim());
  };

  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiUser /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar ao início" : "Entrar"}</Link></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>Administração · Catálogo</span><h1>Personagens</h1><p>Cadastre e revise os personagens e seus vínculos com seiyuus.</p></div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href="/admin/anime">Animes</Link>
          <Link className={styles.createButton} href="/admin/character/new"><FiPlus />Cadastrar personagem</Link>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Resumo dos personagens">
        <article><small>Personagens encontrados</small><strong>{totals.all}</strong></article>
        <article><small>Publicados</small><strong>{totals.published}</strong></article>
        <article><small>Rascunhos</small><strong>{totals.drafts}</strong></article>
      </section>

      <section className={styles.catalog}>
        <div className={styles.toolbar}>
          <div><h2>Gerenciar personagens</h2><p>Edite identidade, imagem, publicação e trabalhos de voz.</p></div>
          <form className={styles.search} autoComplete="off" onSubmit={submitSearch}>
            <FiSearch aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar personagem" aria-label="Buscar personagem" />
            <button type="submit">Buscar</button>
          </form>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <div className={styles.loadingList} aria-label="Carregando personagens">{Array.from({ length: 3 }, (_, index) => <span key={index} />)}</div>
        ) : characters.length === 0 ? (
          <div className={styles.empty}><FiUser /><h3>Nenhum personagem encontrado</h3><p>{activeQuery ? "Tente buscar por outro nome." : "Comece cadastrando o primeiro personagem."}</p></div>
        ) : (
          <div className={styles.list}>
            {characters.map((character) => (
              <article className={styles.animeRow} key={character.id}>
                <Image src={assetUrl(character.imageUrl) ?? character.imageUrl} alt={character.nameRomaji} width={58} height={82} unoptimized />
                <div className={styles.identity}><strong>{character.nameRomaji}</strong><span>/{character.slug}</span><small>{character.voiceCredits.length} vínculo(s) de voz</small></div>
                <span className={`${styles.status} ${character.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{statusLabels[character.publicationStatus]}</span>
                <time dateTime={character.updatedAt}>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(character.updatedAt))}</time>
                <div className={styles.actions}>
                  <Link href={`/character/${character.slug}`} title="Abrir página pública"><FiEye /><span>Visualizar</span></Link>
                  <Link className={styles.editButton} href={`/admin/character/${character.slug}/edit`}><FiEdit3 /><span>Editar</span></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
