"use client";

import { useEffect, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiEdit3,
  FiLogIn,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { TbPlaylist } from "react-icons/tb";

import styles from "../../mangaslug.module.css";

interface MangaTrackerPanelProps {
  totalChapters: number;
  isAuthenticated?: boolean;
}

const statusLabels: Record<string, string> = {
  planejado: "Planejo ler",
  lendo: "Lendo",
  pausado: "Pausado",
  completo: "Completo",
  abandonado: "Abandonado",
};

function MangaTrackerPanel({
  totalChapters,
  isAuthenticated = false,
}: MangaTrackerPanelProps) {
  const [readChapters, setReadChapters] = useState(42);
  const [status, setStatus] = useState("lendo");
  const [score, setScore] = useState("8");
  const [saved, setSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const hydrateTracker = () => {
      const storedTracker = window.localStorage.getItem(
        "otakulist:manga-tracker",
      );

      if (!storedTracker) return;

      try {
        const parsedTracker = JSON.parse(storedTracker) as {
          readChapters?: number;
          status?: string;
          score?: string;
        };

        setReadChapters(
          Math.min(
            totalChapters,
            Math.max(0, parsedTracker.readChapters ?? 42),
          ),
        );
        setStatus(parsedTracker.status ?? "lendo");
        setScore(parsedTracker.score ?? "8");
        setSaved(true);
      } catch {
        window.localStorage.removeItem("otakulist:manga-tracker");
      }
    };

    const animationFrame = window.requestAnimationFrame(hydrateTracker);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [totalChapters]);

  const progress = Math.round((readChapters / totalChapters) * 100);

  const changeChapters = (amount: number) => {
    setSaved(false);
    setReadChapters((current) =>
      Math.min(totalChapters, Math.max(0, current + amount)),
    );
  };

  const saveTracker = () => {
    window.localStorage.setItem(
      "otakulist:manga-tracker",
      JSON.stringify({ readChapters, status, score }),
    );
    setSaved(true);
    setIsExpanded(false);
  };

  return (
    <div className={styles.trackerWrapper}>
      <div className={styles.trackerSummary}>
        <div className={styles.trackerIdentity}>
          <span className={styles.trackerIcon}>
            <TbPlaylist aria-hidden="true" />
          </span>
          <span>
            <small>Minha lista</small>
            <strong>Acompanhar manga</strong>
          </span>
        </div>

        {isAuthenticated ? (
          <>
            <div className={styles.trackerStatus}>
              <small>Status</small>
              <strong>{statusLabels[status]}</strong>
            </div>

            <div className={styles.summaryProgress}>
              <div>
                <span>{progress}% concluído</span>
                <strong>
                  {readChapters}/{totalChapters} capítulos
                </strong>
              </div>
              <div className={styles.summaryProgressTrack} aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </>
        ) : (
          <p className={styles.loginMessage}>
            Entre para salvar capítulos, status e sua nota.
          </p>
        )}

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => {
            if (isAuthenticated) setIsExpanded((current) => !current);
          }}
          aria-expanded={isAuthenticated ? isExpanded : undefined}
          aria-controls={isAuthenticated ? "manga-tracker-editor" : undefined}
        >
          {isAuthenticated ? (
            <>
              <FiEdit3 aria-hidden="true" />
              <span>{isExpanded ? "Fechar edição" : "Editar progresso"}</span>
              <FiChevronDown
                className={isExpanded ? styles.chevronExpanded : undefined}
                aria-hidden="true"
              />
            </>
          ) : (
            <>
              <FiLogIn aria-hidden="true" />
              <span>Entrar para acompanhar</span>
            </>
          )}
        </button>
      </div>

      {isAuthenticated && isExpanded && (
        <div id="manga-tracker-editor" className={styles.trackerEditor}>
          <div className={styles.trackerPanel}>
            <div className={styles.progressArea}>
              <div className={styles.progressMeta}>
                <div>
                  <strong>{progress}% concluído</strong>
                  <span>Continue de onde parou</span>
                </div>
                <span className={styles.episodeCount}>
                  {readChapters} / {totalChapters} caps.
                </span>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label="Progresso dos capítulos"
                aria-valuemin={0}
                aria-valuemax={totalChapters}
                aria-valuenow={readChapters}
              >
                <span style={{ width: `${progress}%` }} />
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
                  disabled={readChapters === totalChapters}
                >
                  <FiPlus aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.trackerField}>
              <label htmlFor="manga-status">Status</label>
              <select
                id="manga-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setSaved(false);
                }}
              >
                <option value="planejado">Planejo ler</option>
                <option value="lendo">Lendo</option>
                <option value="pausado">Pausado</option>
                <option value="completo">Completo</option>
                <option value="abandonado">Abandonado</option>
              </select>
            </div>

            <div className={styles.trackerField}>
              <label htmlFor="manga-score">Minha nota</label>
              <select
                id="manga-score"
                value={score}
                onChange={(event) => {
                  setScore(event.target.value);
                  setSaved(false);
                }}
              >
                <option value="">Sem nota</option>
                {Array.from({ length: 10 }, (_, index) => index + 1).map(
                  (value) => (
                    <option value={value} key={value}>
                      {value} / 10
                    </option>
                  ),
                )}
              </select>
            </div>

            <button
              type="button"
              className={styles.saveButton}
              onClick={saveTracker}
            >
              <FiCheck aria-hidden="true" />
              {saved ? "Progresso salvo" : "Salvar progresso"}
            </button>

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
  );
}

export { MangaTrackerPanel };
