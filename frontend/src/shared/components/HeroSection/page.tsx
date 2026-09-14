"use client";

// Imports Principais
import { useEffect, useState } from "react";

// Style Sheet CSS
import styles from "./herosection.module.css";

import { useAuth } from "@/shared/auth/auth-provider";
import { assetUrl } from "@/shared/auth/api";
import {
  entryToLocalTracker,
  getAnimeListEntry,
  removeAnimeListEntry,
  saveAnimeListEntry,
} from "@/shared/tracking/anime-list-api";
import {
  getPublicationListEntry,
  publicationEntryToLocalTracker,
  removePublicationListEntry,
  savePublicationListEntry,
  type PublicationMedium,
} from "@/shared/tracking/publication-list-api";
import type { EntityInfo } from "@/shared/types/entities";
import { getEntityTitle, isWork } from "@/shared/types/entities";

// Icons
import { TbAlignJustified, TbPlaylistAdd, TbPlaylistX } from "react-icons/tb";
import { MdOutlineFavoriteBorder } from "react-icons/md";

type HeroSectionProps = {
  entity: EntityInfo;
  animeTracker?: {
    workKey: string;
    seasons: Array<{ id: number; episodes: number }>;
  };
  publicationTracker?: {
    workKey: string;
    medium: PublicationMedium;
  };
};

