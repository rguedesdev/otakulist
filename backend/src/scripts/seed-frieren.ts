import mongoose from "mongoose";

import { env } from "../config/env.js";
import { CatalogWork } from "../models/catalog-work.js";
import { Manga } from "../models/manga.js";

const slug = "sousou-no-frieren";

try {
  await mongoose.connect(env.MONGODB_URI);
  const manga = await Manga.findOneAndUpdate(
    { slug },
    {
      title: "Sousou no Frieren",
      slug,
      synopsis: "Após derrotar o Rei Demônio ao lado do grupo de heróis, a elfa maga Frieren vê seus antigos companheiros envelhecerem enquanto ela permanece praticamente inalterada. Décadas depois, ela inicia uma nova jornada para compreender melhor as pessoas, os vínculos que formou e o significado do tempo para os humanos.",
      coverUrl: "https://sbc.e-comi.shogakukan.co.jp/contents/098501800000d0000000/thumbnail/thumbnail.webp",
      alternativeTitles: [
        { type: "JAPANESE", title: "葬送のフリーレン" },
        { type: "ENGLISH", title: "Frieren: Beyond Journey's End" },
        { type: "PORTUGUESE", title: "Frieren e a Jornada para o Além" },
      ],
      status: "HIATUS",
      publicationStatus: "PUBLISHED",
      startDate: new Date("2020-04-28T00:00:00.000Z"),
      endDate: null,
      magazine: "Weekly Shounen Sunday",
      publisher: "Shogakukan",
      demography: "Shounen",
      genres: ["Aventura", "Drama", "Fantasia"],
      chapters: 147,
      volumes: 15,
      serialization: "Publicação semanal (em hiato)",
      externalLinks: { website: "https://websunday.net/work/708/" },
      storeLinks: {},
      characterIds: [],
      staffCredits: [],
      createdBy: null,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await CatalogWork.findOneAndUpdate(
    { medium: "MANGA", slug },
    { title: manga.title, slug, medium: "MANGA", coverUrl: manga.coverUrl, status: manga.status, publicationStatus: manga.publicationStatus, entityId: manga._id },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`Manga cadastrado: ${manga.title} (${manga.slug})`);
} finally {
  await mongoose.disconnect();
}
