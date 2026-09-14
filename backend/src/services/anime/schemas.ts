import { z } from "zod";

import {
  ALTERNATIVE_TITLE_TYPES,
  ANIME_PUBLICATION_STATUSES,
  ANIME_RELEASE_FORMATS,
  ANIME_SONG_TYPES,
  ANIME_STATUSES,
  RELATED_WORK_TYPES,
} from "../../models/anime.js";

const requiredText = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const optionalText = (max: number) => z.string().trim().max(max).nullish().transform((value) => value || null);
const optionalUrl = z
  .string()
  .trim()
  .max(2_048)
  .nullish()
  .transform((value) => value || undefined)
  .refine(
    (value) => !value || /^https?:\/\//i.test(value) || value.startsWith("/"),
    "Use uma URL http(s) ou um caminho interno iniciado por /",
  );
const requiredUrl = requiredText(2_048).refine(
  (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
  "Use uma URL http(s) ou um caminho interno iniciado por /",
);

const linkMap = <T extends z.ZodRawShape>(shape: T) => z.object(shape).optional();
const legacyAnimeRatings: Record<string, string> = {
  "PG-13": "PG13",
  "R-17+": "R17",
  "R+": "R18",
  Rx: "R18",
};

export const createAnimeSchema = z.object({
  input: z.object({
    title: requiredText(200),
    synopsis: requiredText(10_000),
    coverUrl: requiredUrl,
    alternativeTitles: z
      .array(z.object({ type: z.enum(ALTERNATIVE_TITLE_TYPES), title: requiredText(200) }))
      .max(30)
      .default([]),
    genres: z.array(requiredText(50)).max(30).default([]),
    producers: z.array(requiredText(100)).max(100).default([]),
    demography: optionalText(100),
    rating: optionalText(50).transform((value) => value ? legacyAnimeRatings[value] ?? value : value),
    publicationStatus: z.enum(ANIME_PUBLICATION_STATUSES).default("DRAFT"),
    installments: z
      .array(
        z.object({
          order: z.number().int().positive(),
          title: requiredText(200),
          label: requiredText(100),
          format: z.enum(ANIME_RELEASE_FORMATS),
          synopsis: requiredText(10_000),
          coverUrl: optionalUrl.transform((value) => value ?? null),
          episodes: z.number().int().positive().max(100_000),
          durationMinutes: z.number().int().positive().max(10_000).nullish().transform((value) => value ?? null),
          status: z.enum(ANIME_STATUSES),
          startDate: z.iso.date().nullish().transform((value) => value || null),
          endDate: z.iso.date().nullish().transform((value) => value || null),
          broadcastSeason: optionalText(100),
          studioId: z.string().regex(/^[0-9a-f]{24}$/i, "Estúdio inválido").nullish().transform((value) => value || null),
          studioName: optionalText(200),
        }),
      )
      .min(1, "Cadastre ao menos um lançamento sequencial")
      .max(100)
      .refine((items) => new Set(items.map((item) => item.order)).size === items.length, "A ordem dos lançamentos não pode se repetir"),
    staffCredits: z
      .array(
        z.object({
          personId: z.string().regex(/^[0-9a-f]{24}$/i, "Pessoa da staff inválida"),
          role: requiredText(200),
          contribution: optionalText(200),
        }),
      )
      .max(300)
      .default([]),
    characterCredits: z
      .array(
        z.object({
          characterId: z.string().regex(/^[0-9a-f]{24}$/i, "Personagem inválido"),
          seiyuuId: z.string().regex(/^[0-9a-f]{24}$/i, "Seiyuu inválido"),
        }),
      )
      .max(500)
      .refine(
        (items) => new Set(items.map((item) => `${item.characterId}:${item.seiyuuId}`)).size === items.length,
        "O mesmo vínculo entre personagem e seiyuu não pode se repetir",
      )
      .default([]),
    songCredits: z
      .array(
        z.object({
          artistId: z.string().regex(/^[0-9a-f]{24}$/i, "Artista inválido"),
          songTitle: requiredText(300),
          featuredArtistIds: z.array(z.string().regex(/^[0-9a-f]{24}$/i, "Participação inválida")).max(20).default([]),
          type: z.enum(ANIME_SONG_TYPES),
          sequence: z.number().int().positive().max(1_000).nullish().transform((value) => value ?? null),
          episodeRange: optionalText(100),
        }).refine((credit) => !credit.featuredArtistIds.includes(credit.artistId), "O artista principal não pode ser uma participação")
          .refine((credit) => new Set(credit.featuredArtistIds).size === credit.featuredArtistIds.length, "A mesma participação não pode se repetir"),
      )
      .max(300)
      .default([]),
    relatedWorks: z
      .array(
        z.object({
          relationType: z.enum(RELATED_WORK_TYPES),
          workId: z.string().regex(/^[0-9a-f]{24}$/i, "Obra relacionada inválida"),
        }),
      )
      .max(100)
      .default([]),
    externalLinks: linkMap({
      website: optionalUrl,
      x: optionalUrl,
      instagram: optionalUrl,
      pixiv: optionalUrl,
      youtube: optionalUrl,
    }),
    streamingLinks: linkMap({
      crunchyroll: optionalUrl,
      netflix: optionalUrl,
      primeVideo: optionalUrl,
      bilibili: optionalUrl,
      retrocrush: optionalUrl,
      hulu: optionalUrl,
      hidive: optionalUrl,
      uNext: optionalUrl,
      abemaTv: optionalUrl,
      adn: optionalUrl,
      museAsia: optionalUrl,
      laftel: optionalUrl,
      tver: optionalUrl,
      iqiyi: optionalUrl,
      tubi: optionalUrl,
      dAnimeStore: optionalUrl,
    }),
  }),
});

export const animeSlugSchema = z.object({
  slug: requiredText(220).toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const updateAnimeSchema = createAnimeSchema.extend({
  slug: animeSlugSchema.shape.slug,
});
