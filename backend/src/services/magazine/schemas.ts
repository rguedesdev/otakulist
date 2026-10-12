import { z } from "zod";

const requiredText = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const optionalText = (max: number) => z.string().trim().max(max).nullish().transform((value) => value || null);
const optionalUrl = z.string().trim().max(2_048).url("Link inválido").nullish().transform((value) => value || undefined);
const externalLinks = z.object({
  website: optionalUrl,
  x: optionalUrl,
  instagram: optionalUrl,
  pixiv: optionalUrl,
  youtube: optionalUrl,
  tiktok: optionalUrl,
}).nullish().transform((value) => value ?? {});
const storeLinks = z.object({
  amazon: optionalUrl,
  cdJapan: optionalUrl,
  mercadoLivre: optionalUrl,
  rakuten: optionalUrl,
  shopee: optionalUrl,
  ebay: optionalUrl,
  otakuyasan: optionalUrl,
  hmv: optionalUrl,
  honto: optionalUrl,
  toranoana: optionalUrl,
  animate: optionalUrl,
}).nullish().transform((value) => value ?? {});
const slug = requiredText(220).toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido");

export const magazineSlugSchema = z.object({ slug });
export const createMagazineSchema = z.object({ input: z.object({
  title: requiredText(200),
  description: requiredText(10_000),
  imageUrl: requiredText(2_048),
  foundation: optionalText(100),
  publisherId: z.string().regex(/^[0-9a-f]{24}$/i, "Editora inválida"),
  demography: optionalText(100),
  frequency: optionalText(100),
  externalLinks,
  storeLinks,
  publicationStatus: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
}) });
export const updateMagazineSchema = createMagazineSchema.extend({ slug });
