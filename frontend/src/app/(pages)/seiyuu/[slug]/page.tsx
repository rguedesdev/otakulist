import { notFound } from "next/navigation";

// Components
import { EntityDetailPage } from "@/shared/components/EntityDetailPage/page";
import { assetUrl } from "@/shared/auth/api";
import type { PersonEntity } from "@/shared/types/entities";
import { CharacterBySeiyuu } from "./components/CharactersBySeiyuu/page";
import { getSeiyuuProfile, type SeiyuuCharacterCredit } from "./data";

const charactersQuery = `query CharactersBySeiyuu($slug: String!) {
  charactersBySeiyuu(slug: $slug) {
    nameRomaji imageUrl voiceCredits { seiyuuSlug animeTitle }
  }
}`;
const seiyuuQuery = `query Seiyuu($slug: String!) {
  seiyuu(slug: $slug) {
    displayName nameKanji imageUrl description dateOfBirth hometown agency
  }
}`;

type CharacterResult = {
  nameRomaji: string;
  imageUrl: string;
  voiceCredits: Array<{ seiyuuSlug: string; animeTitle: string }>;
};
type SeiyuuResult = {
  displayName: string;
  nameKanji: string | null;
  imageUrl: string | null;
  description: string | null;
  dateOfBirth: string | null;
  hometown: string | null;
  agency: string | null;
};

async function getStoredSeiyuu(slug: string): Promise<PersonEntity | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: seiyuuQuery, variables: { slug } }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json() as { data?: { seiyuu: SeiyuuResult | null } };
    const seiyuu = body.data?.seiyuu;
    if (!seiyuu?.imageUrl) return null;
    return {
      cover: assetUrl(seiyuu.imageUrl) ?? seiyuu.imageUrl,
      name_romaji: seiyuu.displayName,
      name_kanji: seiyuu.nameKanji ?? "",
      hometown: seiyuu.hometown ?? "",
      description: seiyuu.description ?? "",
      entityType: "person",
      roles: ["seiyuu"],
      date_of_birth: seiyuu.dateOfBirth ?? "",
      agency: seiyuu.agency ?? "",
    };
  } catch {
    return null;
  }
}

async function getCharacters(slug: string): Promise<SeiyuuCharacterCredit[] | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: charactersQuery, variables: { slug } }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json() as { data?: { charactersBySeiyuu: CharacterResult[] } };
    if (!body.data) return null;
    return body.data.charactersBySeiyuu.flatMap((character) =>
      character.voiceCredits.filter((item) => item.seiyuuSlug === slug).map((credit) => ({
        characterName: character.nameRomaji,
        characterImage: assetUrl(character.imageUrl) ?? character.imageUrl,
        animeTitle: credit.animeTitle,
      })),
    );
  } catch {
    return null;
  }
}

type SeiyuuBySlugProps = {
  params: Promise<{ slug: string }>;
};

async function SeiyuuBySlug({ params }: SeiyuuBySlugProps) {
  const { slug } = await params;
  const fallbackProfile = getSeiyuuProfile(slug);
  const [storedEntity, storedCharacters] = await Promise.all([
    getStoredSeiyuu(slug),
    getCharacters(slug),
  ]);
  const entity = storedEntity ?? fallbackProfile?.entity;
  if (!entity) notFound();
  const characters = storedCharacters ?? fallbackProfile?.characters ?? [];

  return (
    <EntityDetailPage entity={entity}>
      <CharacterBySeiyuu characters={characters} />
    </EntityDetailPage>
  );
}

export default SeiyuuBySlug;
