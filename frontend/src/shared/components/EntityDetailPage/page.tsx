import type { ReactNode } from "react";

import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import type { EntityInfo } from "@/shared/types/entities";

import styles from "./entitydetailpage.module.css";

type EntityDetailPageProps = {
  entity: EntityInfo;
  sidebarChildren?: ReactNode;
  children: ReactNode;
};

function EntityDetailPage({ entity, sidebarChildren, children }: EntityDetailPageProps) {
  return (
    <div className={styles.page}>
      <HeroSection entity={entity} />
      <main className={styles.container}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo entity={entity}>{sidebarChildren}</FormatSidebarInfo>
          <div className={styles.centralContainer}>{children}</div>
        </div>
      </main>
    </div>
  );
}

export { EntityDetailPage };
