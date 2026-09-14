import { z } from "zod";

import { CHARACTER_PUBLICATION_STATUSES } from "../../models/character.js";

const requiredText = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform((value) => value || null);
const slug = requiredText(220).toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido");
const imageUrl = requiredText(2_048).refine(
  (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
  "Use uma URL http(s) ou um caminho interno iniciado por /",
);

export const characterSlugSchema = z.object({ slug });

export const createCharacterSchema = z.object({
  input: z.object({
    nameRomaji: requiredText(200),
    nameKanji: optionalText(200),
    description: optionalText(10_000),
    imageUrl,
    dateOfBirth: optionalText(100),
    hometown: optionalText(200),
    publicationStatus: z.enum(CHARACTER_PUBLICATION_STATUSES).default("DRAFT"),
    voiceCredits: z
      .array(z.object({ seiyuuSlug: slug, animeTitle: requiredText(200) }))
      .max(100)
      .default([]),
  }),
});

export const updateCharacterSchema = createCharacterSchema.extend({ slug });

