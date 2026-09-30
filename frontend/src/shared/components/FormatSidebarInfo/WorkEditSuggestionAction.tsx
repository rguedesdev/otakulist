"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FiEdit, FiX } from "react-icons/fi";
import { graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "./formatsidebar.module.css";

type Target = { medium: "ANIME" | "MANGA" | "LIGHT_NOVEL"; slug: string; title: string; synopsis: string; genres: string[] };
const SUBMIT = `mutation SuggestWorkEdit($medium: WorkMedium!, $slug: String!, $input: WorkEditSuggestionInput!) { suggestWorkEdit(medium: $medium, slug: $slug, input: $input) { id status } }`;

export function WorkEditSuggestionAction({ target }: { target: Target }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(target.title);
  const [synopsis, setSynopsis] = useState(target.synopsis);
  const [genres, setGenres] = useState(target.genres.join(", "));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    const input: { title?: string; synopsis?: string; genres?: string[] } = {};
    if (title.trim() !== target.title) input.title = title.trim();
    if (synopsis.trim() !== target.synopsis) input.synopsis = synopsis.trim();
    const parsedGenres = genres.split(",").map((genre) => genre.trim()).filter(Boolean);
    if (JSON.stringify(parsedGenres) !== JSON.stringify(target.genres)) input.genres = parsedGenres;
    if (!Object.keys(input).length) { setError("Altere ao menos uma informação antes de enviar."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await graphqlRequest(SUBMIT, { medium: target.medium, slug: target.slug, input }, accessToken);
      setMessage("Sugestão enviada. Ela será aplicada após revisão de um administrador.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível enviar sua sugestão.");
    } finally { setBusy(false); }
  };

  return <>
    <button className={styles.btnEdit} type="button" disabled={authLoading} onClick={() => {
      setError(""); setMessage(""); setTitle(target.title); setSynopsis(target.synopsis); setGenres(target.genres.join(", ")); setOpen(true);
    }}>
      <span className={styles.iconbtnEditContainer}><FiEdit className={styles.iconbtnEdit} size={16} /></span>
      <span className={styles.linkText}>Editar</span>
    </button>
    {open && <div className={styles.suggestionBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className={styles.suggestionModal} role="dialog" aria-modal="true" aria-labelledby="anime-suggestion-title">
        <button className={styles.suggestionClose} type="button" aria-label="Fechar" onClick={() => setOpen(false)}><FiX /></button>
        <header className={styles.suggestionHeader}><span>Colaboração da comunidade</span><h2 id="anime-suggestion-title">Sugerir edição</h2><p>Sua proposta será revisada por um administrador antes de aparecer na página.</p></header>
        {message ? <p className={styles.suggestionMessage} role="status">{message}</p> : !user ? <div className={styles.suggestionLogin}><p>Entre na sua conta para enviar uma proposta de edição.</p><Link href="/login">Entrar</Link></div> : <form className={styles.suggestionForm} onSubmit={submit}>
          <label className={styles.suggestionField}>Título<input maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className={styles.suggestionField}>Sinopse<textarea maxLength={10000} rows={7} value={synopsis} onChange={(event) => setSynopsis(event.target.value)} /></label>
          <label className={styles.suggestionField}>Gêneros<span>Separe os gêneros por vírgulas.</span><input value={genres} onChange={(event) => setGenres(event.target.value)} /></label>
          {error && <p className={styles.suggestionError} role="alert">{error}</p>}
          <div className={styles.suggestionActions}><button type="button" onClick={() => setOpen(false)}>Cancelar</button><button type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar para revisão"}</button></div>
        </form>}
      </section>
    </div>}
  </>;
}
