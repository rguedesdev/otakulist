import type { ReactNode } from "react";

import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";

import styles from "./entitydetailpage.module.css";

type EntityDetailPageProps = {
  formatInfo: Record<string, unknown>;
  sidebarChildren?: ReactNode;
  children: ReactNode;
};

function EntityDetailPage({ formatInfo, sidebarChildren, children }: EntityDetailPageProps) {
  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={formatInfo} />
      <main className={styles.container}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={formatInfo}>{sidebarChildren}</FormatSidebarInfo>
          <div className={styles.centralContainer}>{children}</div>
        </div>
      </main>
    </div>
  );
}

export { EntityDetailPage };
