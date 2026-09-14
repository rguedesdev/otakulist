import mongoose from "mongoose";

import { env } from "../config/env.js";
import { Character } from "../models/character.js";
import { Person } from "../models/person.js";

try {
  await mongoose.connect(env.MONGODB_URI);

  const seiyuu = await Person.findOneAndUpdate(
    { slug: "kitou-akari" },
    {
      displayName: "Kitou Akari",
      slug: "kitou-akari",
      nameKanji: "鬼頭明里",
      imageUrl: "/kitou.jpg",
      description: "A Japanese voice actress. She debuted in 2014, got her first main role in Time Bokan 24 (2016), and has since received more leading roles. On October 16, 2019, her 25th birthday, she made her debut as a solo music artist under Pony Canyon. After the agency Pro-Fit shut down their operations, she joined the new agency Racoon Dog on 2022.",
      roles: ["SEIYUU"],
      dateOfBirth: "16 Out 1994",
      hometown: "Nagoya, Japão",
      agency: "Raccoon Dog",
      publicationStatus: "PUBLISHED",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  const character = await Character.findOneAndUpdate(
    { slug: "saotome-ranma" },
    {
      nameRomaji: "Saotome Ranma",
      slug: "saotome-ranma",
      nameKanji: null,
      description: null,
      imageUrl: "/ranma.jpg",
      dateOfBirth: null,
      hometown: null,
      publicationStatus: "PUBLISHED",
      voiceCredits: [{ seiyuuSlug: "kitou-akari", animeTitle: "Ranma 1⁄2" }],
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log(`Seiyuu cadastrada: ${seiyuu.displayName} (${seiyuu.slug})`);
  console.log(`Personagem cadastrado: ${character.nameRomaji} (${character.slug})`);
} finally {
  await mongoose.disconnect();
}
