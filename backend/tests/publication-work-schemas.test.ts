import { describe, expect, it } from "vitest";

import {
  createLightNovelSchema,
  createMangaSchema,
} from "../src/services/publication-work/schemas.js";

const commonInput = {
  title: "Sousou no Frieren",
  synopsis: "Uma jornada posterior à derrota do Rei Demônio.",
  coverUrl: "/mangas/sousou-no-frieren.jpg",
  status: "PUBLISHING",
  publicationStatus: "PUBLISHED",
  startDate: "2020-04-28",
  endDate: null,
  publisher: "Shogakukan",
  genres: ["Fantasia", "Aventura"],
  chapters: 140,
  volumes: 14,
  characterIds: ["507f1f77bcf86cd799439011"],
  staffCredits: [{ personId: "507f191e810c19729de860ea", role: "Mangaka", contribution: "História & Arte" }],
  relatedWorks: [{ relationType: "ADAPTATION", workId: "507f191e810c19729de860eb" }],
};

describe("schemas de obras editoriais", () => {
  it("aceita os campos próprios de manga", () => {
    const result = createMangaSchema.parse({
      input: { ...commonInput, magazine: "Weekly Shonen Sunday", demography: "Shounen", serialization: "Semanal" },
    });

    expect(result.input.magazine).toBe("Weekly Shonen Sunday");
    expect(result.input.demography).toBe("Shounen");
    expect(result.input.serialization).toBe("Semanal");
    expect(result.input.staffCredits[0]).toMatchObject({ role: "Mangaka", contribution: "História & Arte" });
  });

  it("aceita os campos próprios de light novel", () => {
    const result = createLightNovelSchema.parse({
      input: { ...commonInput, source: "Web novel" },
    });

    expect(result.input.source).toBe("Web novel");
  });

  it("recusa status editorial desconhecido", () => {
    const result = createMangaSchema.safeParse({ input: { ...commonInput, status: "AIRING" } });
    expect(result.success).toBe(false);
  });

  it("recusa identificadores inválidos nos vínculos", () => {
    const result = createLightNovelSchema.safeParse({
      input: { ...commonInput, characterIds: ["personagem-invalido"] },
    });
    expect(result.success).toBe(false);
  });

  it("recusa links sem protocolo ou caminho interno", () => {
    const result = createMangaSchema.safeParse({
      input: { ...commonInput, externalLinks: { website: "editora.example" } },
    });
    expect(result.success).toBe(false);
  });
});
