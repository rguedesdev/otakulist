import mongoose from "mongoose";

import { env } from "../config/env.js";
import { Person } from "../models/person.js";

try {
  await mongoose.connect(env.MONGODB_URI);
  const person = await Person.findOneAndUpdate(
    { slug: "rumiko-takahashi" },
    {
      displayName: "Rumiko Takahashi",
      slug: "rumiko-takahashi",
      nameKanji: "高橋留美子",
      imageUrl: "/rumiko.png",
      description: "Mangaka japonesa conhecida por criar séries que combinam comédia, romance, fantasia e ação. Entre suas obras mais conhecidas estão Urusei Yatsura, Maison Ikkoku, Ranma ½, InuYasha, Kyoukai no Rinne e MAO.",
      roles: ["MANGAKA"],
      dateOfBirth: "10 Out 1957",
      hometown: "Niigata, Japão",
      activityPeriod: "1978–presente",
      occupations: ["Mangaka"],
      publicationStatus: "PUBLISHED",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`Mangaka cadastrada: ${person.displayName} (${person.slug})`);
} finally {
  await mongoose.disconnect();
}
