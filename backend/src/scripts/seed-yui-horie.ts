import mongoose from "mongoose";

import { env } from "../config/env.js";
import { MusicArtist } from "../models/music-artist.js";

try {
  await mongoose.connect(env.MONGODB_URI);
  const artist = await MusicArtist.findOneAndUpdate(
    { slug: "yui-horie" },
    {
      displayName: "Yui Horie",
      slug: "yui-horie",
      kind: "SOLO",
      nameKanji: "堀江由衣",
      imageUrl: "/singers/yui-horie.png",
      description: "Cantora e seiyuu japonesa conhecida por uma extensa carreira musical ligada a animes. Além de seus lançamentos próprios, interpretou temas de abertura e encerramento que marcaram diferentes temporadas.",
      origin: "Tóquio, Japão",
      dateOfBirth: "20 Set 1976",
      activityPeriod: "1997–presente",
      recordLabel: "King Records",
      genres: ["J-Pop", "Anisong"],
      platformLinks: {},
      publicationStatus: "PUBLISHED",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`Artista cadastrado: ${artist.displayName} (${artist.slug})`);
} finally {
  await mongoose.disconnect();
}
