"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowRight, FiUser, FiX } from "react-icons/fi";
import { LiaMicrophoneSolid } from "react-icons/lia";

import { assetUrl } from "@/shared/auth/api";
import styles from "./character.module.css";

export type CharacterVoiceCredit = {
  character: { id: string; nameRomaji: string; slug: string; imageUrl: string };
  seiyuu: { id: string; displayName: string; slug: string; imageUrl: string | null };
};

function CharacterSection({ credits = [], limit }: { credits?: CharacterVoiceCredit[]; limit?: number }) {
  const [selectedCredit, setSelectedCredit] = useState<CharacterVoiceCredit | null>(null);

  useEffect(() => {
    if (!selectedCredit) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCredit(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedCredit]);

  return (
    <section className={styles.charactersContainer}>
      <h2 className={styles.characterSectionTitle}>Personagens & Seiyuus</h2>
      <div className={styles.characterCardsContainer}>
        {credits.slice(0, limit).map((credit) => (
          <button
            className={styles.characterSeiyuuCard}
            type="button"
            key={`${credit.character.id}-${credit.seiyuu.id}`}
            onClick={() => setSelectedCredit(credit)}
            aria-haspopup="dialog"
          >
            <Image className={styles.characterCover} src={assetUrl(credit.character.imageUrl) ?? credit.character.imageUrl} alt={credit.character.nameRomaji} width={60} height={80} unoptimized />
            <div className={styles.characterInfoContainer}>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}><dd className={styles.characterName}>{credit.character.nameRomaji}</dd></div>
                <div className={styles.infoLine}><dt><LiaMicrophoneSolid size={17} aria-hidden="true" /></dt><dd className={styles.seiyuuName}>{credit.seiyuu.displayName}</dd></div>
              </dl>
            </div>
            {credit.seiyuu.imageUrl ? (
              <Image className={styles.seiyuuCover} src={assetUrl(credit.seiyuu.imageUrl) ?? credit.seiyuu.imageUrl} alt={credit.seiyuu.displayName} width={60} height={80} unoptimized />
            ) : (
              <span className={styles.seiyuuCoverFallback} aria-label={`Sem imagem de ${credit.seiyuu.displayName}`}><FiUser aria-hidden="true" /></span>
            )}
          </button>
        ))}
      </div>

      {selectedCredit && createPortal(
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelectedCredit(null)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-link-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              type="button"
              onClick={() => setSelectedCredit(null)}
              aria-label="Fechar seleção de página"
              autoFocus
            >
              <FiX aria-hidden="true" />
            </button>

            <header className={styles.modalHeader}>
              <span>Personagens &amp; Seiyuus</span>
              <h2 id="character-link-modal-title">Escolha a página</h2>
              <p>Selecione qual dos dois perfis você deseja acessar.</p>
            </header>

            <div className={styles.destinationList}>
              <Link className={styles.destinationCard} href={`/character/${selectedCredit.character.slug}`} onClick={() => setSelectedCredit(null)}>
                <Image src={assetUrl(selectedCredit.character.imageUrl) ?? selectedCredit.character.imageUrl} alt={selectedCredit.character.nameRomaji} width={60} height={80} unoptimized />
                <span className={styles.destinationText}>
                  <small>Personagem</small>
                  <strong>{selectedCredit.character.nameRomaji}</strong>
                </span>
                <FiArrowRight className={styles.destinationArrow} aria-hidden="true" />
              </Link>

              <Link className={styles.destinationCard} href={`/seiyuu/${selectedCredit.seiyuu.slug}`} onClick={() => setSelectedCredit(null)}>
                {selectedCredit.seiyuu.imageUrl ? (
                  <Image src={assetUrl(selectedCredit.seiyuu.imageUrl) ?? selectedCredit.seiyuu.imageUrl} alt={selectedCredit.seiyuu.displayName} width={60} height={80} unoptimized />
                ) : (
                  <span className={styles.destinationFallback}><FiUser aria-hidden="true" /></span>
                )}
                <span className={styles.destinationText}>
                  <small>Seiyuu</small>
                  <strong>{selectedCredit.seiyuu.displayName}</strong>
                </span>
                <FiArrowRight className={styles.destinationArrow} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </section>
  );
}

export { CharacterSection };
