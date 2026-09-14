"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FiBookOpen, FiEdit3, FiEye, FiPlus, FiSearch } from "react-icons/fi";

import { assetUrl, graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "../anime/page.module.css";

type AdminMagazine = { id: string; title: string; slug: string; imageUrl: string; frequency: string | null; publicationStatus: "DRAFT" | "PUBLISHED"; updatedAt: string; publisher: { displayName: string } };
const ADMIN_MAGAZINES = `query AdminMagazines($query: String) { adminMagazines(query: $query) { id title slug imageUrl frequency publicationStatus updatedAt publisher { displayName } } }`;

export default function MagazineAdminPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [magazines, setMagazines] = useState<AdminMagazine[]>([]);
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (query: string) => {
    if (!accessToken) return;
    setLoading(true); setError("");
    try { const data = await graphqlRequest<{ adminMagazines: AdminMagazine[] }>(ADMIN_MAGAZINES, { query: query || null }, accessToken); setMagazines(data.adminMagazines); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar as magazines"); }
    finally { setLoading(false); }
  }, [accessToken]);
  useEffect(() => { if (user?.role !== "ZEUS" || !accessToken) return; const frame = requestAnimationFrame(() => void load(activeQuery)); return () => cancelAnimationFrame(frame); }, [accessToken, activeQuery, load, user?.role]);
  const submit = (event: FormEvent) => { event.preventDefault(); setActiveQuery(search.trim()); };
  if (authLoading) return <main className={styles.statePage}><div className={styles.loader} /></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.statePage}><FiBookOpen /><h1>Acesso restrito</h1><Link href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></main>;
  return <main className={styles.page}><header className={styles.header}><div><span>Administração · Catálogo</span><h1>Magazines</h1><p>Gerencie revistas e seus vínculos com editoras.</p></div><div className={styles.headerActions}><Link className={styles.secondaryButton} href="/admin">Catálogo</Link><Link className={styles.createButton} href="/admin/magazine/new"><FiPlus />Cadastrar magazine</Link></div></header>
    <section className={styles.catalog}><div className={styles.toolbar}><div><h2>Gerenciar magazines</h2><p>O vínculo editorial é definido em cada magazine.</p></div><form className={styles.search} onSubmit={submit}><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar magazine" /><button>Buscar</button></form></div>{error && <p className={styles.error}>{error}</p>}{loading ? <div className={styles.loadingList}>{[0, 1, 2].map((item) => <span key={item} />)}</div> : magazines.length === 0 ? <div className={styles.empty}><FiBookOpen /><h3>Nenhuma magazine encontrada</h3></div> : <div className={styles.list}>{magazines.map((magazine) => <article className={styles.animeRow} key={magazine.id}><Image src={assetUrl(magazine.imageUrl) ?? magazine.imageUrl} alt={magazine.title} width={58} height={82} unoptimized /><div className={styles.identity}><strong>{magazine.title}</strong><span>/{magazine.slug}</span><small>{magazine.publisher.displayName} · {magazine.frequency ?? "Periodicidade não informada"}</small></div><span className={`${styles.status} ${magazine.publicationStatus === "PUBLISHED" ? styles.published : styles.draft}`}>{magazine.publicationStatus === "PUBLISHED" ? "Publicado" : "Rascunho"}</span><time dateTime={magazine.updatedAt}>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(magazine.updatedAt))}</time><div className={styles.actions}><Link href={`/magazine/${magazine.slug}`}><FiEye /><span>Visualizar</span></Link><Link className={styles.editButton} href={`/admin/magazine/${magazine.slug}/edit`}><FiEdit3 /><span>Editar</span></Link></div></article>)}</div>}</section>
  </main>;
}
