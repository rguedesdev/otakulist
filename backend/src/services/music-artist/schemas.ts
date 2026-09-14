import { z } from "zod";

import { MUSIC_ARTIST_KINDS, MUSIC_ARTIST_PUBLICATION_STATUSES } from "../../models/music-artist.js";

const requiredText = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const optionalText = (max: number) => z.string().trim().max(max).nullish().transform((value) => value || null);
const slug = requiredText(220).toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido");
const optionalUrl = z.string().trim().max(2_048).nullish().transform((value) => value || undefined).refine(
  (value) => !value || /^https?:\/\//i.test(value) || value.startsWith("/"),
  "Use uma URL http(s) ou um caminho interno iniciado por /",
);
const requiredUrl = requiredText(2_048).refine(
  (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
  "Use uma URL http(s) ou um caminho interno iniciado por /",
);

export const musicArtistSlugSchema = z.object({ slug });

export const createMusicArtistSchema = z.object({
  input: z.object({
    displayName: requiredText(200),
    kind: z.enum(MUSIC_ARTIST_KINDS),
    nameKanji: optionalText(200),
    imageUrl: requiredUrl,
    description: optionalText(10_000),
    origin: optionalText(200),
    dateOfBirth: optionalText(100),
    activityPeriod: optionalText(100),
    recordLabel: optionalText(200),
    genres: z.array(requiredText(100)).max(30).default([]),
    platformLinks: z.object({
      spotify: optionalUrl,
      tidal: optionalUrl,
      deezer: optionalUrl,
      amazonMusic: optionalUrl,
    }).optional(),
    publicationStatus: z.enum(MUSIC_ARTIST_PUBLICATION_STATUSES).default("DRAFT"),
  }),
});

export const updateMusicArtistSchema = createMusicArtistSchema.extend({ slug });

