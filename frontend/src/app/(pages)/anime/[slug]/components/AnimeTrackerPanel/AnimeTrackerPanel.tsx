"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiEdit3,
  FiLock,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { LuListTree } from "react-icons/lu";

import type { AnimeSeason } from "@/shared/components/SeasonSection/page";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import { useAuth } from "@/shared/auth/auth-provider";
import { entryToLocalTracker, saveAnimeListEntry } from "@/shared/tracking/anime-list-api";
import styles from "../../animeslug.module.css";

interface AnimeTrackerPanelProps {
  seasons: AnimeSeason[];
  workKey: string;
}

const statusLabels: Record<string, string> = {
  planejado: "Planejo assistir",
  assistindo: "Assistindo",
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

function AnimeTrackerPanel({ seasons, workKey }: AnimeTrackerPanelProps) {
  const { user, accessToken } = useAuth();
  const isAuthenticated = Boolean(user);
  const [seasonProgress, setSeasonProgress] = useState<Record<number, number>>(
    () => Object.fromEntries(seasons.map((season) => [season.id, season.watchedEpisodes])),
  );
  const [selectedSeasonId, setSelectedSeasonId] = useState(
    seasons.find((season) => season.watchedEpisodes < season.episodes)?.id ??
      seasons[seasons.length - 1]?.id,
  );
  const [status, setStatus] = useState("planejado");
  const [isAdded, setIsAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    const hydrateTracker = () => {
      const emptyProgress = Object.fromEntries(
        seasons.map((season) => [season.id, 0]),
      );
      setSeasonProgress(emptyProgress);
      setSelectedSeasonId(seasons[0]?.id);
      setStatus("planejado");
      setIsAdded(false);
      setSaved(false);

      if (!user) return;

      const storageKey = `otakulist:anime-tracker:${user.id}:${workKey}`;
      const storedTracker = window.localStorage.getItem(storageKey);

      if (!storedTracker) return;

      try {
        const parsedTracker = JSON.parse(storedTracker) as {
          seasonProgress?: Record<number, number>;
          watchedEpisodes?: number;
          status?: string;
          isAdded?: boolean;
        };

        if (parsedTracker.isAdded === false) return;

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
        setStatus(parsedTracker.status ?? "planejado");
        setIsAdded(true);
        setSaved(true);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    };

    const animationFrame = window.requestAnimationFrame(hydrateTracker);
    const handleTrackerUpdate = (event: Event) => {
      if (!user) return;
      const storageKey = `otakulist:anime-tracker:${user.id}:${workKey}`;
      if (event instanceof CustomEvent && event.detail === storageKey) {
        hydrateTracker();
      }
    };
    window.addEventListener("otakulist:anime-tracker-updated", handleTrackerUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("otakulist:anime-tracker-updated", handleTrackerUpdate);
    };
  }, [seasons, user, workKey]);

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
  const selectedSeasonIndex = selectedSeason
    ? seasons.findIndex((season) => season.id === selectedSeason.id)
    : -1;
  const previousSeason = seasons[selectedSeasonIndex - 1];
  const canDecreaseEpisodes =
    selectedWatchedEpisodes > 0 ||
    Boolean(previousSeason && (seasonProgress[previousSeason.id] ?? 0) > 0);

  const changeEpisodes = (amount: number) => {
    if (!selectedSeason) return;
    setSaved(false);
    setSeasonProgress((current) => {
      const currentSeasonProgress = current[selectedSeason.id] ?? 0;

      if (amount < 0 && currentSeasonProgress === 0) {
        const currentSeasonIndex = seasons.findIndex(
          (season) => season.id === selectedSeason.id,
        );
        const previousSeason = seasons[currentSeasonIndex - 1];
        const previousSeasonProgress = previousSeason
          ? current[previousSeason.id] ?? 0
          : 0;

        if (!previousSeason || previousSeasonProgress === 0) return current;

        setSelectedSeasonId(previousSeason.id);
        return {
          ...current,
          [previousSeason.id]: previousSeasonProgress - 1,
        };
      }

      const nextSeasonProgress = Math.min(
        selectedSeason.episodes,
        Math.max(0, currentSeasonProgress + amount),
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

  const saveTracker = async () => {
    if (!user || !accessToken || savingProgress) return;
    setSavingProgress(true);
    const storageKey = `otakulist:anime-tracker:${user.id}:${workKey}`;
    try {
      const entry = await saveAnimeListEntry(workKey, accessToken, { seasonProgress, status });
      window.localStorage.setItem(storageKey, JSON.stringify(entryToLocalTracker(entry)));
      window.dispatchEvent(new CustomEvent("otakulist:anime-tracker-updated", { detail: storageKey }));
      setIsAdded(true);
      setSaved(true);
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
            <strong>Acompanhar anime</strong>
          </span>
        </div>

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
            <span
              className={watchedEpisodes === totalEpisodes ? styles.progressComplete : undefined}
              style={getProgressStyle(progress)}
            />
          </div>
        </div>

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          aria-controls="anime-tracker-editor"
        >
          <FiEdit3 aria-hidden="true" />
          <span>{isExpanded ? "Fechar edição" : "Editar progresso"}</span>
          <FiChevronDown
            className={isExpanded ? styles.chevronExpanded : undefined}
            aria-hidden="true"
          />
        </button>
      </div>

      {isExpanded && (
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
                        <span
                          className={
                            isComplete
                              ? styles.progressComplete
                              : seasonWatched === 0
                                ? styles.progressEmpty
                                : undefined
                          }
                          style={getProgressStyle((seasonWatched / season.episodes) * 100)}
                        />
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
                <span
                  className={selectedWatchedEpisodes === (selectedSeason?.episodes ?? 0) ? styles.progressComplete : undefined}
                  style={getProgressStyle(selectedProgress)}
                />
              </div>
              <div className={styles.episodeControls}>
                <button
                  type="button"
                  onClick={() => changeEpisodes(-1)}
                  aria-label="Diminuir um episódio"
                  disabled={!canDecreaseEpisodes}
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
              <CustomSelect
                id="anime-status"
                compact
                value={status}
                onChange={(nextStatus) => {
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
                options={[{ value: "planejado", label: "Planejo assistir" }, { value: "assistindo", label: "Assistindo" }, { value: "pausado", label: "Pausado" }, { value: "completo", label: "Completo" }, { value: "abandonado", label: "Dropado" }]}
              />
            </div>

            <div className={styles.saveField}>
              <span aria-hidden="true">Ação</span>
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => void saveTracker()}
                disabled={savingProgress}
              >
                <FiCheck aria-hidden="true" />
                {savingProgress ? "Salvando…" : saved ? "Progresso salvo" : "Salvar progresso"}
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
    </section>
  );
}

export { AnimeTrackerPanel };
