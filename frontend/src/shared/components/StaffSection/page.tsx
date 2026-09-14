import Image from "next/image";
import Link from "next/link";
import { FiBriefcase, FiMusic, FiUser } from "react-icons/fi";
import { AiOutlineEdit } from "react-icons/ai";
import { IoColorPaletteOutline } from "react-icons/io5";
import { PiFilmSlate } from "react-icons/pi";
import { RiQuillPenLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import { normalizeStaffCredit } from "@/shared/catalog/staff-roles";
import styles from "./staff.module.css";

export type StaffCredit = {
  role: string;
  contribution?: string | null;
  person: {
    id: string;
    displayName: string;
    slug: string;
    imageUrl?: string | null;
    roles?: string[];
  };
};

export function StaffRoleIcon({ role, size = 14 }: { role: string; size?: number }) {
  const normalizedRole = role.toLocaleLowerCase("pt-BR");
  const RoleIcon = normalizedRole.includes("gensakusha") || normalizedRole.includes("roteir")
    ? AiOutlineEdit
    : normalizedRole.includes("mangaka")
      ? RiQuillPenLine
      : normalizedRole.includes("diretor")
        ? PiFilmSlate
        : normalizedRole.includes("anima") || normalizedRole.includes("design") || normalizedRole.includes("arte")
          ? IoColorPaletteOutline
          : normalizedRole.includes("compositor") || normalizedRole.includes("música")
            ? FiMusic
            : FiBriefcase;
  return <RoleIcon size={size} aria-hidden="true" />;
}

function StaffSection({ credits = [] }: { credits?: StaffCredit[] }) {
  if (credits.length === 0) return null;

  return (
    <section className={styles.staffContainer}>
      <h2 className={styles.staffSectionTitle}>Staff</h2>
      <div className={styles.staffCardsContainer}>
        {credits.map((credit) => {
          const normalizedCredit = normalizeStaffCredit(credit);
          const path = credit.person.roles?.includes("MANGAKA")
            ? "mangaka"
            : credit.person.roles?.includes("STAFF")
              ? "staff"
              : credit.person.roles?.includes("SEIYUU")
                ? "seiyuu"
                : "staff";
          return (
          <Link href={`/${path}/${credit.person.slug}`} key={`${credit.person.id}-${credit.role}`}>
            <article className={styles.staffCard}>
              {credit.person.imageUrl ? (
                <Image
                  className={styles.staffCover}
                  src={assetUrl(credit.person.imageUrl) ?? credit.person.imageUrl}
                  alt={credit.person.displayName}
                  width={60}
                  height={80}
                  unoptimized
                />
              ) : (
                <span className={styles.staffCoverFallback}><FiUser aria-hidden="true" /></span>
              )}
              <div className={styles.staffTextsContainer}>
                <div className={styles.staffTexts}>
                  <h3 className={styles.mangakaName}>{credit.person.displayName}</h3>
                  <dl className={styles.infoGroup}>
                    <div className={styles.infoLine}>
                      <dt className={styles.infoIcon}><StaffRoleIcon role={normalizedCredit.role} /></dt>
                      <dd className={styles.staffType}>{normalizedCredit.role}{normalizedCredit.contribution ? ` • ${normalizedCredit.contribution}` : ""}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          </Link>
          );
        })}
      </div>
    </section>
  );
}

export { StaffSection };
