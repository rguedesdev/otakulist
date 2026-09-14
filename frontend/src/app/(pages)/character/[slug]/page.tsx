import { notFound } from "next/navigation";

// Style Sheet CSS
import styles from "./characterslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { assetUrl } from "@/shared/auth/api";
import type { CharacterEntity } from "@/shared/types/entities";
import { CharacterByMedia, type CharacterAppearance } from "./components/CharactersByAnime/page";

export const dynamic = "force-dynamic";

type CharacterData = {
  nameRomaji: string;
  nameKanji: string | null;
  description: string | null;
  imageUrl: string;
  dateOfBirth: string | null;
  hometown: string | null;
  appearances: CharacterAppearance[];
};

const query = `query Character($slug: String!) {
  character(slug: $slug) {
    nameRomaji nameKanji description imageUrl dateOfBirth hometown
    appearances { id title slug coverUrl medium formats }
  }
}`;

async function getCharacter(slug: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { slug } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar o personagem");
  const body = await response.json() as { data?: { character: CharacterData | null } };
  return body.data?.character ?? null;
}

async function CharacterBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = await getCharacter(slug);
  if (!character) notFound();

  const CharacterInfo: CharacterEntity = {
    cover: assetUrl(character.imageUrl) ?? character.imageUrl,
    name_romaji: character.nameRomaji,
    name_kanji: character.nameKanji ?? "",
    hometown: character.hometown ?? "",
    description: character.description ?? "",
    entityType: "character",
    date_of_birth: character.dateOfBirth ?? "",
  };

  return (
    <div className={styles.page}>
      <HeroSection entity={CharacterInfo} />
      <main className={styles.characterSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo entity={CharacterInfo} />
          <div className={styles.centralContainer}>
            <CharacterByMedia appearances={character.appearances} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CharacterBySlug;
