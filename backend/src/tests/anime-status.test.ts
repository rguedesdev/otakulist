import { describe, expect, it } from "vitest";

import {
  getAnimeStatusOverride,
  getEffectiveAnimeStatus,
  getOverallAnimeStatus,
  getTokyoDateKey,
} from "../src/services/anime/status.js";

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);
const now = date("2026-09-16");

describe("status automático de anime", () => {
  it("usa o calendário do Japão", () => {
    expect(getTokyoDateKey(new Date("2026-09-15T15:00:00.000Z"))).toBe("2026-09-16");
  });

  it.each([
    [{ startDate: date("2026-09-17") }, "ANNOUNCED"],
    [{ startDate: date("2026-09-16") }, "AIRING"],
    [{ startDate: date("2026-07-01"), endDate: date("2026-09-16") }, "AIRING"],
    [{ startDate: date("2026-07-01"), endDate: date("2026-09-15") }, "FINISHED"],
    [{}, "ANNOUNCED"],
  ] as const)("calcula o status pelas datas", (installment, expected) => {
    expect(getEffectiveAnimeStatus(installment, now)).toBe(expected);
  });

  it("prioriza a substituição manual", () => {
    expect(getEffectiveAnimeStatus({
      statusOverride: "CANCELLED",
      startDate: date("2026-07-01"),
      endDate: date("2026-09-30"),
    }, now)).toBe("CANCELLED");
  });

  it("preserva cancelamentos legados", () => {
    expect(getEffectiveAnimeStatus({ status: "CANCELLED", startDate: date("2026-07-01") }, now)).toBe("CANCELLED");
  });

  it("preserva como manual um finalizado legado sem data final", () => {
    const installment = { status: "FINISHED" as const, startDate: date("2020-01-01") };
    expect(getAnimeStatusOverride(installment)).toBe("FINISHED");
    expect(getEffectiveAnimeStatus(installment, now)).toBe("FINISHED");
  });

  it("calcula o status geral a partir dos lançamentos", () => {
    expect(getOverallAnimeStatus([
      { startDate: date("2025-01-01"), endDate: date("2025-03-01") },
      { startDate: date("2026-09-01"), endDate: date("2026-09-30") },
    ], now)).toBe("AIRING");
  });
});
