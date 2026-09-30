"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "./collaborations.module.css";

type Suggestion = {
  id: string; status: "PENDING"; createdAt: string; medium: "ANIME" | "MANGA" | "LIGHT_NOVEL";
  anime: { title: string; slug: string; synopsis: string; genres: string[] } | null;
  manga: { title: string; slug: string; synopsis: string; genres: string[] } | null;
  lightNovel: { title: string; slug: string; synopsis: string; genres: string[] } | null;
  proposer: { username: string; displayName: string };
  title: string | null; synopsis: string | null; genres: string[] | null;
};
const QUERY = `query PendingWorkEditSuggestions { pendingWorkEditSuggestions { id status createdAt medium title synopsis genres anime { title slug synopsis genres } manga { title slug synopsis genres } lightNovel { title slug synopsis genres } proposer { username displayName } } }`;
const REVIEW = `mutation ReviewWorkEditSuggestion($id: ID!, $approve: Boolean!) { reviewWorkEditSuggestion(id: $id, approve: $approve) { id status } }`;
const workPath = (item: Suggestion) => item.medium === "MANGA" ? "manga" : item.medium === "LIGHT_NOVEL" ? "light-novel" : "anime";

export default function CommunityCollaborationsPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    void graphqlRequest<{ pendingWorkEditSuggestions: Suggestion[] }>(QUERY, undefined, accessToken)
      .then((data) => { if (active) setItems(data.pendingWorkEditSuggestions); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar as sugestões."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken]);

  const review = async (id: string, approve: boolean) => {
    if (!accessToken) return;
    setBusyId(id); setError("");
    try { await graphqlRequest(REVIEW, { id, approve }, accessToken); setItems((current) => current.filter((item) => item.id !== id)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível revisar a sugestão."); }
    finally { setBusyId(null); }
  };

  if (authLoading || (accessToken && loading)) return <main className={styles.page}><p>Carregando sugestões…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.page}><h1>Acesso restrito</h1><p>Esta área está disponível apenas para usuários ZEUS.</p><Link href="/admin">Voltar à administração</Link></main>;

  return <main className={styles.page}>
    <header><Link href="/admin">Administração</Link><h1>Colaborações da comunidade</h1><p>Revise as melhorias sugeridas pela comunidade. A aprovação aplica as alterações à página da obra.</p></header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {items.length === 0 ? <p className={styles.empty}>Nenhuma colaboração pendente.</p> : items.map((item) => { const work = item.anime ?? item.manga ?? item.lightNovel; if (!work) return null; return <article className={styles.card} key={item.id}>
      <h2><Link href={`/${workPath(item)}/${work.slug}`} target="_blank">{work.title}</Link> <small>{item.medium === "MANGA" ? "Mangá" : item.medium === "LIGHT_NOVEL" ? "Light novel" : "Anime"}</small></h2>
      <p className={styles.byline}>Enviada por {item.proposer.displayName} (@{item.proposer.username}) · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.createdAt))}</p>
      {item.title !== null && <section><h3>Título</h3><p><del>{work.title}</del><br /><strong>{item.title}</strong></p></section>}
      {item.synopsis !== null && <section><h3>Sinopse</h3><div className={styles.compare}><p><b>Atual</b>{work.synopsis}</p><p><b>Sugerida</b>{item.synopsis}</p></div></section>}
      {item.genres !== null && <section><h3>Gêneros</h3><p><del>{work.genres.join(", ") || "—"}</del><br /><strong>{item.genres.join(", ") || "—"}</strong></p></section>}
      <footer><button disabled={busyId === item.id} onClick={() => void review(item.id, false)}>Recusar</button><button disabled={busyId === item.id} onClick={() => void review(item.id, true)}>{busyId === item.id ? "Salvando…" : "Aprovar e aplicar"}</button></footer>
    </article>; })}
  </main>;
}
