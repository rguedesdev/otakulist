import { describe, expect, it } from "vitest";

import { createAnimeSchema } from "../src/services/anime/schemas.js";

const validInput = {
  input: {
    title: "Kimetsu no Yaiba",
    synopsis: "Uma obra com lançamentos em formatos diferentes.",
    coverUrl: "/animes/kimetsu.jpg",
    installments: [
      {
        order: 1,
        title: "Kimetsu no Yaiba",
        label: "1ª Temporada",
        format: "TV",
        synopsis: "Primeiro lançamento.",
        episodes: 26,
        status: "FINISHED",
      },
      {
        order: 2,
        title: "Mugen Train",
        label: "Continuação",
        format: "MOVIE",
        synopsis: "Continuação em filme.",
        episodes: 1,
        status: "FINISHED",
      },
    ],
    relatedWorks: [
      {
        relationType: "SOURCE_MATERIAL",
        workId: "507f1f77bcf86cd799439011",
      },
    ],
  },
};

describe("createAnimeSchema", () => {
  it("aceita uma sequência TV seguida por filme e mantém relacionados separados", () => {
    const result = createAnimeSchema.parse(validInput);
    expect(result.input.installments.map((item) => item.format)).toEqual(["TV", "MOVIE"]);
    expect(result.input.relatedWorks).toHaveLength(1);
  });

  it("recusa ordens sequenciais duplicadas", () => {
    const input = structuredClone(validInput);
    input.input.installments[1]!.order = 1;
    expect(createAnimeSchema.safeParse(input).success).toBe(false);
  });

  it("recusa links externos sem protocolo", () => {
    const input = { ...validInput, input: { ...validInput.input, externalLinks: { website: "exemplo.com" } } };
    expect(createAnimeSchema.safeParse(input).success).toBe(false);
  });

  it.each([
    ["PG-13", "PG13"],
    ["R-17+", "R17"],
    ["R+", "R18"],
    ["Rx", "R18"],
  ])("normaliza a classificação legada %s como %s", (legacy, normalized) => {
    const input = { ...validInput, input: { ...validInput.input, rating: legacy } };
    expect(createAnimeSchema.parse(input).input.rating).toBe(normalized);
  });
});
