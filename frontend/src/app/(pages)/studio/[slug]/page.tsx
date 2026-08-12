// Style Sheet CSS
import styles from "./studioslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { AnimesByStudio } from "./components/AnimesByStudio/page";
import type { OrganizationEntity } from "@/shared/types/entities";

function StudioBySlug() {
  const StudioInfo: OrganizationEntity = {
    cover: "/studios/bones.jpg",
    title: "Bones",
    description:
      "Bones (Bones Inc.) is a Japanese animation studio based in Suginami, Tokyo. The studio was founded by previous Sunrise producer Masahiko Minami and animators Hiroshi Ousaka and Toshihiro Kawamoto in 1998. Following Sunrise's production model, Bones' founders divided the company into five smaller studios, Studio A-E.",
    entityType: "organization",
    organizationType: "studio",
    foundation: "13 Jun 1990",
  };

  return (
    <div className={styles.page}>
      <HeroSection entity={StudioInfo} />
      <main className={styles.studioSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo entity={StudioInfo} />
          <div className={styles.centralContainer}>
            <AnimesByStudio />
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudioBySlug;
