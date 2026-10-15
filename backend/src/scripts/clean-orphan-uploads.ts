import mongoose from "mongoose";

import { env } from "../config/env.js";
import { deleteUploadIfUnreferenced, listOrphanedUploadFiles } from "../services/upload-cleanup.js";

const shouldDelete = process.argv.includes("--delete");

try {
  await mongoose.connect(env.MONGODB_URI);
  const orphaned = await listOrphanedUploadFiles();
  const bytes = await Promise.all(orphaned.map(async (url) => {
    const filename = url.slice("/uploads/".length);
    const { stat } = await import("node:fs/promises");
    return (await stat(`${env.UPLOAD_DIR}/${filename}`)).size;
  }));
  const totalBytes = bytes.reduce((total, size) => total + size, 0);

  if (shouldDelete) {
    let deleted = 0;
    for (const url of orphaned) {
      if (await deleteUploadIfUnreferenced(url)) deleted += 1;
    }
    console.log(`Removidas ${deleted} imagens órfãs (${totalBytes} bytes).`);
  } else {
    console.log(`Encontradas ${orphaned.length} imagens órfãs (${totalBytes} bytes).`);
    console.log("Execute com --delete para removê-las.");
  }
} finally {
  await mongoose.disconnect();
}
