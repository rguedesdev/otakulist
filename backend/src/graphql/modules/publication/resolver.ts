import { CatalogWork } from "../../../models/catalog-work.js";
import { Character } from "../../../models/character.js";
import { Manga } from "../../../models/manga.js";
import { LightNovel } from "../../../models/light-novel.js";
import { Magazine } from "../../../models/magazine.js";
import { Person } from "../../../models/person.js";
import { Publisher } from "../../../models/publisher.js";
import { WorkReview } from "../../../models/work-review.js";
import { animeSlugSchema } from "../../../services/anime/schemas.js";
import { createLightNovelSchema, createMangaSchema, updateLightNovelSchema, updateMangaSchema } from "../../../services/publication-work/schemas.js";
import { GraphQLError } from "graphql";
import type { IResolvers, MercuriusContext } from "mercurius";
import { badInput } from "../../errors.js";
import { currentUser, requireZeus } from "../auth/authorization.js";
import { reviewSummaryFor, workHref } from "../catalog/helpers.js";
import { animeSlugFromTitle } from "../../../services/anime/slug.js";
import { cleanupReplacedUploadImages } from "../../../services/upload-cleanup.js";

async function publicationWorkRelations(references: any[] = []) {
  const works = await CatalogWork.find({ _id: { $in: references.map((item) => item.workId) } });
  const byId = new Map(works.map((work) => [work.id, work]));
  return references.flatMap((reference) => {
    const work = byId.get(reference.workId.toString());
    return work ? [{ ...work.toObject(), id: work.id, relationType: reference.relationType, href: workHref(work) }] : [];
  });
}

async function validatePublicationWorkLinks(input: any) {
  const relatedIds = [...new Set(input.relatedWorks.map((item: any) => item.workId))];
  const characterIds = [...new Set(input.characterIds)];
  const personIds = [...new Set(input.staffCredits.map((credit: any) => credit.personId))];
  const [relatedCount, characterCount, personCount, publisherCount, magazineCount] = await Promise.all([
    CatalogWork.countDocuments({ _id: { $in: relatedIds } }),
    Character.countDocuments({ _id: { $in: characterIds } }),
    Person.countDocuments({ _id: { $in: personIds } }),
    input.publisherId ? Publisher.countDocuments({ _id: input.publisherId }) : Promise.resolve(0),
    input.magazineId ? Magazine.countDocuments({ _id: input.magazineId }) : Promise.resolve(0),
  ]);
  if (relatedCount !== relatedIds.length) badInput("Uma das obras relacionadas não existe mais");
  if (characterCount !== characterIds.length) badInput("Um dos personagens vinculados não existe mais");
  if (personCount !== personIds.length) badInput("Uma das pessoas vinculadas à staff não existe mais");
  if (input.publisherId && publisherCount !== 1) badInput("A editora vinculada não existe mais");
  if (input.magazineId && magazineCount !== 1) badInput("A magazine vinculada não existe mais");
}

function publicationWorkValues(input: any) {
  return {
    ...input,
    publisher: input.publisherId ? null : input.publisher,
    magazine: input.magazineId ? null : input.magazine,
    externalLinks: input.externalLinks ?? {},
    storeLinks: input.storeLinks ?? {},
    startDate: input.startDate ? new Date(`${input.startDate}T00:00:00.000Z`) : null,
    endDate: input.endDate ? new Date(`${input.endDate}T00:00:00.000Z`) : null,
  };
}

async function syncCatalogWork(medium: "MANGA" | "LIGHT_NOVEL", work: any) {
  return CatalogWork.findOneAndUpdate(
    { medium, entityId: work._id },
    { title: work.title, slug: work.slug, coverUrl: work.coverUrl, status: work.status, publicationStatus: work.publicationStatus, adultContent: work.adultContent },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

async function createPublicationWork(Model: any, medium: "MANGA" | "LIGHT_NOVEL", label: string, input: any, user: any) {
  await validatePublicationWorkLinks(input);
  try {
    const work = await Model.create({ ...publicationWorkValues(input), slug: animeSlugFromTitle(input.title), createdBy: user._id });
    try {
      await syncCatalogWork(medium, work);
    } catch (error) {
      await Model.deleteOne({ _id: work._id });
      throw error;
    }
    return work;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new GraphQLError(`Já existe ${label} com este título`, { extensions: { code: "CONFLICT" } });
    }
    throw error;
  }
}

async function updatePublicationWork(Model: any, medium: "MANGA" | "LIGHT_NOVEL", label: string, slug: string, input: any) {
  const work = await Model.findOne({ slug });
  if (!work) throw new GraphQLError(`${label} não encontrado`, { extensions: { code: "NOT_FOUND" } });
  const previousImages = work.toObject();
  await validatePublicationWorkLinks(input);
  try {
    work.set({ ...publicationWorkValues(input), slug: animeSlugFromTitle(input.title) });
    await work.save();
    await syncCatalogWork(medium, work);
    await cleanupReplacedUploadImages(previousImages, work.toObject());
    return work;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new GraphQLError(`Já existe ${label.toLowerCase()} com este título`, { extensions: { code: "CONFLICT" } });
    }
    throw error;
  }
}

