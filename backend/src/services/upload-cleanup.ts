import { unlink } from "node:fs/promises";
import { join } from "node:path";

import type { Model } from "mongoose";

import { env } from "../config/env.js";
import { Anime } from "../models/anime.js";
import { CatalogWork } from "../models/catalog-work.js";
import { Character } from "../models/character.js";
import { LightNovel } from "../models/light-novel.js";
import { Magazine } from "../models/magazine.js";
import { Manga } from "../models/manga.js";
import { MusicArtist } from "../models/music-artist.js";
import { Person } from "../models/person.js";
import { Publisher } from "../models/publisher.js";
import { Studio } from "../models/studio.js";
import { User } from "../models/user.js";

const imagePathsByModel: Array<{ model: Model<any>; paths: string[] }> = [
  { model: Anime, paths: ["coverUrl", "installments.coverUrl"] },
  { model: CatalogWork, paths: ["coverUrl"] },
  { model: Character, paths: ["imageUrl"] },
  { model: LightNovel, paths: ["coverUrl"] },
  { model: Magazine, paths: ["imageUrl"] },
  { model: Manga, paths: ["coverUrl"] },
  { model: MusicArtist, paths: ["imageUrl", "discography.cover"] },
  { model: Person, paths: ["imageUrl"] },
  { model: Publisher, paths: ["imageUrl"] },
  { model: Studio, paths: ["imageUrl"] },
  { model: User, paths: ["avatarUrl"] },
];

const imageFieldNames = new Set(["avatarUrl", "cover", "coverUrl", "imageUrl"]);
const managedUploadUrlPattern = /^\/uploads\/([0-9a-f-]+\.webp)$/i;

function collectManagedUploadUrls(value: unknown, urls = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectManagedUploadUrls(item, urls);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (imageFieldNames.has(key) && typeof item === "string" && managedUploadUrlPattern.test(item)) {
        urls.add(item);
      } else {
        collectManagedUploadUrls(item, urls);
      }
    }
  }
  return urls;
}

async function getReferencedUploadUrls(urls: string[]) {
  if (!urls.length) return new Set<string>();
  const candidateUrls = new Set(urls);
  const referencesByModel = await Promise.all(imagePathsByModel.map(async ({ model, paths }) => {
    const documents = await model.find({
      $or: paths.map((path) => ({ [path]: { $in: urls } })),
    }).select(paths.join(" ")).lean();
    const references = new Set<string>();
    for (const document of documents) {
      for (const url of collectManagedUploadUrls(document)) {
        if (candidateUrls.has(url)) references.add(url);
      }
    }
    return references;
  }));
  return new Set(referencesByModel.flatMap((references) => [...references]));
}

export async function deleteUploadIfUnreferenced(url: string) {
  const match = managedUploadUrlPattern.exec(url);
  if (!match || (await getReferencedUploadUrls([url])).has(url)) return false;
  return unlinkManagedUpload(match[1]!);
}

async function unlinkManagedUpload(filename: string) {
  await unlink(join(env.UPLOAD_DIR, filename)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  return true;
}

export async function cleanupReplacedUploadImages(previous: unknown, next: unknown) {
  const currentUrls = collectManagedUploadUrls(next);
  const previousUrls = collectManagedUploadUrls(previous);
  const removedUrls = [...previousUrls].filter((url) => !currentUrls.has(url));
  const referencedUrls = await getReferencedUploadUrls(removedUrls);
  await Promise.all(removedUrls
    .filter((url) => !referencedUrls.has(url))
    .map((url) => unlinkManagedUpload(managedUploadUrlPattern.exec(url)![1]!)));
}

export async function listOrphanedUploadFiles() {
  const { readdir } = await import("node:fs/promises");
  const filenames = await readdir(env.UPLOAD_DIR);
  const candidates = filenames
    .filter((filename) => managedUploadUrlPattern.test(`/uploads/${filename}`))
    .map((filename) => `/uploads/${filename}`);
  const referencedUrls = await getReferencedUploadUrls(candidates);
  return candidates.filter((url) => !referencedUrls.has(url));
}
