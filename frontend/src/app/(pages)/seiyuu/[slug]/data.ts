import type { PersonEntity } from "@/shared/types/entities";

export type SeiyuuCharacterCredit = {
  characterName: string;
  characterImage: string;
  animeTitle: string;
};

export type SeiyuuProfile = {
  entity: PersonEntity;
  characters: SeiyuuCharacterCredit[];
};

const seiyuuProfiles: Record<string, SeiyuuProfile> = {
  "kitou-akari": {
    entity: {
      cover: "/kitou.jpg",
      name_romaji: "Kitou Akari",
      name_kanji: "鬼頭明里",
      hometown: "Nagoya, Japão",
      description:
        "A Japanese voice actress. She debuted in 2014, got her first main role in Time Bokan 24 (2016), and has since received more leading roles. On October 16, 2019, her 25th birthday, she made her debut as a solo music artist under Pony Canyon. After the agency Pro-Fit shut down their operations, she joined the new agency Racoon Dog on 2022.",
      entityType: "person",
      roles: ["seiyuu"],
      date_of_birth: "16 Out 1994",
      agency: "Raccoon Dog",
    },
    characters: [
      {
        characterName: "Saotome Ranma",
        characterImage: "/ranma.jpg",
        animeTitle: "Ranma 1⁄2",
      },
    ],
  },
};

export function getSeiyuuProfile(slug: string) {
  return seiyuuProfiles[slug] ?? null;
}

