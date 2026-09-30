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

  it("aceita total de episódios em aberto representado por zero", () => {
    const input = structuredClone(validInput);
    input.input.installments[0]!.episodes = 0;
    input.input.installments[0]!.status = "AIRING";
    expect(createAnimeSchema.safeParse(input).success).toBe(true);
  });

  it("aceita transmissão opcional para anime TV", () => {
    const input = structuredClone(validInput);
    input.input.installments[0]!.broadcastDay = "THURSDAY";
    input.input.installments[0]!.broadcastTime = "23:56";
    const installment = createAnimeSchema.parse(input).input.installments[0];
    expect(installment?.broadcastDay).toBe("THURSDAY");
    expect(installment?.broadcastTime).toBe("23:56");
  });

  it("exige dia e horário de transmissão juntos", () => {
    const input = structuredClone(validInput);
    input.input.installments[0]!.broadcastDay = "THURSDAY";
    expect(createAnimeSchema.safeParse(input).success).toBe(false);
  });

  it("recusa transmissão semanal em formato que não seja TV", () => {
    const input = structuredClone(validInput);
    input.input.installments[1]!.broadcastDay = "THURSDAY";
    input.input.installments[1]!.broadcastTime = "23:56";
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
