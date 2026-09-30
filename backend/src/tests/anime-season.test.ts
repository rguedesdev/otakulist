import { describe, expect, it } from "vitest";

import {
  getAnimeSeasonDateRanges,
  getAnimeSeasonFromDate,
  getInstallmentSeason,
  parseBroadcastSeason,
} from "../src/services/anime/season.js";

describe("temporadas de anime", () => {
  it.each([
    ["2026-03-20", "WINTER", 2026],
    ["2026-03-21", "SPRING", 2026],
    ["2026-06-20", "SPRING", 2026],
    ["2026-06-21", "SUMMER", 2026],
    ["2026-09-22", "SUMMER", 2026],
    ["2026-09-23", "FALL", 2026],
    ["2026-12-21", "FALL", 2026],
    ["2026-12-22", "WINTER", 2027],
  ])("classifica %s como %s %i", (date, season, year) => {
    expect(getAnimeSeasonFromDate(new Date(`${date}T00:00:00.000Z`))).toEqual({ season, year });
  });

  it.each([
    ["Verão 2026", "SUMMER"],
    ["verao de 2026", "SUMMER"],
    ["Outono 2026", "FALL"],
    ["Fall 2026", "FALL"],
  ])("normaliza o rótulo %s", (label, season) => {
    expect(parseBroadcastSeason(label)).toEqual({ season, year: 2026 });
  });

  it("prioriza um rótulo válido sobre a data", () => {
    expect(getInstallmentSeason({
      broadcastSeason: "Primavera 2026",
      startDate: new Date("2026-07-10T00:00:00.000Z"),
    })).toEqual({ season: "SPRING", year: 2026 });
  });

  it("usa a data quando o rótulo está ausente ou inválido", () => {
    expect(getInstallmentSeason({
      broadcastSeason: "Não informada",
      startDate: new Date("2026-07-10T00:00:00.000Z"),
    })).toEqual({ season: "SUMMER", year: 2026 });
  });

  it("representa o inverno como uma faixa contínua entre dois anos", () => {
    expect(getAnimeSeasonDateRanges("WINTER", 2026)).toEqual([
      { start: new Date("2025-12-22T00:00:00.000Z"), end: new Date("2026-03-21T00:00:00.000Z") },
    ]);
  });
});
