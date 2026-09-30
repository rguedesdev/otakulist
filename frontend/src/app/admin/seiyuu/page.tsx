"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FiEdit3, FiEye, FiMic, FiPlus, FiSearch } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "../anime/page.module.css";

const ADMIN_SEIYUUS = `query AdminSeiyuus($query: String) {
  adminSeiyuus(query: $query) {
    id displayName slug imageUrl agency publicationStatus updatedAt
  }
}`;

type AdminSeiyuu = {
  id: string;
  displayName: string;
  slug: string;
  imageUrl: string | null;
  agency: string | null;
  publicationStatus: "DRAFT" | "PUBLISHED";
  updatedAt: string;
};

const statusLabels = { DRAFT: "Rascunho", PUBLISHED: "Publicado" } as const;

export default function SeiyuuAdminPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [seiyuus, setSeiyuus] = useState<AdminSeiyuu[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSeiyuus = useCallback(async (query: string) => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const data = await graphqlRequest<{ adminSeiyuus: AdminSeiyuu[] }>(ADMIN_SEIYUUS, { query: query || null }, accessToken);
      setSeiyuus(data.adminSeiyuus);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar os seiyuus");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user?.role !== "ZEUS" || !accessToken) return;
    const frame = window.requestAnimationFrame(() => void loadSeiyuus(activeQuery));
    return () => window.cancelAnimationFrame(frame);
  }, [accessToken, activeQuery, loadSeiyuus, user?.role]);

  const totals = useMemo(() => ({
    all: seiyuus.length,
    published: seiyuus.filter((item) => item.publicationStatus === "PUBLISHED").length,
    drafts: seiyuus.filter((item) => item.publicationStatus === "DRAFT").length,
  }), [seiyuus]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveQuery(search.trim());
  };

  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiMic /><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para gerenciar o catálogo.</p><Link href={user ? "/" : "/login"}>{user ? "Voltar ao início" : "Entrar"}</Link></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>Administração · Catálogo</span><h1>Seiyuus</h1><p>Cadastre e revise perfis de profissionais de voz.</p></div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href="/admin">Catálogo</Link>
          <Link className={styles.createButton} href="/admin/seiyuu/new"><FiPlus />Cadastrar seiyuu</Link>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Resumo dos seiyuus">
        <article><small>Seiyuus encontrados</small><strong>{totals.all}</strong></article>
        <article><small>Publicados</small><strong>{totals.published}</strong></article>
        <article><small>Rascunhos</small><strong>{totals.drafts}</strong></article>
      </section>

      <section className={styles.catalog}>
        <div className={styles.toolbar}>
          <div><h2>Gerenciar seiyuus</h2><p>Edite identidade, biografia, agência, imagem e publicação.</p></div>
          <form className={styles.search} autoComplete="off" onSubmit={submitSearch}><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar seiyuu" aria-label="Buscar seiyuu" /><button type="submit">Buscar</button></form>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <div className={styles.loadingList}>{Array.from({ length: 3 }, (_, index) => <span key={index} />)}</div>
        ) : seiyuus.length === 0 ? (
          <div className={styles.empty}><FiMic /><h3>Nenhum seiyuu encontrado</h3><p>{activeQuery ? "Tente buscar por outro nome." : "Comece cadastrando o primeiro seiyuu."}</p></div>
        ) : (
          <div className={styles.list}>{seiyuus.map((seiyuu) => (
            <article className={styles.animeRow} key={seiyuu.id}>
              {seiyuu.imageUrl ? <Image src={assetUrl(seiyuu.imageUrl) ?? seiyuu.imageUrl} alt={seiyuu.displayName} width={58} height={82} unoptimized /> : <span />}
              <div className={styles.identity}><strong>{seiyuu.displayName}</strong><span>/{seiyuu.slug}</span><small>{seiyuu.agency || "Agência não informada"}</small></div>
              <span className={`${styles.status} ${seiyuu.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{statusLabels[seiyuu.publicationStatus]}</span>
              <time dateTime={seiyuu.updatedAt}>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(seiyuu.updatedAt))}</time>
              <div className={styles.actions}><Link href={`/seiyuu/${seiyuu.slug}`}><FiEye /><span>Visualizar</span></Link><Link className={styles.editButton} href={`/admin/seiyuu/${seiyuu.slug}/edit`}><FiEdit3 /><span>Editar</span></Link></div>
            </article>
          ))}</div>
        )}
      </section>
    </main>
  );
}
