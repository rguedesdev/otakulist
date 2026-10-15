"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiEdit3,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { LuListTree } from "react-icons/lu";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import { getPublicationListEntry, publicationEntryToLocalTracker, savePublicationListEntry } from "@/shared/tracking/publication-list-api";

import styles from "../../mangaslug.module.css";

interface MangaTrackerPanelProps {
  totalChapters: number;
  workKey: string;
}

const statusLabels: Record<string, string> = {
  planejado: "Planejo ler",
  lendo: "Lendo",
  pausado: "Pausado",
  completo: "Completo",
  abandonado: "Dropado",
};

type ProgressStyle = CSSProperties & {
  "--progress-light": string;
  "--progress-dark": string;
};

function getProgressStyle(progress: number): ProgressStyle {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const darkeningProgress = Math.max(
    0,
    ((normalizedProgress - 70) / 30) * 100,
  );

  return {
    width: `${normalizedProgress}%`,
    "--progress-light": `${100 - darkeningProgress}%`,
    "--progress-dark": `${darkeningProgress}%`,
  };
}

function MangaTrackerPanel({ totalChapters, workKey }: MangaTrackerPanelProps) {
  const { user, accessToken } = useAuth();
  const isAuthenticated = Boolean(user);
  const [readChapters, setReadChapters] = useState(0);
  const [status, setStatus] = useState("planejado");
  const [isAdded, setIsAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const hasKnownTotal = totalChapters > 0;

  useEffect(() => {
    const hydrateTracker = (resetBeforeLoading = false) => {
      if (resetBeforeLoading) {
        setReadChapters(0);
        setStatus("planejado");
        setIsAdded(false);
        setSaved(false);
      }
      if (!user || !accessToken) return;
      const storageKey = `otakulist:publication-tracker:${user.id}:MANGA:${workKey}`;
      void getPublicationListEntry("MANGA", workKey, accessToken).then((entry) => {
        if (!entry) {
          setReadChapters(0);
          setStatus("planejado");
          setIsAdded(false);
          setSaved(false);
          return;
        }
        const tracker = publicationEntryToLocalTracker(entry);
        setReadChapters(hasKnownTotal ? Math.min(totalChapters, tracker.readChapters) : Math.max(0, tracker.readChapters));
        setStatus(tracker.status);
        setIsAdded(true);
        setSaved(true);
        window.localStorage.setItem(storageKey, JSON.stringify(tracker));
      }).catch(() => undefined);
    };

    const animationFrame = window.requestAnimationFrame(() => hydrateTracker(true));
    const handleTrackerUpdate = (event: Event) => {
      if (!user) return;
      const storageKey = `otakulist:publication-tracker:${user.id}:MANGA:${workKey}`;
      if (event instanceof CustomEvent && event.detail === storageKey) hydrateTracker();
    };
    window.addEventListener("otakulist:publication-tracker-updated", handleTrackerUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("otakulist:publication-tracker-updated", handleTrackerUpdate);
    };
  }, [accessToken, hasKnownTotal, totalChapters, user, workKey]);

  const progress = hasKnownTotal ? Math.round((readChapters / totalChapters) * 100) : null;
  const visualProgress = progress ?? (readChapters > 0 ? 50 : 0);

  const changeChapters = (amount: number) => {
    setSaved(false);
    setReadChapters((current) => {
      const next = Math.max(0, hasKnownTotal ? Math.min(totalChapters, current + amount) : current + amount);
      if (hasKnownTotal && next === totalChapters) setStatus("completo");
      else if (amount > 0) setStatus("lendo");
      else if (status === "completo") setStatus("lendo");
      return next;
    });
  };

  const saveTracker = async () => {
    if (!user || !accessToken || savingProgress) return;
    setSavingProgress(true);
    const storageKey = `otakulist:publication-tracker:${user.id}:MANGA:${workKey}`;
    try {
      const entry = await savePublicationListEntry("MANGA", workKey, accessToken, { readChapters, status });
      window.localStorage.setItem(storageKey, JSON.stringify(publicationEntryToLocalTracker(entry)));
      setIsAdded(true);
      setSaved(true);
      window.dispatchEvent(new CustomEvent("otakulist:publication-tracker-updated", { detail: storageKey }));
    } finally {
      setSavingProgress(false);
    }
  };

  if (!isAuthenticated || !isAdded) return null;

  return (
    <section id="acompanhar" className={`${styles.trackerSection} ${isExpanded ? styles.trackerSectionExpanded : ""}`}>
    <div className={styles.trackerWrapper}>
      <div className={styles.trackerSummary}>
        <div className={styles.trackerIdentity}>
          <span className={styles.trackerIcon}>
            <LuListTree aria-hidden="true" />
          </span>
          <span>
            <small>Minha lista</small>
            <strong>Acompanhar manga</strong>
          </span>
        </div>

          <>
            <div className={styles.trackerStatus}>
              <small>Status</small>
              <strong>{statusLabels[status]}</strong>
            </div>

            <div className={styles.summaryProgress}>
              <div>
                <span>{progress === null ? "Total em aberto" : `${progress}% concluído`}</span>
                <strong>
                  {hasKnownTotal ? `${readChapters}/${totalChapters} capítulos` : `${readChapters} capítulos lidos`}
                </strong>
              </div>
              <div className={styles.summaryProgressTrack} aria-hidden="true">
                <span
                  className={hasKnownTotal && readChapters === totalChapters ? styles.progressComplete : undefined}
                  style={getProgressStyle(visualProgress)}
                />
              </div>
            </div>
          </>

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => {
            setIsExpanded((current) => !current);
          }}
          aria-expanded={isAuthenticated ? isExpanded : undefined}
          aria-controls={isAuthenticated ? "manga-tracker-editor" : undefined}
        >
            <>
              <FiEdit3 aria-hidden="true" />
              <span>{isExpanded ? "Fechar edição" : "Editar progresso"}</span>
              <FiChevronDown
                className={isExpanded ? styles.chevronExpanded : undefined}
                aria-hidden="true"
              />
            </>
        </button>
      </div>

      {isExpanded && (
        <div id="manga-tracker-editor" className={styles.trackerEditor}>
          <div className={styles.trackerPanel}>
            <div className={styles.progressArea}>
              <div className={styles.progressMeta}>
                <div>
                  <strong>{progress === null ? "Total em aberto" : `${progress}% concluído`}</strong>
                  <span>Continue de onde parou</span>
                </div>
                <span className={styles.episodeCount}>
                  {hasKnownTotal ? `${readChapters} / ${totalChapters} caps.` : `${readChapters} caps. lidos`}
                </span>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label="Progresso dos capítulos"
                aria-valuemin={hasKnownTotal ? 0 : undefined}
                aria-valuemax={hasKnownTotal ? totalChapters : undefined}
                aria-valuenow={hasKnownTotal ? readChapters : undefined}
                aria-valuetext={hasKnownTotal ? undefined : "Total em aberto"}
              >
                <span
                  className={hasKnownTotal && readChapters === totalChapters ? styles.progressComplete : undefined}
                  style={getProgressStyle(visualProgress)}
                />
              </div>
              <div className={styles.episodeControls}>
                <button
                  type="button"
                  onClick={() => changeChapters(-1)}
                  aria-label="Diminuir um capítulo"
                  disabled={readChapters === 0}
                >
                  <FiMinus aria-hidden="true" />
                </button>
                <span>Capítulos lidos</span>
                <button
                  type="button"
                  onClick={() => changeChapters(1)}
                  aria-label="Adicionar um capítulo"
                  disabled={hasKnownTotal && readChapters === totalChapters}
                >
                  <FiPlus aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.trackerField}>
              <label htmlFor="manga-status">Status</label>
              <CustomSelect
                id="manga-status"
                compact
                value={status}
                onChange={(nextStatus) => {
                  if (nextStatus === "completo" && hasKnownTotal) setReadChapters(totalChapters);
                  setStatus(nextStatus);
                  setSaved(false);
                }}
                options={[{ value: "planejado", label: "Planejo ler" }, { value: "lendo", label: "Lendo" }, { value: "pausado", label: "Pausado" }, { value: "completo", label: "Completo" }, { value: "abandonado", label: "Dropado" }]}
              />
            </div>

            <div className={styles.saveField}>
              <span aria-hidden="true">Ação</span>
              <button type="button" className={styles.saveButton} onClick={saveTracker} disabled={savingProgress}>
                <FiCheck aria-hidden="true" />
                {savingProgress ? "Salvando…" : saved ? "Progresso salvo" : "Salvar progresso"}
              </button>
            </div>

            <div className={styles.trackerHint}>
              <MdOutlineAutoAwesome aria-hidden="true" />
              <span>
                Ao concluir um capítulo, seu progresso é atualizado aqui.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
    </section>
  );
}

export { MangaTrackerPanel };