export const publicationResolvers: IResolvers<any, MercuriusContext> = {
  Manga: {
    id: (manga: any) => manga.id ?? manga._id.toString(),
    startDate: (manga: any) => manga.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: (manga: any) => manga.endDate?.toISOString().slice(0, 10) ?? null,
    createdAt: (manga: any) => manga.createdAt.toISOString(),
    updatedAt: (manga: any) => manga.updatedAt.toISOString(),
    reviewSummary: (manga: any) => reviewSummaryFor("MANGA", manga._id),
    characters: (manga: any) => Character.find({ _id: { $in: manga.characterIds ?? [] } }),
    relatedWorks: (manga: any) => publicationWorkRelations(manga.relatedWorks),
    publisherEntity: (manga: any) => manga.publisherId ? Publisher.findById(manga.publisherId) : null,
    magazineEntity: (manga: any) => manga.magazineId ? Magazine.findById(manga.magazineId) : null
  },
  LightNovel: {
    id: (novel: any) => novel.id ?? novel._id.toString(),
    startDate: (novel: any) => novel.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: (novel: any) => novel.endDate?.toISOString().slice(0, 10) ?? null,
    createdAt: (novel: any) => novel.createdAt.toISOString(),
    updatedAt: (novel: any) => novel.updatedAt.toISOString(),
    reviewSummary: (novel: any) => reviewSummaryFor("LIGHT_NOVEL", novel._id),
    characters: (novel: any) => Character.find({ _id: { $in: novel.characterIds ?? [] } }),
    relatedWorks: (novel: any) => publicationWorkRelations(novel.relatedWorks),
    publisherEntity: (novel: any) => novel.publisherId ? Publisher.findById(novel.publisherId) : null
  },
  StaffCredit: {
    person: (credit: any) => Person.findById(credit.personId)
  },
  Query: {
    manga: async (_root, args, context: MercuriusContext) => {
      const result = animeSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const manga = await Manga.findOne({ slug: result.data.slug });
      if (!manga) return null;
      if (manga.publicationStatus === "PUBLISHED") return manga;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? manga : null;
    },
    dailyMangaRecommendation: async (_root, args) => {
      const candidates = await WorkReview.aggregate<{ entityId: any }>([
        {
          $group: {
            _id: "$workId",
            score: { $avg: "$score" },
          },
        },
        { $match: { score: { $gt: 6 } } },
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
            "work.medium": "MANGA",
            "work.publicationStatus": "PUBLISHED",
            ...(args.includeAdult ? {} : { "work.adultContent": { $ne: true } }),
          },
        },
        { $sort: { "work.slug": 1 } },
        { $project: { _id: 0, entityId: "$work.entityId" } },
      ]);
      if (!candidates.length) return null;

      const dateKey = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
      const dateHash = Array.from(dateKey).reduce(
        (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0,
        2166136261,
      );
      const selected = candidates[dateHash % candidates.length];
      return Manga.findById(selected.entityId);
    },
    dailyLightNovelRecommendation: async (_root, args) => {
      const candidates = await WorkReview.aggregate<{ entityId: any }>([
        {
          $group: {
            _id: "$workId",
            score: { $avg: "$score" },
          },
        },
        { $match: { score: { $gt: 6 } } },
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
            "work.medium": "LIGHT_NOVEL",
            "work.publicationStatus": "PUBLISHED",
            ...(args.includeAdult ? {} : { "work.adultContent": { $ne: true } }),
          },
        },
        { $sort: { "work.slug": 1 } },
        { $project: { _id: 0, entityId: "$work.entityId" } },
      ]);
      if (!candidates.length) return null;

      const dateKey = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
      const dateHash = Array.from(dateKey).reduce(
        (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0,
        2166136261,
      );
      const selected = candidates[dateHash % candidates.length];
      return LightNovel.findById(selected.entityId);
    },
    recentPublishingMangas: async (_root, args) => {
      const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
      return Manga.find({
        publicationStatus: "PUBLISHED",
        status: "PUBLISHING",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      }).sort({ createdAt: -1 }).limit(limit);
    },
    browseMangas: async (_root, args) => Manga.find({
      publicationStatus: "PUBLISHED",
      ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
    }).sort({ title: 1, _id: 1 }),
    recentPublishingLightNovels: async (_root, args) => {
      const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
      return LightNovel.find({
        publicationStatus: "PUBLISHED",
        status: "PUBLISHING",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      }).sort({ createdAt: -1, _id: 1 }).limit(limit);
    },
    browseLightNovels: async (_root, args) => LightNovel.find({
      publicationStatus: "PUBLISHED",
      ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
    }).sort({ title: 1, _id: 1 }),
    lightNovel: async (_root, args, context: MercuriusContext) => {
      const result = animeSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const novel = await LightNovel.findOne({ slug: result.data.slug });
      if (!novel) return null;
      if (novel.publicationStatus === "PUBLISHED") return novel;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? novel : null;
    },
    publishingLightNovelSpotlight: async (_root, args) => {
      const [novel] = await LightNovel.aggregate([
        {
          $match: {
            publicationStatus: "PUBLISHED",
            status: "PUBLISHING",
            ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
          },
        },
        { $sample: { size: 1 } },
      ]);
      return novel ?? null;
    },
    adminMangas: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Manga.find(filter).sort({ updatedAt: -1, title: 1 });
    },
    adminLightNovels: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return LightNovel.find(filter).sort({ updatedAt: -1, title: 1 });
    }
  },
  Mutation: {
    createManga: async (_root, args, context: MercuriusContext) => {
      const user = await requireZeus(context);
      const result = createMangaSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return createPublicationWork(Manga, "MANGA", "um manga", result.data.input, user);
    },
    updateManga: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateMangaSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return updatePublicationWork(Manga, "MANGA", "Manga", result.data.slug, result.data.input);
    },
    createLightNovel: async (_root, args, context: MercuriusContext) => {
      const user = await requireZeus(context);
      const result = createLightNovelSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return createPublicationWork(LightNovel, "LIGHT_NOVEL", "uma light novel", result.data.input, user);
    },
    updateLightNovel: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateLightNovelSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return updatePublicationWork(LightNovel, "LIGHT_NOVEL", "Light novel", result.data.slug, result.data.input);
    }
  }
};
