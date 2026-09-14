import mongoose from "mongoose";

import { env } from "../config/env.js";
import { Studio } from "../models/studio.js";

try {
  await mongoose.connect(env.MONGODB_URI);
  const studio = await Studio.findOneAndUpdate(
    { slug: "bones" },
    {
      displayName: "Bones",
      slug: "bones",
      nameKanji: "ボンズ",
      imageUrl: "/studios/bones.jpg",
      description: "Bones (Bones Inc.) is a Japanese animation studio based in Suginami, Tokyo. The studio was founded by former Sunrise producer Masahiko Minami and animators Hiroshi Ousaka and Toshihiro Kawamoto in 1998. Following Sunrise's production model, its founders divided the company into smaller production studios.",
      foundation: "1998",
      headquarters: "Suginami, Tóquio, Japão",
      website: "https://www.bones.co.jp/",
      publicationStatus: "PUBLISHED",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`Estúdio cadastrado: ${studio.displayName} (${studio.slug})`);
} finally {
  await mongoose.disconnect();
}
