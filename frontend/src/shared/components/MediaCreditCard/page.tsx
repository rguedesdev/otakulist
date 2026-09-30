"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./media-credit-card.module.css";

type MediaCreditCardProps = {
  href?: string;
  image: string;
  imageAlt: string;
  title: string;
  details: Array<{ icon: ReactNode; text: ReactNode }>;
};

function CardContent({ image, imageAlt, title, details }: Omit<MediaCreditCardProps, "href">) {
  return (
    <>
      <Image className={styles.cover} src={image} alt={imageAlt} width={90} height={130} unoptimized />
      <span className={styles.textsContainer}>
        <span className={styles.texts}>
          <strong className={styles.title}>{title}</strong>
          <span className={styles.infoGroup}>
            {details.map((detail, index) => (
              <span className={styles.infoLine} key={index}>
                <span className={styles.infoIcon}>{detail.icon}</span>
                <span className={styles.info}>{detail.text}</span>
              </span>
            ))}
          </span>
        </span>
      </span>
    </>
  );
}

export function MediaCreditCard({ href, ...content }: MediaCreditCardProps) {
  const router = useRouter();

  return href ? (
    <button className={styles.card} type="button" onClick={() => router.push(href)}>
      <CardContent {...content} />
    </button>
  ) : (
    <div className={styles.card}>
      <CardContent {...content} />
    </div>
  );
}
