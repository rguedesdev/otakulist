"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { FiActivity, FiCalendar, FiClock, FiInfo, FiX } from "react-icons/fi";
import { LiaCanadianMapleLeaf } from "react-icons/lia";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { PiFilmSlate, PiTelevisionSimple } from "react-icons/pi";
import { TbProgressCheck, TbWorld } from "react-icons/tb";

import styles from "./season.module.css";
import type { AnimeReleaseFormat } from "@/shared/types/entities";
import { animeReleaseFormatLabels } from "@/shared/types/entities";

type AnimeSeason = {
  id: number;
  title: string;
  label: string;
  cover: string;
  episodes: number;
  watchedEpisodes: number;
  status: string;
  releaseFormat: AnimeReleaseFormat;
  start: string;
  end: string;
  duration: string;
  studio: string;
  director: string;
  broadcastSeason: string;
  source: string;
  synopsis: string;
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

function SeasonSection({ seasons }: { seasons: AnimeSeason[] }) {
  const [selectedSeason, setSelectedSeason] = useState<AnimeSeason | null>(null);

  useEffect(() => {
    if (!selectedSeason) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSeason(null);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedSeason]);

  const selectedProgress = selectedSeason
    ? (selectedSeason.watchedEpisodes / selectedSeason.episodes) * 100
    : 0;

  return (
    <section className={styles.seasonsContainer}>
      <h2 className={styles.seasonSectionTitle}>Temporadas</h2>
      <div className={styles.seasonCardsContainer}>
        {seasons.map((season) => (
          <button
            className={styles.seasonCard}
            type="button"
            key={season.id}
            onClick={() => setSelectedSeason(season)}
            aria-haspopup="dialog"
          >
            <Image
              className={styles.seasonCover}
              src={season.cover}
              alt={`${season.title} ${season.label}`}
              width={90}
              height={130}
              unoptimized
              priority
            />
            <span className={styles.seasonTextsContainer}>
              <span className={styles.seasonTexts}>
                <strong className={styles.seasonTitle}>{season.title}</strong>
                <span className={styles.infoGroup}>
                  <span className={styles.infoLine}>
                    <span className={styles.infoIcon}><LiaCanadianMapleLeaf size={17} aria-hidden="true" /></span>
                    <span className={styles.seasonInfo}>{season.label}</span>
                  </span>
                  <span className={styles.infoLine}>
                    <span className={styles.infoIcon}><MdOutlineVideoLibrary size={15} aria-hidden="true" /></span>
                    <span className={styles.seasonInfo}>{season.episodes} Episódios</span>
                  </span>
                  <span className={styles.infoLine}>
                    <span className={styles.infoIcon}><TbProgressCheck size={15} aria-hidden="true" /></span>
                    <span className={styles.seasonInfo}>Progresso: {String(season.watchedEpisodes).padStart(2, "0")}/{season.episodes}</span>
                  </span>
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {selectedSeason && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelectedSeason(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="season-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className={styles.closeButton} type="button" onClick={() => setSelectedSeason(null)} aria-label="Fechar detalhes da temporada">
              <FiX aria-hidden="true" />
            </button>

            <header className={styles.modalHeader}>
              <Image className={styles.modalCover} src={selectedSeason.cover} alt={`${selectedSeason.title} ${selectedSeason.label}`} width={150} height={220} unoptimized />
              <div className={styles.modalIntroduction}>
                <span className={styles.seasonBadge}>{selectedSeason.label}</span>
                <h2 id="season-modal-title">{selectedSeason.title}</h2>
                <p>{selectedSeason.synopsis}</p>
              </div>
            </header>

            <div className={styles.modalProgress}>
              <div>
                <span><TbProgressCheck aria-hidden="true" />Progresso desta temporada</span>
                <strong>{selectedSeason.watchedEpisodes}/{selectedSeason.episodes} episódios</strong>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <span
                  className={
                    selectedSeason.watchedEpisodes === selectedSeason.episodes
                      ? styles.progressComplete
                      : selectedSeason.watchedEpisodes === 0
                        ? styles.progressEmpty
                        : undefined
                  }
                  style={getProgressStyle(selectedProgress)}
                />
              </div>
              <small>Este progresso faz parte do total da obra principal.</small>
            </div>

            <dl className={styles.seasonDetails}>
              <div><dt><PiTelevisionSimple aria-hidden="true" />Formato</dt><dd>{animeReleaseFormatLabels[selectedSeason.releaseFormat]}</dd></div>
              <div><dt><MdOutlineVideoLibrary aria-hidden="true" />Episódios</dt><dd>{selectedSeason.episodes}</dd></div>
              <div><dt><FiClock aria-hidden="true" />Duração</dt><dd>{selectedSeason.duration}</dd></div>
              <div><dt><FiActivity aria-hidden="true" />Status</dt><dd>{selectedSeason.status}</dd></div>
              <div><dt><FiCalendar aria-hidden="true" />Exibição</dt><dd>{selectedSeason.start} – {selectedSeason.end}</dd></div>
              <div><dt><LiaCanadianMapleLeaf aria-hidden="true" />Temporada</dt><dd>{selectedSeason.broadcastSeason}</dd></div>
              <div><dt><PiFilmSlate aria-hidden="true" />Estúdio</dt><dd>{selectedSeason.studio}</dd></div>
              <div><dt><FiInfo aria-hidden="true" />Direção</dt><dd>{selectedSeason.director}</dd></div>
              <div><dt><TbWorld aria-hidden="true" />Origem</dt><dd>{selectedSeason.source}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}

export { SeasonSection };
export type { AnimeSeason };
