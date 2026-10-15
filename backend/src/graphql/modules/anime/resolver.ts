import { GraphQLError } from "graphql";
import { Anime } from "../../../models/anime.js";
import { AnimeEditSuggestion } from "../../../models/anime-edit-suggestion.js";
import { CatalogWork } from "../../../models/catalog-work.js";
import { Character } from "../../../models/character.js";
import { Manga } from "../../../models/manga.js";
import { LightNovel } from "../../../models/light-novel.js";
import { MusicArtist } from "../../../models/music-artist.js";
import { Person } from "../../../models/person.js";
import { Studio } from "../../../models/studio.js";
import { animeSlugSchema, createAnimeSchema, updateAnimeSchema } from "../../../services/anime/schemas.js";
import { getAnimeSeasonDateRanges, getBroadcastSeasonPattern, installmentMatchesSeason, type AnimeSeason } from "../../../services/anime/season.js";
import { getAnimeStatusOverride, getEffectiveAnimeStatus, getOverallAnimeStatus, type AnimeStatus } from "../../../services/anime/status.js";
import { pickDailyItem } from "../../../services/weekly-feature.js";
import { animeSlugFromTitle } from "../../../services/anime/slug.js";
import type { IResolvers, MercuriusContext } from "mercurius";
import { badInput, unauthenticated } from "../../errors.js";
import { currentUser, requireZeus } from "../auth/authorization.js";
import { workHref, reviewSummaryFor } from "../catalog/helpers.js";
import { cleanupReplacedUploadImages } from "../../../services/upload-cleanup.js";

function normalizeAnimeRating(value: string | null | undefined) {
  const legacyRatings: Record<string, string> = {
    "PG-13": "PG13",
    "R-17+": "R17",
    "R+": "RPLUS",
    "R+ - Mild Nudity": "RPLUS",
    "R+ — Mild Nudity": "RPLUS",
    "R+ – Mild Nudity": "RPLUS",
    Rx: "R18",
  };
  return value ? legacyRatings[value] ?? value : value;
}

function animeInstallmentValues(installment: any) {
  const startDate = installment.startDate ? new Date(`${installment.startDate}T00:00:00.000Z`) : null;
  const endDate = installment.endDate ? new Date(`${installment.endDate}T00:00:00.000Z`) : null;
  const statusOverride = installment.statusOverride === undefined
    ? installment.status as AnimeStatus
    : installment.statusOverride as AnimeStatus | null;
  const values = {
    ...installment,
    studio: installment.studioId ? null : installment.studioName,
    studioName: undefined,
    startDate,
    endDate,
    statusOverride,
    status: "ANNOUNCED" as AnimeStatus,
  };
  return { ...values, status: getEffectiveAnimeStatus(values) };
}

