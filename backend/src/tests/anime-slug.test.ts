import { describe, expect, it } from "vitest";

import { animeSlugFromTitle } from "../src/services/anime/slug.js";

describe("animeSlugFromTitle", () => {
  it("gera o slug automaticamente a partir do título", () => {
    expect(animeSlugFromTitle("  Kimetsu no Yaiba: Mugen Train  ")).toBe("kimetsu-no-yaiba-mugen-train");
  });

  it("normaliza acentos", () => {
    expect(animeSlugFromTitle("Coração de Dragão")).toBe("coracao-de-dragao");
  });
});
