"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { FiCalendar, FiClock, FiInfo, FiX } from "react-icons/fi";
import { LiaCanadianMapleLeaf } from "react-icons/lia";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { PiFilmSlate, PiTelevisionSimple } from "react-icons/pi";
import { TbProgressCheck, TbWorld } from "react-icons/tb";

import styles from "./season.module.css";

type AnimeSeason = {
  id: number;
  title: string;
  label: string;
  cover: string;
  episodes: number;
  watchedEpisodes: number;
  status: string;
  format: string;
  start: string;
  end: string;
  duration: string;
  studio: string;
  director: string;
  broadcastSeason: string;
  source: string;
  synopsis: string;
};

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
                    <span className={styles.infoIcon}><LiaCanadianMapleLeaf size={18} aria-hidden="true" /></span>
                    <span className={styles.seasonInfo}>{season.label}</span>
                  </span>
                  <span className={styles.infoLine}>
                    <span className={styles.infoIcon}><MdOutlineVideoLibrary size={16} aria-hidden="true" /></span>
                    <span className={styles.seasonInfo}>{season.episodes} Episódios</span>
                  </span>
                  <span className={styles.infoLine}>
                    <span className={styles.infoIcon}><TbProgressCheck size={16} aria-hidden="true" /></span>
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
                <span style={{ width: `${(selectedSeason.watchedEpisodes / selectedSeason.episodes) * 100}%` }} />
              </div>
              <small>Este progresso faz parte do total da obra principal.</small>
            </div>

            <dl className={styles.seasonDetails}>
              <div><dt><PiTelevisionSimple aria-hidden="true" />Formato</dt><dd>{selectedSeason.format}</dd></div>
              <div><dt><MdOutlineVideoLibrary aria-hidden="true" />Episódios</dt><dd>{selectedSeason.episodes}</dd></div>
              <div><dt><FiClock aria-hidden="true" />Duração</dt><dd>{selectedSeason.duration}</dd></div>
              <div><dt><TbProgressCheck aria-hidden="true" />Status</dt><dd>{selectedSeason.status}</dd></div>
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
