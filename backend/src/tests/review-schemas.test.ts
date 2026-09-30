import { describe, expect, it } from "vitest";

import { saveWorkReviewSchema } from "../src/services/review/schemas.js";

const target = { medium: "ANIME", slug: "sousou-no-frieren" } as const;

describe("saveWorkReviewSchema", () => {
  it("aceita nota com comentário opcional", () => {
    const result = saveWorkReviewSchema.parse({ ...target, input: { score: 9 } });
    expect(result.input).toEqual({ score: 9, comment: null });
  });

  it("aceita notas com uma casa decimal entre 1 e 10", () => {
    expect(saveWorkReviewSchema.safeParse({ ...target, input: { comment: "Ótimo" } }).success).toBe(false);
    expect(saveWorkReviewSchema.safeParse({ ...target, input: { score: 7.9 } }).success).toBe(true);
    expect(saveWorkReviewSchema.safeParse({ ...target, input: { score: 7.95 } }).success).toBe(false);
    expect(saveWorkReviewSchema.safeParse({ ...target, input: { score: 11 } }).success).toBe(false);
  });

  it("limita o comentário a 2000 caracteres", () => {
    expect(saveWorkReviewSchema.safeParse({ ...target, input: { score: 8, comment: "a".repeat(2_001) } }).success).toBe(false);
  });
});
