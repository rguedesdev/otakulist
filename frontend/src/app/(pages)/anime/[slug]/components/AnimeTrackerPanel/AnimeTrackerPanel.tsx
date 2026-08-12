"use client";

import { useEffect, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiEdit3,
  FiLogIn,
  FiLock,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { TbPlaylist } from "react-icons/tb";

import type { AnimeSeason } from "@/shared/components/SeasonSection/page";
import styles from "../../animeslug.module.css";

interface AnimeTrackerPanelProps {
  seasons: AnimeSeason[];
  isAuthenticated?: boolean;
}

const statusLabels: Record<string, string> = {
  planejado: "Planejo assistir",
  assistindo: "Assistindo",
  pausado: "Pausado",
  completo: "Completo",
  abandonado: "Abandonado",
};

function AnimeTrackerPanel({
  seasons,
  isAuthenticated = false,
}: AnimeTrackerPanelProps) {
  const [seasonProgress, setSeasonProgress] = useState<Record<number, number>>(
    () => Object.fromEntries(seasons.map((season) => [season.id, season.watchedEpisodes])),
  );
  const [selectedSeasonId, setSelectedSeasonId] = useState(
    seasons.find((season) => season.watchedEpisodes < season.episodes)?.id ??
      seasons[seasons.length - 1]?.id,
  );
  const [status, setStatus] = useState("assistindo");
  const [score, setScore] = useState("8");
  const [saved, setSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const hydrateTracker = () => {
      const storedTracker = window.localStorage.getItem(
        "otakulist:anime-tracker",
      );

      if (!storedTracker) return;

      try {
        const parsedTracker = JSON.parse(storedTracker) as {
          seasonProgress?: Record<number, number>;
          watchedEpisodes?: number;
          status?: string;
          score?: string;
        };

        if (parsedTracker.seasonProgress) {
          const hydratedProgress = Object.fromEntries(
            seasons.map((season) => [
                season.id,
                Math.min(
                  season.episodes,
                  Math.max(0, parsedTracker.seasonProgress?.[season.id] ?? season.watchedEpisodes),
                ),
              ]),
          );
          setSeasonProgress(hydratedProgress);
          setSelectedSeasonId(
            seasons.find((season) => hydratedProgress[season.id] < season.episodes)?.id ??
              seasons[seasons.length - 1]?.id,
          );
        } else if (parsedTracker.watchedEpisodes !== undefined) {
          let remainingEpisodes = parsedTracker.watchedEpisodes;
          const migratedProgress = Object.fromEntries(
            seasons.map((season) => {
                const watched = Math.min(season.episodes, Math.max(0, remainingEpisodes));
                remainingEpisodes -= watched;
                return [season.id, watched];
              }),
          );
          setSeasonProgress(migratedProgress);
          setSelectedSeasonId(
            seasons.find((season) => migratedProgress[season.id] < season.episodes)?.id ??
              seasons[seasons.length - 1]?.id,
          );
        }
        setStatus(parsedTracker.status ?? "assistindo");
        setScore(parsedTracker.score ?? "8");
        setSaved(true);
      } catch {
        window.localStorage.removeItem("otakulist:anime-tracker");
      }
    };

    const animationFrame = window.requestAnimationFrame(hydrateTracker);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [seasons]);

  const totalEpisodes = seasons.reduce((total, season) => total + season.episodes, 0);
  const watchedEpisodes = seasons.reduce(
    (total, season) => total + (seasonProgress[season.id] ?? 0),
    0,
  );
  const progress = Math.round((watchedEpisodes / totalEpisodes) * 100);
  const activeSeason =
    seasons.find((season) => (seasonProgress[season.id] ?? 0) < season.episodes) ??
    seasons[seasons.length - 1];
  const selectedSeason =
    seasons.find((season) => season.id === selectedSeasonId) ?? activeSeason;
  const selectedWatchedEpisodes = selectedSeason ? seasonProgress[selectedSeason.id] ?? 0 : 0;
  const selectedProgress = selectedSeason
    ? Math.round((selectedWatchedEpisodes / selectedSeason.episodes) * 100)
    : 0;

  const changeEpisodes = (amount: number) => {
    if (!selectedSeason) return;
    setSaved(false);
    setSeasonProgress((current) => {
      const nextSeasonProgress = Math.min(
        selectedSeason.episodes,
        Math.max(0, (current[selectedSeason.id] ?? 0) + amount),
      );
      const nextProgress = { ...current, [selectedSeason.id]: nextSeasonProgress };
      const nextTotal = seasons.reduce(
        (total, season) => total + (nextProgress[season.id] ?? 0),
        0,
      );

      if (nextTotal === totalEpisodes) setStatus("completo");
      if (amount > 0 && nextSeasonProgress === selectedSeason.episodes) {
        const nextIncompleteSeason = seasons.find(
          (season) => (nextProgress[season.id] ?? 0) < season.episodes,
        );
        setSelectedSeasonId(nextIncompleteSeason?.id ?? selectedSeason.id);
      }
      if (amount < 0 && nextSeasonProgress === 0) {
        const selectedSeasonIndex = seasons.findIndex(
          (season) => season.id === selectedSeason.id,
        );
        const previousSeason = seasons[selectedSeasonIndex - 1];
        setSelectedSeasonId(previousSeason?.id ?? selectedSeason.id);
      }
      return nextProgress;
    });
    if (status === "completo" && amount < 0) setStatus("assistindo");
  };

  const saveTracker = () => {
    window.localStorage.setItem(
      "otakulist:anime-tracker",
      JSON.stringify({ seasonProgress, watchedEpisodes, status, score }),
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
            <strong>Acompanhar anime</strong>
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
                  {watchedEpisodes}/{totalEpisodes} episódios
                </strong>
              </div>
              <div className={styles.summaryProgressTrack} aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </>
        ) : (
          <p className={styles.loginMessage}>
            Entre para salvar episódios, status e sua nota.
          </p>
        )}

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => {
            if (isAuthenticated) setIsExpanded((current) => !current);
          }}
          aria-expanded={isAuthenticated ? isExpanded : undefined}
          aria-controls={isAuthenticated ? "anime-tracker-editor" : undefined}
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
        <div id="anime-tracker-editor" className={styles.trackerEditor}>
          <div className={styles.trackerPanel}>
            <div className={styles.seasonProgressSelector}>
              <div className={styles.seasonSelectorHeading}>
                <div>
                  <strong>Progresso por temporada</strong>
                  <span>A próxima temporada é liberada ao concluir a atual</span>
                </div>
                <small>{seasons.length} temporadas · {watchedEpisodes}/{totalEpisodes} episódios no total</small>
              </div>
              <div className={styles.seasonSelectorList}>
                {seasons.map((season, seasonIndex) => {
                  const seasonWatched = seasonProgress[season.id] ?? 0;
                  const isCurrent = season.id === activeSeason?.id && seasonWatched < season.episodes;
                  const isComplete = seasonWatched === season.episodes;
                  const isSelected = season.id === selectedSeason?.id;
                  const hasLaterProgress = seasons
                    .slice(seasonIndex + 1)
                    .some((laterSeason) => (seasonProgress[laterSeason.id] ?? 0) > 0);
                  const canReviewCompletedSeason = isComplete && !hasLaterProgress;
                  const isLocked = !isCurrent && !canReviewCompletedSeason;
                  return (
                    <button
                      className={`${isCurrent ? styles.seasonSelectorActive : ""} ${isSelected && !isCurrent ? styles.seasonSelectorSelected : ""}`}
                      type="button"
                      key={season.id}
                      disabled={isLocked}
                      onClick={() => setSelectedSeasonId(season.id)}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-pressed={isSelected}
                    >
                      <span>{season.label}</span>
                      <strong className={isComplete ? styles.seasonCompleteState : styles.seasonLockedState}>
                        {isComplete ? <FiCheck aria-hidden="true" /> : isLocked ? <FiLock aria-hidden="true" /> : null}
                        {isComplete ? "Concluída" : isCurrent ? `${seasonWatched}/${season.episodes}` : "Bloqueada"}
                      </strong>
                      <span className={styles.seasonMiniTrack} aria-hidden="true">
                        <span style={{ width: `${(seasonWatched / season.episodes) * 100}%` }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.progressArea}>
              <div className={styles.progressMeta}>
                <div>
                  <strong>{selectedSeason?.label}</strong>
                  <span>{selectedProgress}% concluído nesta temporada</span>
                </div>
                <span className={styles.episodeCount}>
                  {selectedWatchedEpisodes} / {selectedSeason?.episodes ?? 0} eps.
                </span>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label={`Progresso da ${selectedSeason?.label ?? "temporada"}`}
                aria-valuemin={0}
                aria-valuemax={selectedSeason?.episodes ?? 0}
                aria-valuenow={selectedWatchedEpisodes}
              >
                <span style={{ width: `${selectedProgress}%` }} />
              </div>
              <div className={styles.episodeControls}>
                <button
                  type="button"
                  onClick={() => changeEpisodes(-1)}
                  aria-label="Diminuir um episódio"
                  disabled={selectedWatchedEpisodes === 0}
                >
                  <FiMinus aria-hidden="true" />
                </button>
                <span>Episódios assistidos</span>
                <button
                  type="button"
                  onClick={() => changeEpisodes(1)}
                  aria-label="Adicionar um episódio"
                  disabled={selectedWatchedEpisodes === selectedSeason?.episodes}
                >
                  <FiPlus aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.trackerField}>
              <label htmlFor="anime-status">Status</label>
              <select
                id="anime-status"
                value={status}
                onChange={(event) => {
                  const nextStatus = event.target.value;
                  if (nextStatus === "completo" && selectedSeason) {
                    const completedSeasonProgress = {
                      ...seasonProgress,
                      [selectedSeason.id]: selectedSeason.episodes,
                    };
                    const completedEpisodes = seasons.reduce(
                      (total, season) =>
                        total + (completedSeasonProgress[season.id] ?? 0),
                      0,
                    );
                    const nextIncompleteSeason = seasons.find(
                      (season) =>
                        (completedSeasonProgress[season.id] ?? 0) < season.episodes,
                    );

                    setSeasonProgress(completedSeasonProgress);
                    setSelectedSeasonId(
                      nextIncompleteSeason?.id ?? selectedSeason.id,
                    );
                    setStatus(
                      completedEpisodes === totalEpisodes
                        ? "completo"
                        : "assistindo",
                    );
                  } else {
                    setStatus(nextStatus);
                  }
                  setSaved(false);
                }}
              >
                <option value="planejado">Planejo assistir</option>
                <option value="assistindo">Assistindo</option>
                <option value="pausado">Pausado</option>
                <option value="completo">Completo</option>
                <option value="abandonado">Abandonado</option>
              </select>
            </div>

            <div className={styles.trackerField}>
              <label htmlFor="anime-score">Minha nota</label>
              <select
                id="anime-score"
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

            <div className={styles.saveField}>
              <span aria-hidden="true">Ação</span>
              <button
                type="button"
                className={styles.saveButton}
                onClick={saveTracker}
              >
                <FiCheck aria-hidden="true" />
                {saved ? "Progresso salvo" : "Salvar progresso"}
              </button>
            </div>

            <div className={styles.trackerHint}>
              <MdOutlineAutoAwesome aria-hidden="true" />
              <span>
                Cada temporada contribui para o progresso único desta obra na sua lista.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AnimeTrackerPanel };
