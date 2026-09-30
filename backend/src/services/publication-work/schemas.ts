import { z } from "zod";

import { ALTERNATIVE_TITLE_TYPES, ANIME_PUBLICATION_STATUSES, RELATED_WORK_TYPES } from "../../models/anime.js";
import { MANGA_STATUSES } from "../../models/manga.js";

const requiredText = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const optionalText = (max: number) => z.string().trim().max(max).nullish().transform((value) => value || null);
const optionalUrl = z.string().trim().max(2_048).nullish().transform((value) => value || undefined)
  .refine((value) => !value || /^https?:\/\//i.test(value) || value.startsWith("/"), "Use uma URL http(s) ou um caminho interno iniciado por /");
const links = <T extends z.ZodRawShape>(shape: T) => z.object(shape).optional();
const externalLinks = links({ website: optionalUrl, x: optionalUrl, instagram: optionalUrl, pixiv: optionalUrl, youtube: optionalUrl });
const storeLinks = links({ amazon: optionalUrl, cdJapan: optionalUrl, mercadoLivre: optionalUrl, rakuten: optionalUrl, shopee: optionalUrl, ebay: optionalUrl, otakuyasan: optionalUrl, hmv: optionalUrl, honto: optionalUrl, toranoana: optionalUrl, animate: optionalUrl });
const credits = {
  characterIds: z.array(z.string().regex(/^[0-9a-f]{24}$/i, "Personagem inválido")).max(500).default([]),
  staffCredits: z.array(z.object({ personId: z.string().regex(/^[0-9a-f]{24}$/i, "Pessoa inválida"), role: requiredText(200), contribution: optionalText(200) })).max(300).default([]),
  relatedWorks: z.array(z.object({ relationType: z.enum(RELATED_WORK_TYPES), workId: z.string().regex(/^[0-9a-f]{24}$/i, "Obra relacionada inválida") })).max(100).default([]),
};
const base = {
  title: requiredText(200), synopsis: requiredText(10_000), coverUrl: requiredText(2_048),
  alternativeTitles: z.array(z.object({ type: z.enum(ALTERNATIVE_TITLE_TYPES), title: requiredText(200) })).max(30).default([]),
  status: z.enum(MANGA_STATUSES), publicationStatus: z.enum(ANIME_PUBLICATION_STATUSES).default("DRAFT"),
  adultContent: z.boolean().default(false),
  startDate: z.iso.date().nullish().transform((value) => value || null), endDate: z.iso.date().nullish().transform((value) => value || null),
  publisherId: z.string().regex(/^[0-9a-f]{24}$/i, "Editora inválida").nullish().transform((value) => value || null),
  publisher: optionalText(200), genres: z.array(requiredText(50)).max(30).default([]),
  chapters: z.number().int().nonnegative().max(1_000_000), volumes: z.number().int().nonnegative().max(100_000),
  externalLinks, storeLinks, ...credits,
};

export const createMangaSchema = z.object({ input: z.object({
  ...base,
  magazineId: z.string().regex(/^[0-9a-f]{24}$/i, "Magazine inválida").nullish().transform((value) => value || null),
  magazine: optionalText(200),
  demography: optionalText(100),
  serialization: optionalText(200),
}) });
export const updateMangaSchema = createMangaSchema.extend({ slug: requiredText(220) });
export const createLightNovelSchema = z.object({ input: z.object({ ...base, source: optionalText(200) }) });
export const updateLightNovelSchema = createLightNovelSchema.extend({ slug: requiredText(220) });