export const animeResolvers: IResolvers<any, MercuriusContext> = {
  Anime: {
    id: (anime: any) => anime.id ?? anime._id.toString(),
    rating: (anime: any) => normalizeAnimeRating(anime.rating),
    createdAt: (anime: any) => anime.createdAt.toISOString(),
    updatedAt: (anime: any) => anime.updatedAt.toISOString(),
    reviewSummary: (anime: any) => reviewSummaryFor("ANIME", anime._id),
    relatedWorks: async (anime: any) => {
      const references = anime.relatedWorks ?? [];
      const works = await CatalogWork.find({ _id: { $in: references.map((item: any) => item.workId) } });
      const byId = new Map(works.map((work) => [work.id, work]));
      return references.flatMap((reference: any) => {
        const work = byId.get(reference.workId.toString());
        return work ? [{ ...work.toObject(), id: work.id, relationType: reference.relationType, href: workHref(work) }] : [];
      });
    },
    characterCredits: async (anime: any) => {
      const credits = anime.characterCredits ?? [];
      if (credits.length === 0) return [];
      const [characters, seiyuus] = await Promise.all([
        Character.find({ _id: { $in: credits.map((credit: any) => credit.characterId) } }),
        Person.find({ _id: { $in: credits.map((credit: any) => credit.seiyuuId) } }),
      ]);
      const charactersById = new Map(characters.map((character) => [character.id, character]));
      const seiyuusById = new Map(seiyuus.map((seiyuu) => [seiyuu.id, seiyuu]));
      return credits.flatMap((credit: any) => {
        const character = charactersById.get(credit.characterId.toString());
        const seiyuu = seiyuusById.get(credit.seiyuuId.toString());
        return character && seiyuu
          ? [{ characterId: character.id, seiyuuId: seiyuu.id, character, seiyuu }]
          : [];
      });
    },
    songCredits: async (anime: any) => {
      const credits = anime.songCredits ?? [];
      if (credits.length === 0) return [];
      const artistIds = credits.flatMap((credit: any) => [credit.artistId, ...(credit.featuredArtistIds ?? [])]);
      const artists = await MusicArtist.find({ _id: { $in: artistIds } });
      const artistsById = new Map(artists.map((artist) => [artist.id, artist]));
      return credits.flatMap((credit: any) => {
        const artist = artistsById.get(credit.artistId.toString());
        const values = typeof credit.toObject === "function" ? credit.toObject() : credit;
        const featuredArtists = (credit.featuredArtistIds ?? []).flatMap((id: any) => {
          const featured = artistsById.get(id.toString());
          return featured ? [featured] : [];
        });
        return artist ? [{ ...values, artistId: artist.id, artist, featuredArtists }] : [];
      });
    },
    staffCredits: async (anime: any) => {
      const credits = anime.staffCredits ?? [];
      const people = await Person.find({ _id: { $in: credits.map((credit: any) => credit.personId) } });
      const byId = new Map(people.map((person) => [person.id, person]));
      return credits.flatMap((credit: any) => {
        const person = byId.get(credit.personId.toString());
        return person ? [{ personId: person.id, role: credit.role, contribution: credit.contribution, person }] : [];
      });
    }
  },
  AnimeInstallment: {
    id: (installment: any) => installment.id ?? installment._id.toString(),
    status: (installment: any) => getEffectiveAnimeStatus(installment),
    statusOverride: (installment: any) => getAnimeStatusOverride(installment),
    studio: async (installment: any) => installment.studioId ? Studio.findById(installment.studioId) : null,
    studioName: (installment: any) => installment.studio ?? null,
    startDate: (installment: any) => installment.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: (installment: any) => installment.endDate?.toISOString().slice(0, 10) ?? null
  },
  Query: {
    dailyFeaturedAnime: async (_root, args) => {
      const candidates = await Anime.find({
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult
          ? {}
          : {
              adultContent: { $ne: true },
              rating: { $nin: ["R18", "RPLUS", "R+", "R+ - Mild Nudity", "R+ — Mild Nudity", "Rx"] },
            }),
      }).sort({ title: 1, _id: 1 });

      return pickDailyItem(candidates);
    },
    anime: async (_root, args, context: MercuriusContext) => {
      const result = animeSlugSchema.safeParse(args);
      if (!result.success) badInput("Slug inválido");

      const anime = await Anime.findOne({ slug: result.data.slug });
      if (!anime) return null;
      if (anime.publicationStatus === "PUBLISHED") return anime;

      const user = await currentUser(context);
      return user?.role === "ZEUS" ? anime : null;
    },
    seasonalAnime: async (_root, args) => {
      const season = args.season as AnimeSeason;
      const year = Number(args.year);
      const limit = args.limit == null ? null : Number(args.limit);
      if (!Number.isInteger(year) || year < 1900 || year > 3000) badInput("Ano de temporada inválido");
      if (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
        badInput("O limite deve estar entre 1 e 100");
      }

      const dateRanges = getAnimeSeasonDateRanges(season, year);
      const candidates = await Anime.find({
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult ? {} : {
          adultContent: { $ne: true },
          rating: { $nin: ["R18", "RPLUS", "R+", "R+ - Mild Nudity", "R+ — Mild Nudity", "Rx"] },
        }),
        $or: [
          { "installments.broadcastSeason": getBroadcastSeasonPattern(season, year) },
          ...dateRanges.map(({ start, end }) => ({
            "installments.startDate": { $gte: start, $lt: end },
          })),
        ],
      });

      const matches = candidates.flatMap((anime) => {
        const installments = anime.installments
          .filter((item) => installmentMatchesSeason(item, season, year))
          .sort((left, right) => {
            if (!left.startDate) return 1;
            if (!right.startDate) return -1;
            return left.startDate.getTime() - right.startDate.getTime();
          });
        const selectedInstallments = args.deduplicate === false ? installments : installments.slice(0, 1);
        return selectedInstallments.map((installment) => ({ anime, installment }));
      }).sort((left, right) => {
        const leftTime = left.installment.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const rightTime = right.installment.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return leftTime - rightTime || left.anime.title.localeCompare(right.anime.title, "pt-BR");
      });

      if (limit === null) return matches;

      const randomizedMatches = [...matches];
      for (let index = randomizedMatches.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const current = randomizedMatches[index]!;
        randomizedMatches[index] = randomizedMatches[randomIndex]!;
        randomizedMatches[randomIndex] = current;
      }
      return randomizedMatches.slice(0, limit);
    },
    pendingWorkEditSuggestions: async (_root, _args, context: MercuriusContext) => {
      await requireZeus(context);
      return AnimeEditSuggestion.find({ status: "PENDING" }).sort({ createdAt: 1 });
    },
    adminAnimes: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query
        ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
        : {};
      return Anime.find(filter).sort({ updatedAt: -1, title: 1 });
    }
  },
  Mutation: {
    createAnime: async (_root, args, context: MercuriusContext) => {
      const user = await requireZeus(context);
      const result = createAnimeSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const input = result.data.input;
      try {
        const relatedIds = [...new Set(input.relatedWorks.map((item) => item.workId))];
        const existingRelatedWorks = await CatalogWork.countDocuments({ _id: { $in: relatedIds } });
        if (existingRelatedWorks !== relatedIds.length) badInput("Uma das obras relacionadas não existe mais");
        const personIds = [...new Set(input.staffCredits.map((credit) => credit.personId))];
        const existingPeople = await Person.countDocuments({ _id: { $in: personIds } });
        if (existingPeople !== personIds.length) badInput("Uma das pessoas vinculadas à staff não existe mais");
        const characterIds = [...new Set(input.characterCredits.map((credit) => credit.characterId))];
        const seiyuuIds = [...new Set(input.characterCredits.map((credit) => credit.seiyuuId))];
        const [existingCharacters, existingSeiyuus] = await Promise.all([
          Character.countDocuments({ _id: { $in: characterIds } }),
          Person.countDocuments({ _id: { $in: seiyuuIds }, roles: "SEIYUU" }),
        ]);
        if (existingCharacters !== characterIds.length) badInput("Um dos personagens vinculados não existe mais");
        if (existingSeiyuus !== seiyuuIds.length) badInput("Um dos seiyuus vinculados não existe mais");
        const artistIds = [...new Set(input.songCredits.flatMap((credit) => [credit.artistId, ...credit.featuredArtistIds]))];
        const existingArtists = await MusicArtist.countDocuments({ _id: { $in: artistIds } });
        if (existingArtists !== artistIds.length) badInput("Um dos artistas vinculados não existe mais");
        const studioIds = [...new Set(input.installments.flatMap((item) => item.studioId ? [item.studioId] : []))];
        const existingStudios = await Studio.countDocuments({ _id: { $in: studioIds } });
        if (existingStudios !== studioIds.length) badInput("Um dos estúdios vinculados não existe mais");

        const anime = await Anime.create({
          ...input,
          adultContent: input.adultContent || ["R18", "RPLUS"].includes(normalizeAnimeRating(input.rating) ?? ""),
          slug: animeSlugFromTitle(input.title),
          externalLinks: input.externalLinks ?? {},
          streamingLinks: input.streamingLinks ?? {},
          installments: input.installments.map(animeInstallmentValues),
          createdBy: user._id,
        });
        try {
          await CatalogWork.create({
            title: anime.title,
            slug: anime.slug,
            medium: "ANIME",
            coverUrl: anime.coverUrl,
            status: getOverallAnimeStatus(anime.installments),
            publicationStatus: anime.publicationStatus,
            adultContent: anime.adultContent,
            entityId: anime._id,
          });
        } catch (error) {
          await Anime.deleteOne({ _id: anime._id });
          throw error;
        }
        return anime;
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um anime cadastrado com este título", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    suggestWorkEdit: async (_root, args, context: MercuriusContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const medium = args.medium as "ANIME" | "MANGA" | "LIGHT_NOVEL";
      if (medium !== "ANIME" && medium !== "MANGA" && medium !== "LIGHT_NOVEL") badInput("Tipo de obra não suportado para sugestões");
      const work = medium === "ANIME"
        ? await Anime.findOne({ slug: args.slug, publicationStatus: "PUBLISHED" })
        : medium === "MANGA"
          ? await Manga.findOne({ slug: args.slug, publicationStatus: "PUBLISHED" })
          : await LightNovel.findOne({ slug: args.slug, publicationStatus: "PUBLISHED" });
      if (!work) throw new GraphQLError("Obra não encontrada", { extensions: { code: "NOT_FOUND" } });
      const input = args.input ?? {};
      let title = typeof input.title === "string" ? input.title.trim() : null;
      let synopsis = typeof input.synopsis === "string" ? input.synopsis.trim() : null;
      let genres = Array.isArray(input.genres) ? input.genres.map((item: unknown) => String(item).trim()).filter(Boolean) : null;
      if (title === work.title) title = null;
      if (synopsis === work.synopsis) synopsis = null;
      if (genres && JSON.stringify(genres) === JSON.stringify(work.genres)) genres = null;
      if (!title && !synopsis && !genres) badInput("Informe ao menos uma alteração sugerida");
      if (title !== null && (!title || title.length > 200)) badInput("O título deve ter até 200 caracteres");
      if (synopsis !== null && (!synopsis || synopsis.length > 10000)) badInput("A sinopse deve ter até 10.000 caracteres");
      if (genres && (genres.length > 30 || genres.some((item: string) => item.length > 50))) badInput("Revise a lista de gêneros");
      return AnimeEditSuggestion.create({
        animeId: medium === "ANIME" ? work._id : null,
        mangaId: medium === "MANGA" ? work._id : null,
        lightNovelId: medium === "LIGHT_NOVEL" ? work._id : null,
        medium,
        proposerId: user._id,
        title,
        synopsis,
        genres,
      });
    },
    reviewWorkEditSuggestion: async (_root, args, context: MercuriusContext) => {
      const reviewer = await requireZeus(context);
      const suggestion = await AnimeEditSuggestion.findOne({ _id: args.id, status: "PENDING" });
      if (!suggestion) throw new GraphQLError("Sugestão pendente não encontrada", { extensions: { code: "NOT_FOUND" } });
      if (args.approve) {
        const work = suggestion.lightNovelId
          ? await LightNovel.findById(suggestion.lightNovelId)
          : suggestion.mangaId
            ? await Manga.findById(suggestion.mangaId)
            : await Anime.findById(suggestion.animeId);
        if (!work) throw new GraphQLError("Obra não encontrada", { extensions: { code: "NOT_FOUND" } });
        if (suggestion.title) {
          work.title = suggestion.title;
          work.slug = animeSlugFromTitle(suggestion.title);
        }
        if (suggestion.synopsis) work.synopsis = suggestion.synopsis;
        if (suggestion.genres) work.genres = suggestion.genres;
        await work.save();
        await CatalogWork.findOneAndUpdate(
          { medium: suggestion.lightNovelId ? "LIGHT_NOVEL" : suggestion.mangaId ? "MANGA" : "ANIME", entityId: work._id },
          { title: work.title, slug: work.slug },
        );
        suggestion.status = "APPROVED";
      } else {
        suggestion.status = "REJECTED";
      }
      suggestion.reviewerId = reviewer._id;
      suggestion.reviewedAt = new Date();
      await suggestion.save();
      return suggestion;
    },
    updateAnime: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateAnimeSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { slug, input } = result.data;
      const anime = await Anime.findOne({ slug });
      if (!anime) {
        throw new GraphQLError("Anime não encontrado", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const previousImages = anime.toObject();

      try {
        const relatedIds = [...new Set(input.relatedWorks.map((item) => item.workId))];
        const existingRelatedWorks = await CatalogWork.countDocuments({ _id: { $in: relatedIds } });
        if (existingRelatedWorks !== relatedIds.length) badInput("Uma das obras relacionadas não existe mais");
        const personIds = [...new Set(input.staffCredits.map((credit) => credit.personId))];
        const existingPeople = await Person.countDocuments({ _id: { $in: personIds } });
        if (existingPeople !== personIds.length) badInput("Uma das pessoas vinculadas à staff não existe mais");
        const characterIds = [...new Set(input.characterCredits.map((credit) => credit.characterId))];
        const seiyuuIds = [...new Set(input.characterCredits.map((credit) => credit.seiyuuId))];
        const [existingCharacters, existingSeiyuus] = await Promise.all([
          Character.countDocuments({ _id: { $in: characterIds } }),
          Person.countDocuments({ _id: { $in: seiyuuIds }, roles: "SEIYUU" }),
        ]);
        if (existingCharacters !== characterIds.length) badInput("Um dos personagens vinculados não existe mais");
        if (existingSeiyuus !== seiyuuIds.length) badInput("Um dos seiyuus vinculados não existe mais");
        const artistIds = [...new Set(input.songCredits.flatMap((credit) => [credit.artistId, ...credit.featuredArtistIds]))];
        const existingArtists = await MusicArtist.countDocuments({ _id: { $in: artistIds } });
        if (existingArtists !== artistIds.length) badInput("Um dos artistas vinculados não existe mais");
        const studioIds = [...new Set(input.installments.flatMap((item) => item.studioId ? [item.studioId] : []))];
        const existingStudios = await Studio.countDocuments({ _id: { $in: studioIds } });
        if (existingStudios !== studioIds.length) badInput("Um dos estúdios vinculados não existe mais");

        const nextSlug = animeSlugFromTitle(input.title);
        anime.set({
          ...input,
          adultContent: input.adultContent || ["R18", "RPLUS"].includes(normalizeAnimeRating(input.rating) ?? ""),
          slug: nextSlug,
          externalLinks: input.externalLinks ?? {},
          streamingLinks: input.streamingLinks ?? {},
          installments: input.installments.map(animeInstallmentValues),
        });
        await anime.save();

        await CatalogWork.findOneAndUpdate(
          { medium: "ANIME", entityId: anime._id },
          {
            title: anime.title,
            slug: anime.slug,
            coverUrl: anime.coverUrl,
            status: getOverallAnimeStatus(anime.installments),
            publicationStatus: anime.publicationStatus,
            adultContent: anime.adultContent,
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        await cleanupReplacedUploadImages(previousImages, anime.toObject());
        return anime;
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um anime cadastrado com este título", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    }
  }
};
