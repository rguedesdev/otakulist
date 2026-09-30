import { describe, expect, it } from "vitest";

import { getDailyRotation, pickDailyItem } from "../src/services/weekly-feature.js";

describe("destaque diário", () => {
  it("mantém o mesmo item durante o dia no horário de São Paulo", () => {
    const items = ["A", "B", "C"];

    expect(pickDailyItem(items, new Date("2026-09-21T12:00:00.000Z")))
      .toBe(pickDailyItem(items, new Date("2026-09-21T12:00:00.000Z")));
  });

  it("avança a rotação no dia seguinte", () => {
    const items = ["A", "B", "C"];

    expect(pickDailyItem(items, new Date("2026-09-22T12:00:00.000Z")))
      .not.toBe(pickDailyItem(items, new Date("2026-09-27T12:00:00.000Z")));
  });

  it("considera a virada do dia no horário de São Paulo", () => {
    const beforeMidnight = new Date("2026-09-28T02:59:59.000Z");
    const afterMidnight = new Date("2026-09-28T03:00:00.000Z");

    expect(getDailyRotation(afterMidnight)).toBe(getDailyRotation(beforeMidnight) + 1);
  });

  it("retorna null quando não há candidatos", () => {
    expect(pickDailyItem([], new Date("2026-09-21T12:00:00.000Z"))).toBeNull();
  });
});
