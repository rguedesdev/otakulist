import { Anime } from "../../../models/anime.js";
import { CatalogWork } from "../../../models/catalog-work.js";
import { WorkReview } from "../../../models/work-review.js";
import { getOverallAnimeStatus } from "../../../services/anime/status.js";

export function workHref(work: { medium: string; slug: string }) {
  const segment = work.medium === "LIGHT_NOVEL" ? "light-novel" : work.medium.toLowerCase();
  return `/${segment}/${work.slug}`;
}

export async function effectiveCatalogWorkStatus(work: any) {
  if (work.medium !== "ANIME" || !work.entityId) return work.status;
  const anime = await Anime.findById(work.entityId).select("installments.status installments.statusOverride installments.startDate installments.endDate");
  return anime ? getOverallAnimeStatus(anime.installments) : work.status;
}

export async function legacyAdultAnimeIds(includeAdult: boolean) {
  if (includeAdult) return [];
  return Anime.find({ rating: { $in: ["R18", "RPLUS", "R+", "R+ - Mild Nudity", "R+ — Mild Nudity", "Rx"] } }).distinct("_id");
}

export async function reviewSummaryFor(medium: "ANIME" | "MANGA" | "LIGHT_NOVEL", entityId: any) {
  const work = await CatalogWork.findOne({ medium, entityId });
  if (!work) return { average: 0, count: 0 };
  const [summary] = await WorkReview.aggregate<{ average: number; count: number }>([
    { $match: { workId: work._id } },
    { $group: { _id: null, average: { $avg: "$score" }, count: { $sum: 1 } } },
  ]);
  return summary ? { average: summary.average, count: summary.count } : { average: 0, count: 0 };
}
