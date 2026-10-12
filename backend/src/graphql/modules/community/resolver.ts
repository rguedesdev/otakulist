import { Anime } from "../../../models/anime.js";
import { AnimeListEntry } from "../../../models/anime-list-entry.js";
import { CatalogWork } from "../../../models/catalog-work.js";
import { PublicationListEntry } from "../../../models/publication-list-entry.js";
import { Manga } from "../../../models/manga.js";
import { LightNovel } from "../../../models/light-novel.js";
import { User } from "../../../models/user.js";
import { WorkFavorite } from "../../../models/work-favorite.js";
import { WorkReview } from "../../../models/work-review.js";
import { animeSlugSchema } from "../../../services/anime/schemas.js";
import { removeAnimeListEntrySchema, saveAnimeListEntrySchema } from "../../../services/anime-list/schemas.js";
import { getPublicationListEntrySchema, removePublicationListEntrySchema, savePublicationListEntrySchema } from "../../../services/publication-list/schemas.js";
import { saveWorkReviewSchema, workReviewTargetSchema } from "../../../services/review/schemas.js";
import { usernameSchema } from "../../../services/auth/schemas.js";
import type { IResolvers, MercuriusContext } from "mercurius";
import { badInput, unauthenticated } from "../../errors.js";
import { currentUser, profileViewer } from "../auth/authorization.js";
import { workHref, legacyAdultAnimeIds } from "../catalog/helpers.js";

