import { z } from "zod";

import { ANIME_LIST_STATUSES } from "../../models/anime-list-entry.js";

export const saveAnimeListEntrySchema = z.object({
  animeSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  input: z.object({
    status: z.enum(ANIME_LIST_STATUSES),
    score: z.number().int().min(1).max(10).nullable().default(null),
    seasonProgress: z.array(z.object({
      order: z.number().int().positive(),
      watchedEpisodes: z.number().int().nonnegative(),
    })).max(100),
  }),
});

export const removeAnimeListEntrySchema = z.object({
  animeSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
