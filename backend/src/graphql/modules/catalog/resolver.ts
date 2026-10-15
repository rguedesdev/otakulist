import { Anime } from "../../../models/anime.js";
import { CatalogWork } from "../../../models/catalog-work.js";
import { Manga } from "../../../models/manga.js";
import { LightNovel } from "../../../models/light-novel.js";
import { WorkReview } from "../../../models/work-review.js";
import type { IResolvers, MercuriusContext } from "mercurius";
import { workHref, effectiveCatalogWorkStatus, legacyAdultAnimeIds } from "./helpers.js";

export const catalogResolvers: IResolvers<any, MercuriusContext> = {
  RelatedWork: {
    id: (work: any) => work.id ?? work._id.toString(),
    status: effectiveCatalogWorkStatus
  },
  WorkSearchResult: {
    id: (work: any) => work.id ?? work._id.toString(),
    href: (work: any) => work.href ?? workHref(work),
    status: effectiveCatalogWorkStatus
  },
  Query: {
    topRatedWorks: async (_root, args) => {
      const hiddenAnimeIds = await legacyAdultAnimeIds(Boolean(args.includeAdult));
      const limit = Number.isInteger(args.limit)
        ? Math.min(Math.max(args.limit, 1), 100)
        : 5;
      const ranking = await WorkReview.aggregate<{
        work: {
          title: string;
          slug: string;
          medium: "ANIME" | "MANGA" | "LIGHT_NOVEL";
          coverUrl: string;
        };
        score: number;
        ratingCount: number;
      }>([
        {
          $group: {
            _id: "$workId",
            score: { $avg: "$score" },
            ratingCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: CatalogWork.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "work",
          },
        },
        { $unwind: "$work" },
        {
          $match: {
            "work.publicationStatus": "PUBLISHED",
            ...(args.medium ? { "work.medium": args.medium } : {}),
            ...(args.includeAdult ? {} : { "work.adultContent": { $ne: true } }),
            ...(hiddenAnimeIds.length ? { "work.entityId": { $nin: hiddenAnimeIds } } : {}),
          },
        },
        { $sort: { score: -1, ratingCount: -1, "work.title": 1 } },
        { $limit: limit },
      ]);

      return ranking.map((item) => ({
        title: item.work.title,
        slug: item.work.slug,
        medium: item.work.medium,
        coverUrl: item.work.coverUrl,
        score: item.score,
        ratingCount: item.ratingCount,
      }));
    },
    catalogRankingWorks: async (_root, args) => {
      const medium = args.medium as "ANIME" | "MANGA" | "LIGHT_NOVEL";
      const hiddenAnimeIds = medium === "ANIME" ? await legacyAdultAnimeIds(Boolean(args.includeAdult)) : [];
      return CatalogWork.aggregate<{
        title: string;
        slug: string;
        coverUrl: string;
        score: number;
        ratingCount: number;
      }>([
        {
          $match: {
            medium,
            publicationStatus: "PUBLISHED",
            ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
            ...(hiddenAnimeIds.length ? { entityId: { $nin: hiddenAnimeIds } } : {}),
          },
        },
        {
          $lookup: {
            from: WorkReview.collection.name,
            localField: "_id",
            foreignField: "workId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            score: { $ifNull: [{ $avg: "$reviews.score" }, 0] },
            ratingCount: { $size: "$reviews" },
          },
        },
        { $sort: { score: -1, ratingCount: -1, title: 1 } },
        { $limit: 100 },
        { $project: { _id: 0, title: 1, slug: 1, coverUrl: 1, score: 1, ratingCount: 1 } },
      ]);
    },
    discoveryWorks: async (_root, args) => {
      const publishedFilter = {
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      };
      const [animes, mangas, novels] = await Promise.all([
        Anime.aggregate<{ title: string; slug: string; coverUrl: string; synopsis: string }>([
          { $match: { ...publishedFilter, ...(args.includeAdult ? {} : { rating: { $ne: "R18" } }) } },
          { $sample: { size: 1 } },
          { $project: { title: 1, slug: 1, coverUrl: 1, synopsis: 1 } },
        ]),
        Manga.aggregate<{ title: string; slug: string; coverUrl: string; synopsis: string }>([
          { $match: publishedFilter },
          { $sample: { size: 1 } },
          { $project: { title: 1, slug: 1, coverUrl: 1, synopsis: 1 } },
        ]),
        LightNovel.aggregate<{ title: string; slug: string; coverUrl: string; synopsis: string }>([
          { $match: publishedFilter },
          { $sample: { size: 1 } },
          { $project: { title: 1, slug: 1, coverUrl: 1, synopsis: 1 } },
        ]),
      ]);

      return [
        ...animes.map((item) => ({ ...item, medium: "ANIME", description: item.synopsis })),
        ...mangas.map((item) => ({ ...item, medium: "MANGA", description: item.synopsis })),
        ...novels.map((item) => ({ ...item, medium: "LIGHT_NOVEL", description: item.synopsis })),
      ];
    },
    searchWorks: async (_root, args) => {
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const hiddenAnimeIds = await legacyAdultAnimeIds(Boolean(args.includeAdult));
      const [animeIds, mangaIds, lightNovelIds] = await Promise.all([
        !args.medium || args.medium === "ANIME"
          ? Anime.distinct("_id", {
              "alternativeTitles.title": { $regex: safeQuery, $options: "i" },
              publicationStatus: "PUBLISHED",
              ...(args.includeAdult ? {} : { adultContent: { $ne: true }, rating: { $ne: "R18" }, _id: { $nin: hiddenAnimeIds } }),
            })
          : Promise.resolve([]),
        !args.medium || args.medium === "MANGA"
          ? Manga.distinct("_id", {
              "alternativeTitles.title": { $regex: safeQuery, $options: "i" },
              publicationStatus: "PUBLISHED",
              ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
            })
          : Promise.resolve([]),
        !args.medium || args.medium === "LIGHT_NOVEL"
          ? LightNovel.distinct("_id", {
              "alternativeTitles.title": { $regex: safeQuery, $options: "i" },
              publicationStatus: "PUBLISHED",
              ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
            })
          : Promise.resolve([]),
      ]);
      const matchingTitles: Record<string, unknown>[] = [
        ...(animeIds.length ? [{ medium: "ANIME", entityId: { $in: animeIds } }] : []),
        ...(mangaIds.length ? [{ medium: "MANGA", entityId: { $in: mangaIds } }] : []),
        ...(lightNovelIds.length ? [{ medium: "LIGHT_NOVEL", entityId: { $in: lightNovelIds } }] : []),
      ];
      return CatalogWork.find({
        $or: [
          { title: { $regex: safeQuery, $options: "i" } },
          ...matchingTitles,
        ],
        publicationStatus: "PUBLISHED",
        ...(args.medium ? { medium: args.medium } : {}),
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
        ...(hiddenAnimeIds.length ? { entityId: { $nin: hiddenAnimeIds } } : {}),
      }).sort({ title: 1 }).limit(12);
    }
  }
};
