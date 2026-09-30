import { z } from "zod";

const requiredText = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform((value) => value || null);
const slug = requiredText(220).toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido");
const imageUrl = requiredText(2_048).refine(
  (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
  "Use uma URL http(s) ou um caminho interno iniciado por /",
);
const optionalUrl = z.string().trim().max(2_048).url("Link inválido").nullish().transform((value) => value || undefined);
const externalLinks = z.object({
  website: optionalUrl,
  x: optionalUrl,
  instagram: optionalUrl,
  pixiv: optionalUrl,
  youtube: optionalUrl,
}).nullish().transform((value) => value ?? {});

export const seiyuuSlugSchema = z.object({ slug });

export const createSeiyuuSchema = z.object({
  input: z.object({
    displayName: requiredText(200),
    nameKanji: optionalText(200),
    imageUrl,
    description: optionalText(10_000),
    dateOfBirth: optionalText(100),
    hometown: optionalText(200),
    agency: optionalText(200),
    externalLinks,
    publicationStatus: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  }),
});

export const updateSeiyuuSchema = createSeiyuuSchema.extend({ slug });
