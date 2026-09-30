"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FiX } from "react-icons/fi";
import { MdOutlineRateReview } from "react-icons/md";

import { graphqlRequest } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "./formatsidebar.module.css";

export type ReviewTarget = {
  medium: "ANIME" | "MANGA" | "LIGHT_NOVEL";
  slug: string;
  title: string;
};

type ReviewData = { score: number; comment: string | null; updatedAt: string };

const MY_REVIEW = `query MyWorkReview($medium: WorkMedium!, $slug: String!) {
  myWorkReview(medium: $medium, slug: $slug) { score comment updatedAt }
}`;

const SAVE_REVIEW = `mutation SaveWorkReview($medium: WorkMedium!, $slug: String!, $input: SaveWorkReviewInput!) {
  saveWorkReview(medium: $medium, slug: $slug, input: $input) { score comment updatedAt }
}`;

export function ReviewAction({ target }: { target: ReviewTarget }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const selectedWhole = score === null ? null : Math.floor(score);
  const selectedDecimal = score === null ? null : Math.round((score - Math.floor(score)) * 10);
  const hasValidScore = score !== null
    && Number.isFinite(score)
    && score >= 1
    && score <= 10
    && Number.isInteger(score * 10);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !user || !accessToken) return;
    let active = true;
    void graphqlRequest<{ myWorkReview: ReviewData | null }>(MY_REVIEW, target, accessToken)
      .then(({ myWorkReview }) => {
        if (!active || !myWorkReview) return;
        setScore(myWorkReview.score);
        setComment(myWorkReview.comment ?? "");
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar sua avaliação");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [accessToken, open, target, user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !hasValidScore) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await graphqlRequest<{ saveWorkReview: ReviewData }>(SAVE_REVIEW, {
        medium: target.medium,
        slug: target.slug,
        input: { score, comment: comment.trim() || null },
      }, accessToken);
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar sua avaliação");
    } finally {
      setSaving(false);
    }
  };

  return <>
    <button className={styles.btnReview} type="button" onClick={() => { setSaved(false); setError(null); setLoading(Boolean(user && accessToken)); setOpen(true); }} aria-haspopup="dialog">
      <span className={styles.iconbtnReviewContainer}>
        <MdOutlineRateReview className={styles.iconbtnReview} size={16} />
      </span>
      <span className={styles.linkText}>Review</span>
    </button>

    {open && <div className={styles.reviewModalBackdrop} role="presentation" onMouseDown={() => setOpen(false)}>
      <section className={styles.reviewModal} role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className={styles.reviewModalClose} type="button" onClick={() => setOpen(false)} aria-label="Fechar avaliação"><FiX aria-hidden="true" /></button>
        <header className={styles.reviewModalHeader}>
          <span>Avaliação</span>
          <h2 id="review-modal-title">{target.title}</h2>
          <p>A nota é obrigatória. O comentário é opcional.</p>
        </header>

        {authLoading ? <p className={styles.reviewModalState}>Verificando sua sessão…</p> : !user ? <div className={styles.reviewLoginState}>
          <p>Entre na sua conta para avaliar esta obra.</p>
          <Link href="/login">Entrar</Link>
        </div> : <form className={styles.reviewForm} autoComplete="off" onSubmit={submit}>
          <fieldset disabled={loading || saving}>
            <legend>Nota <strong>*</strong></legend>
            <div className={styles.reviewScores}>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <button
                  className={selectedWhole === value ? styles.reviewScoreSelected : undefined}
                  type="button"
                  key={value}
                  onClick={() => { setScore(value); setSaved(false); }}
                  aria-pressed={selectedWhole === value}
                  aria-label={`Selecionar nota ${value}`}
                >
                  {value}
                </button>
              ))}
            </div>
            {selectedWhole !== null && (
              <div className={styles.reviewDecimals}>
                <span>Escolha o valor depois do ponto:</span>
                <div className={styles.reviewDecimalValues}>
                  {Array.from({ length: selectedWhole === 10 ? 1 : 10 }, (_, decimal) => (
                    <button
                      className={selectedDecimal === decimal ? styles.reviewScoreSelected : undefined}
                      type="button"
                      key={decimal}
                      onClick={() => { setScore(selectedWhole + decimal / 10); setSaved(false); }}
                      aria-pressed={selectedDecimal === decimal}
                      aria-label={`Selecionar nota ${selectedWhole}.${decimal}`}
                    >
                      .{decimal}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
          <label className={styles.reviewComment}>
            <span>Comentário <small>Opcional</small></span>
            <textarea rows={5} maxLength={2000} value={comment} onChange={(event) => { setComment(event.target.value); setSaved(false); }} placeholder="Escreva sua opinião sobre a obra…" />
            <small>{comment.length}/2000</small>
          </label>
          {error && <p className={styles.reviewError} role="alert">{error}</p>}
          {saved && <p className={styles.reviewSuccess} role="status">Avaliação salva.</p>}
          <div className={styles.reviewModalActions}>
            <button type="button" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" disabled={!hasValidScore || loading || saving}>{saving ? "Salvando…" : "Salvar avaliação"}</button>
          </div>
        </form>}
      </section>
    </div>}
  </>;
}
