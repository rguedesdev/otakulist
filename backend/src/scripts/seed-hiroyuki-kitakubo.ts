import mongoose from "mongoose";

import { env } from "../config/env.js";
import { Person } from "../models/person.js";

try {
  await mongoose.connect(env.MONGODB_URI);
  const person = await Person.findOneAndUpdate(
    { slug: "kitakubo-hiroyuki" },
    {
      displayName: "Kitakubo Hiroyuki",
      slug: "kitakubo-hiroyuki",
      nameKanji: "北久保弘之",
      imageUrl: "/hiroyuki.png",
      description: "Diretor, animador e roteirista japonês. Ingressou ainda jovem na indústria de animação e participou de produções como Urusei Yatsura e AKIRA. Como diretor, trabalhou em títulos como Black Magic M-66, Roujin Z, Golden Boy e Blood: The Last Vampire.",
      roles: ["STAFF"],
      dateOfBirth: "15 Nov 1963",
      hometown: "Bunkyo, Tóquio, Japão",
      activityPeriod: "1979–presente",
      occupations: ["Diretor", "Animador", "Roteirista"],
      publicationStatus: "PUBLISHED",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`Staff cadastrado: ${person.displayName} (${person.slug})`);
} finally {
  await mongoose.disconnect();
}