export const communityResolvers: IResolvers<any, MercuriusContext> = {
  WorkEditSuggestion: {
    id: (suggestion: any) => suggestion.id ?? suggestion._id.toString(),
    anime: (suggestion: any) => suggestion.animeId ? Anime.findById(suggestion.animeId) : null,
    manga: (suggestion: any) => suggestion.mangaId ? Manga.findById(suggestion.mangaId) : null,
    lightNovel: (suggestion: any) => suggestion.lightNovelId ? LightNovel.findById(suggestion.lightNovelId) : null,
    medium: (suggestion: any) => suggestion.lightNovelId ? "LIGHT_NOVEL" : suggestion.mangaId ? "MANGA" : "ANIME",
    proposer: async (suggestion: any) => {
      const user = await User.findById(suggestion.proposerId);
      return user ? { ...user.toObject(), id: user.id } : null;
    },
    createdAt: (suggestion: any) => suggestion.createdAt.toISOString()
  },
  AnimeListEntry: {
    id: (entry: any) => entry.id ?? entry._id.toString(),
    anime: async (entry: any) => Anime.findById(entry.animeId),
    createdAt: (entry: any) => entry.createdAt.toISOString(),
    updatedAt: (entry: any) => entry.updatedAt.toISOString()
  },
  PublicationListEntry: {
    id: (entry: any) => entry.id ?? entry._id.toString(),
    work: async (entry: any) => {
      const work = await CatalogWork.findById(entry.workId);
      return work ? { ...work.toObject(), id: work.id, href: workHref(work) } : null;
    },
    totalChapters: async (entry: any) => {
      const work = await CatalogWork.findById(entry.workId).select("medium entityId");
      if (!work) return 0;
      const publication = work.medium === "MANGA"
        ? await Manga.findById(work.entityId).select("chapters")
        : await LightNovel.findById(work.entityId).select("chapters");
      return publication?.chapters ?? 0;
    },
    genres: async (entry: any) => {
      const work = await CatalogWork.findById(entry.workId).select("medium entityId");
      if (!work) return [];
      const publication = work.medium === "MANGA"
        ? await Manga.findById(work.entityId).select("genres")
        : await LightNovel.findById(work.entityId).select("genres");
      return publication?.genres ?? [];
    },
    createdAt: (entry: any) => entry.createdAt.toISOString(),
    updatedAt: (entry: any) => entry.updatedAt.toISOString()
  },
  WorkReview: {
    updatedAt: (review: any) => review.updatedAt.toISOString()
  },
  PublicWorkReview: {
    id: (review: any) => review.id ?? review._id.toString(),
    updatedAt: (review: any) => review.updatedAt.toISOString()
  },
  UserWorkReview: {
    id: (review: any) => review.id ?? review._id.toString(),
    updatedAt: (review: any) => review.updatedAt.toISOString()
  },
  Query: {
    myAnimeListEntry: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = animeSlugSchema.safeParse({ slug: args.animeSlug });
      if (!result.success) badInput("Anime inválido");
      const anime = await Anime.findOne({ slug: result.data.slug }).select("_id");
      if (!anime) return null;
      return AnimeListEntry.findOne({ userId: user._id, animeId: anime._id });
    },
    myPublicationListEntry: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = getPublicationListEntrySchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        medium: result.data.medium,
        slug: result.data.slug,
        publicationStatus: "PUBLISHED",
      }).select("_id");
      if (!work) return null;
      return PublicationListEntry.findOne({ userId: user._id, workId: work._id });
    },
    animeList: async (_root, args, context: MercuriusContext) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success) badInput("Nome de usuário inválido");
      const user = await User.findOne({ username: result.data.username }).select("_id hideAdultContentFromVisitors");
      if (!user) return [];
      const viewer = await profileViewer(context);
      const isOwner = Boolean(viewer?._id.equals(user._id));
      const includeAdult = isOwner || (Boolean(args.includeAdult) && !user.hideAdultContentFromVisitors);
      const hiddenAnimeIds = await legacyAdultAnimeIds(includeAdult);
      const works = await CatalogWork.find({
        medium: "ANIME",
        publicationStatus: "PUBLISHED",
        ...(includeAdult ? {} : { adultContent: { $ne: true } }),
        ...(hiddenAnimeIds.length ? { entityId: { $nin: hiddenAnimeIds } } : {}),
      }).select("entityId");
      return AnimeListEntry.find({
        userId: user._id,
        animeId: { $in: works.map((work) => work.entityId) },
      }).sort({ updatedAt: -1 });
    },
    publicationList: async (_root, args, context: MercuriusContext) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success || !["MANGA", "LIGHT_NOVEL"].includes(args.medium)) badInput("Lista inválida");
      const user = await User.findOne({ username: result.data.username }).select("_id hideAdultContentFromVisitors");
      if (!user) return [];
      const viewer = await profileViewer(context);
      const isOwner = Boolean(viewer?._id.equals(user._id));
      const includeAdult = isOwner || (Boolean(args.includeAdult) && !user.hideAdultContentFromVisitors);
      const works = await CatalogWork.find({
        medium: args.medium,
        publicationStatus: "PUBLISHED",
        ...(includeAdult ? {} : { adultContent: { $ne: true } }),
      }).select("_id");
      return PublicationListEntry.find({
        userId: user._id,
        workId: { $in: works.map((work) => work._id) },
      }).sort({ updatedAt: -1 });
    },
    userFavorites: async (_root, args, context: MercuriusContext) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success) badInput("Nome de usuário inválido");
      const user = await User.findOne({ username: result.data.username })
        .select("_id hideAdultContentFromVisitors");
      if (!user) return [];

      const viewer = await profileViewer(context);
      const isOwner = Boolean(viewer?._id.equals(user._id));
      const includeAdult = isOwner || (Boolean(args.includeAdult) && !user.hideAdultContentFromVisitors);
      const favorites = await WorkFavorite.find({ userId: user._id }).sort({ createdAt: -1 });
      const hiddenAnimeIds = await legacyAdultAnimeIds(includeAdult);
      const works = await CatalogWork.find({
        _id: { $in: favorites.map((favorite) => favorite.workId) },
        publicationStatus: "PUBLISHED",
        ...(includeAdult ? {} : { adultContent: { $ne: true } }),
        ...(hiddenAnimeIds.length ? { entityId: { $nin: hiddenAnimeIds } } : {}),
      });
      const worksById = new Map(works.map((work) => [work.id, work]));

      return favorites.flatMap((favorite) => {
        const work = worksById.get(favorite.workId.toString());
        if (!work) return [];
        return [{
          id: favorite.id,
          createdAt: favorite.createdAt.toISOString(),
          work: { ...work.toObject(), id: work.id, href: workHref(work) },
        }];
      });
    },
    myWorkFavorite: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        ...result.data,
        publicationStatus: "PUBLISHED",
      }).select("_id");
      if (!work) return false;
      return Boolean(await WorkFavorite.exists({ userId: user._id, workId: work._id }));
    },
    userReviews: async (_root, args) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success) badInput("Nome de usuário inválido");
      const user = await User.findOne({ username: result.data.username }).select("_id");
      if (!user) return [];

      const reviews = await WorkReview.find({ userId: user._id }).sort({ updatedAt: -1 });
      const works = await CatalogWork.find({
        _id: { $in: reviews.map((review) => review.workId) },
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      });
      const worksById = new Map(works.map((work) => [work.id, work]));

      return reviews.flatMap((review) => {
        const work = worksById.get(review.workId.toString());
        if (!work) return [];
        return [{
          ...review.toObject(),
          id: review.id,
          work: { ...work.toObject(), id: work.id, href: workHref(work) },
        }];
      });
    },
    workReviewComments: async (_root, args) => {
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({ ...result.data, publicationStatus: "PUBLISHED" }).select("_id");
      if (!work) return [];

      const reviews = await WorkReview.find({
        workId: work._id,
        comment: { $type: "string", $ne: "" },
      }).sort({ updatedAt: -1 });
      const users = await User.find({ _id: { $in: reviews.map((review) => review.userId) } })
        .select("username displayName role avatarUrl createdAt");
      const usersById = new Map(users.map((user) => [user.id, user]));

      return reviews.flatMap((review) => {
        const author = usersById.get(review.userId.toString());
        return author ? [{ ...review.toObject(), id: review.id, author }] : [];
      });
    },
    myWorkReview: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({ ...result.data, publicationStatus: "PUBLISHED" }).select("_id");
      if (!work) return null;
      return WorkReview.findOne({ userId: user._id, workId: work._id });
    }
  },
  Mutation: {
    saveAnimeListEntry: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = saveAnimeListEntrySchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const anime = await Anime.findOne({ slug: result.data.animeSlug });
      if (!anime || anime.publicationStatus !== "PUBLISHED") badInput("Anime não encontrado");
      const installmentsByOrder = new Map(anime.installments.map((installment) => [installment.order, installment]));
      if (new Set(result.data.input.seasonProgress.map((item) => item.order)).size !== result.data.input.seasonProgress.length) {
        badInput("O progresso de uma temporada não pode ser repetido");
      }
      for (const progress of result.data.input.seasonProgress) {
        const installment = installmentsByOrder.get(progress.order);
        if (!installment || (installment.episodes > 0 && progress.watchedEpisodes > installment.episodes)) {
          badInput("Progresso de temporada inválido");
        }
      }

      return AnimeListEntry.findOneAndUpdate(
        { userId: user._id, animeId: anime._id },
        { ...result.data.input, userId: user._id, animeId: anime._id },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    },
    removeAnimeListEntry: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = removeAnimeListEntrySchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const anime = await Anime.findOne({ slug: result.data.animeSlug }).select("_id");
      if (!anime) badInput("Anime não encontrado");

      const deletion = await AnimeListEntry.deleteOne({ userId: user._id, animeId: anime._id });
      return deletion.deletedCount > 0;
    },
    savePublicationListEntry: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = savePublicationListEntrySchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { medium, slug, input } = result.data;
      const work = await CatalogWork.findOne({ medium, slug, publicationStatus: "PUBLISHED" });
      if (!work) badInput("Obra não encontrada");
      const publication = medium === "MANGA"
        ? await Manga.findById(work.entityId).select("chapters")
        : await LightNovel.findById(work.entityId).select("chapters");
      if (!publication || (publication.chapters > 0 && input.readChapters > publication.chapters)) {
        badInput("Progresso de capítulos inválido");
      }

      return PublicationListEntry.findOneAndUpdate(
        { userId: user._id, workId: work._id },
        { ...input, userId: user._id, workId: work._id },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    },
    removePublicationListEntry: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = removePublicationListEntrySchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        medium: result.data.medium,
        slug: result.data.slug,
      }).select("_id");
      if (!work) badInput("Obra não encontrada");
      const deletion = await PublicationListEntry.deleteOne({ userId: user._id, workId: work._id });
      return deletion.deletedCount > 0;
    },
    setWorkFavorite: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        ...result.data,
        publicationStatus: "PUBLISHED",
      }).select("_id");
      if (!work) badInput("Obra não encontrada");

      if (args.favorite) {
        await WorkFavorite.findOneAndUpdate(
          { userId: user._id, workId: work._id },
          { userId: user._id, workId: work._id },
          { upsert: true, setDefaultsOnInsert: true },
        );
        return true;
      }

      await WorkFavorite.deleteOne({ userId: user._id, workId: work._id });
      return false;
    },
    saveWorkReview: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = saveWorkReviewSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const { medium, slug, input } = result.data;
      const work = await CatalogWork.findOne({ medium, slug, publicationStatus: "PUBLISHED" }).select("_id");
      if (!work) badInput("Obra não encontrada");
      return WorkReview.findOneAndUpdate(
        { userId: user._id, workId: work._id },
        { ...input, userId: user._id, workId: work._id },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    }
  }
};
