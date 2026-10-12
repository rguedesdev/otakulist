import Image from "next/image";
import Link from "next/link";

import { FiMusic, FiPlayCircle, FiTv } from "react-icons/fi";
import { TbMicrophone2 } from "react-icons/tb";

import styles from "./animesongsection.module.css";

type DetailIcon = "anime" | "artist" | "song" | "usage";

type SongDetail = {
  icon: DetailIcon;
  text: string;
};

type AnimeSong = {
  title: string;
  href: string;
  image?: string;
  imageAlt?: string;
  details: SongDetail[];
};

type AnimeSongSectionProps = {
  title: string;
  songs: AnimeSong[];
};

const detailIcons = {
  anime: FiTv,
  artist: TbMicrophone2,
  song: FiMusic,
  usage: FiPlayCircle,
};

function AnimeSongSection({ title, songs }: AnimeSongSectionProps) {
  return (
    <section className={styles.container}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.cardsContainer}>
        {songs.map((song) => (
          <Link
            className={styles.card}
            href={song.href}
            key={`${song.href}-${song.title}`}
            aria-label={song.title}
          >
            {song.image ? (
              <Image
                className={styles.cover}
                src={song.image}
                alt={song.imageAlt ?? song.title}
                width={120}
                height={90}
                unoptimized
              />
            ) : (
              <span className={styles.coverFallback} aria-hidden="true">
                <FiMusic />
              </span>
            )}

            <div className={styles.texts}>
              <h3 className={styles.title}>{song.title}</h3>
              <dl className={styles.infoGroup}>
                {song.details.map((detail) => {
                  const Icon = detailIcons[detail.icon];
                  return (
                    <div className={styles.infoLine} key={`${detail.icon}-${detail.text}`}>
                      <dt className={styles.infoIcon}><Icon size={13} aria-hidden="true" /></dt>
                      <dd>{detail.text}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export { AnimeSongSection };
export type { AnimeSong };
