import mongoose from "mongoose";

import { env } from "../config/env.js";
import { Studio } from "../models/studio.js";

try {
  await mongoose.connect(env.MONGODB_URI);
  const studio = await Studio.findOneAndUpdate(
    { slug: "madhouse" },
    {
      displayName: "Madhouse",
      slug: "madhouse",
      nameKanji: "株式会社マッドハウス",
      imageUrl: "/studios/ogp_madhouse.png",
      description: "Estúdio japonês de animação fundado em 1972. Ao longo de sua história, produziu séries para televisão e longas-metragens, consolidando-se por obras de diferentes gêneros e por colaborações com diversos diretores.",
      foundation: "1972",
      headquarters: "Nakano, Tóquio, Japão",
      website: "https://madhouse.co.jp/english/",
      publicationStatus: "PUBLISHED",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`Estúdio cadastrado: ${studio.displayName} (${studio.slug})`);
} finally {
  await mongoose.disconnect();
}