function HeroSection({ entity, animeTracker, publicationTracker }: HeroSectionProps) {
  const { user, accessToken } = useAuth();
  const [isInList, setIsInList] = useState(false);
  const [addingToList, setAddingToList] = useState(false);
  const [removingFromList, setRemovingFromList] = useState(false);
  const entityIsWork = isWork(entity);
  const entityHasFlexibleCover = entity.entityType === "music_artist"
    || (entity.entityType === "organization" && entity.organizationType === "studio");
  const alternativeTitles = entityIsWork ? entity.alternativeTitles ?? [] : [];
  const alternativeTitleLabels = {
    JAPANESE: "Japonês",
    ROMAJI: "Romaji",
    ENGLISH: "Inglês",
    PORTUGUESE: "Português",
    LITERAL: "Literal",
    OTHER: "Outro",
  } as const;

  useEffect(() => {
    let active = true;
    const animationFrame = window.requestAnimationFrame(() => {
      if (!user || !accessToken || (!animeTracker && !publicationTracker)) {
        setIsInList(false);
        return;
      }

      if (publicationTracker) {
        const storageKey = `otakulist:publication-tracker:${user.id}:${publicationTracker.medium}:${publicationTracker.workKey}`;
        void getPublicationListEntry(publicationTracker.medium, publicationTracker.workKey, accessToken)
          .then((entry) => {
            if (!active) return;
            if (!entry) {
              setIsInList(false);
              return;
            }
            window.localStorage.setItem(storageKey, JSON.stringify(publicationEntryToLocalTracker(entry)));
            setIsInList(true);
            window.dispatchEvent(new CustomEvent("otakulist:publication-tracker-updated", { detail: storageKey }));
          })
          .catch(() => {
            if (active) setIsInList(Boolean(window.localStorage.getItem(storageKey)));
          });
        return;
      }

      if (!animeTracker) return;
      const storageKey = `otakulist:anime-tracker:${user.id}:${animeTracker.workKey}`;
      const storedTracker = window.localStorage.getItem(storageKey);
      void getAnimeListEntry(animeTracker.workKey, accessToken).then(async (entry) => {
        if (!active) return;
        if (entry) {
          window.localStorage.setItem(storageKey, JSON.stringify(entryToLocalTracker(entry)));
          setIsInList(true);
          window.dispatchEvent(new CustomEvent("otakulist:anime-tracker-updated", { detail: storageKey }));
          return;
        }
        if (!storedTracker) {
          setIsInList(false);
          return;
        }
        try {
          const local = JSON.parse(storedTracker) as { isAdded?: boolean; status?: string; score?: string; seasonProgress?: Record<number, number> };
          if (local.isAdded === false) return;
          const migrated = await saveAnimeListEntry(animeTracker.workKey, accessToken, {
            status: local.status ?? "planejado",
            score: local.score ?? "",
            seasonProgress: local.seasonProgress ?? Object.fromEntries(animeTracker.seasons.map((season) => [season.id, 0])),
          });
          if (!active) return;
          window.localStorage.setItem(storageKey, JSON.stringify(entryToLocalTracker(migrated)));
          setIsInList(true);
        } catch {
          window.localStorage.removeItem(storageKey);
          setIsInList(false);
        }
      }).catch(() => {
        if (active && storedTracker) setIsInList(true);
      });
    });

    return () => { active = false; window.cancelAnimationFrame(animationFrame); };
  }, [accessToken, animeTracker, publicationTracker, user]);

  const addAnimeToList = async () => {
    if (!user || !accessToken || !animeTracker || isInList || addingToList) return;
    setAddingToList(true);
    const storageKey = `otakulist:anime-tracker:${user.id}:${animeTracker.workKey}`;
    const seasonProgress = Object.fromEntries(
      animeTracker.seasons.map((season) => [season.id, 0]),
    );
    try {
      const entry = await saveAnimeListEntry(animeTracker.workKey, accessToken, { status: "planejado", score: "", seasonProgress });
      window.localStorage.setItem(storageKey, JSON.stringify(entryToLocalTracker(entry)));
      setIsInList(true);
      window.dispatchEvent(new CustomEvent("otakulist:anime-tracker-updated", { detail: storageKey }));
    } catch {
      setIsInList(false);
    } finally {
      setAddingToList(false);
    }
  };

  const removeAnimeFromList = async () => {
    if (!user || !accessToken || !animeTracker || !isInList || removingFromList) return;
    setRemovingFromList(true);
    const storageKey = `otakulist:anime-tracker:${user.id}:${animeTracker.workKey}`;
    try {
      await removeAnimeListEntry(animeTracker.workKey, accessToken);
      window.localStorage.removeItem(storageKey);
      setIsInList(false);
      window.dispatchEvent(new CustomEvent("otakulist:anime-tracker-updated", { detail: storageKey }));
    } finally {
      setRemovingFromList(false);
    }
  };

  const addPublicationToList = async () => {
    if (!user || !accessToken || !publicationTracker || isInList || addingToList) return;
    setAddingToList(true);
    const storageKey = `otakulist:publication-tracker:${user.id}:${publicationTracker.medium}:${publicationTracker.workKey}`;
    try {
      const entry = await savePublicationListEntry(
        publicationTracker.medium,
        publicationTracker.workKey,
        accessToken,
        { status: "planejado", readChapters: 0 },
      );
      window.localStorage.setItem(storageKey, JSON.stringify(publicationEntryToLocalTracker(entry)));
      setIsInList(true);
      window.dispatchEvent(new CustomEvent("otakulist:publication-tracker-updated", { detail: storageKey }));
    } catch {
      setIsInList(false);
    } finally {
      setAddingToList(false);
    }
  };

  const removePublicationFromList = async () => {
    if (!user || !accessToken || !publicationTracker || !isInList || removingFromList) return;
    setRemovingFromList(true);
    const storageKey = `otakulist:publication-tracker:${user.id}:${publicationTracker.medium}:${publicationTracker.workKey}`;
    try {
      await removePublicationListEntry(publicationTracker.medium, publicationTracker.workKey, accessToken);
      window.localStorage.removeItem(storageKey);
      setIsInList(false);
      window.dispatchEvent(new CustomEvent("otakulist:publication-tracker-updated", { detail: storageKey }));
    } finally {
      setRemovingFromList(false);
    }
  };

  const hasListTracker = Boolean(animeTracker || publicationTracker);
  const toggleList = animeTracker
    ? (isInList ? removeAnimeFromList : addAnimeToList)
    : publicationTracker
      ? (isInList ? removePublicationFromList : addPublicationToList)
      : undefined;

  return (
    <div className={styles.heroSectionContainer}>
      <section className={styles.heroSection}>
        {/* Container da Esquerda: Capa e Botões */}
        {entityHasFlexibleCover ? (
          <div className={styles.flexibleImageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.flexibleImage} src={assetUrl(entity.cover) ?? entity.cover} alt={getEntityTitle(entity)} />
          </div>
        ) : (
          <div className={styles.coverContainer}>
            <div className={styles.imageWrapper}>
              {/* A proporção vem do arquivo; dimensões HTML fixas forçariam novamente 2:3. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.cover}
                src={assetUrl(entity.cover) ?? entity.cover}
                alt={`${getEntityTitle(entity)} Cover`}
              />
            </div>

            {entityIsWork ? (
            <>
              <div className={styles.buttons}>
                <button
                  className={`${styles.btnAddList} ${isInList ? styles.btnInList : ""} ${removingFromList ? styles.btnRemoving : ""}`}
                  type="button"
                  onClick={toggleList}
                  disabled={Boolean(hasListTracker && (!user || addingToList || removingFromList))}
                  aria-label={isInList ? "Remover da lista" : "Adicionar à lista"}
                >
                  {isInList ? (
                    <>
                      <span className={styles.listAddedState}>
                        <TbAlignJustified size={18} aria-hidden="true" />
                        <span>Na minha lista</span>
                      </span>
                      <span className={styles.listRemoveState}>
                        <TbPlaylistX size={22} aria-hidden="true" />
                        <span>{removingFromList ? "Removendo…" : "Remover"}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <TbPlaylistAdd size={22} aria-hidden="true" />
                      <span>{addingToList ? "Adicionando…" : "Adicionar"}</span>
                    </>
                  )}
                </button>

                <button
                  className={styles.btnAddFavorite}
                  aria-label="Adicionar aos favoritos"
                  title="Adicionar aos favoritos"
                >
                  <MdOutlineFavoriteBorder size={20} aria-hidden="true" />
                </button>
              </div>
            </>
            ) : (
              <></>
            )}
          </div>
        )}

        {/* Container da Direita: Textos e Sinônimos */}
        <div className={styles.textsContainer}>
          <div className={styles.texts}>
            <h1 className={styles.title}>
              {getEntityTitle(entity)}
            </h1>
            <p className={styles.description}>{entity.description}</p>
          </div>

          {entityIsWork ? (
            <>
              <hr className={styles.hrFaded} />

              <div className={styles.synonymsContainer}>
                <h2 className={styles.synonymsTitle}>Títulos Alternativos</h2>
                <div className={styles.synonymsList}>
                  {alternativeTitles.map((item, index) => (
                    <span key={`${item.type}-${item.title}`}>
                      {index > 0 && <span className={styles.separator}> | </span>}
                      <span className={styles.synonym}>{alternativeTitleLabels[item.type]}: {item.title}</span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </section>
    </div>
  );
}

export { HeroSection };
