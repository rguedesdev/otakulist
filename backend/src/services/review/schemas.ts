import { z } from "zod";

const workTarget = {
  medium: z.enum(["ANIME", "MANGA", "LIGHT_NOVEL"]),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
};

export const workReviewTargetSchema = z.object(workTarget);

export const saveWorkReviewSchema = z.object({
  ...workTarget,
  input: z.object({
    score: z.number().min(1).max(10).refine(
      (value) => Number.isInteger(value * 10),
      "Use no máximo uma casa decimal na nota",
    ),
    comment: z.string().trim().max(2_000).nullish().transform((value) => value || null),
  }),
});
