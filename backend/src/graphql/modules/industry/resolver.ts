import { GraphQLError } from "graphql";
import { Anime } from "../../../models/anime.js";
import { Character } from "../../../models/character.js";
import { Manga } from "../../../models/manga.js";
import { LightNovel } from "../../../models/light-novel.js";
import { Magazine } from "../../../models/magazine.js";
import { MusicArtist } from "../../../models/music-artist.js";
import { Person } from "../../../models/person.js";
import { Publisher } from "../../../models/publisher.js";
import { Studio } from "../../../models/studio.js";
import { createMagazineSchema, magazineSlugSchema, updateMagazineSchema } from "../../../services/magazine/schemas.js";
import { animeSlugFromTitle } from "../../../services/anime/slug.js";
import { characterSlugSchema, createCharacterSchema, updateCharacterSchema } from "../../../services/character/schemas.js";
import { createSeiyuuSchema, seiyuuSlugSchema, updateSeiyuuSchema } from "../../../services/seiyuu/schemas.js";
import { createStudioSchema, studioSlugSchema, updateStudioSchema } from "../../../services/studio/schemas.js";
import { createPublisherSchema, publisherSlugSchema, updatePublisherSchema } from "../../../services/publisher/schemas.js";
import { createIndustryPersonSchema, industryPersonSlugSchema, updateIndustryPersonSchema } from "../../../services/industry-person/schemas.js";
import { createMusicArtistSchema, musicArtistSlugSchema, updateMusicArtistSchema } from "../../../services/music-artist/schemas.js";
import type { IResolvers, MercuriusContext } from "mercurius";
import { badInput } from "../../errors.js";
import { currentUser, requireZeus } from "../auth/authorization.js";
import { cleanupReplacedUploadImages } from "../../../services/upload-cleanup.js";

export const industryResolvers: IResolvers<any, MercuriusContext> = {
  PersonManga: {
    startDate: (manga: any) => manga.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: (manga: any) => manga.endDate?.toISOString().slice(0, 10) ?? null,
  },
  IndustryPerson: {
    id: (person: any) => person.id ?? person._id.toString(),
    roles: (person: any) => person.roles ?? [],
    occupations: (person: any) => person.occupations ?? [],
    externalLinks: (person: any) => person.externalLinks ?? {},
    animeCredits: async (person: any) => {
      const animes = await Anime.find({
        "staffCredits.personId": person._id,
        publicationStatus: "PUBLISHED",
      }).sort({ title: 1 });
      return animes.flatMap((anime) => anime.staffCredits
        .filter((credit) => credit.personId.equals(person._id))
        .map((credit) => ({
          anime: {
            id: anime.id,
            title: anime.title,
            slug: anime.slug,
            coverUrl: anime.coverUrl,
            startDate: anime.installments[0]?.startDate?.toISOString().slice(0, 10) ?? null,
            endDate: anime.installments.at(-1)?.endDate?.toISOString().slice(0, 10) ?? null,
          },
          role: credit.role,
          contribution: credit.contribution,
        })));
    },
    mangaCredits: async (person: any) => {
      const mangas = await Manga.find({
        "staffCredits.personId": person._id,
        publicationStatus: "PUBLISHED",
      }).sort({ title: 1 });
      return mangas.flatMap((manga) => manga.staffCredits
        .filter((credit) => credit.personId.equals(person._id))
        .map((credit) => ({ manga, role: credit.role, contribution: credit.contribution })));
    },
    createdAt: (person: any) => person.createdAt.toISOString(),
    updatedAt: (person: any) => person.updatedAt.toISOString()
  },
  Studio: {
    id: (studio: any) => studio.id ?? studio._id.toString(),
    externalLinks: (studio: any) => ({
      website: studio.externalLinks?.website ?? studio.website ?? undefined,
      x: studio.externalLinks?.x,
      instagram: studio.externalLinks?.instagram,
      pixiv: studio.externalLinks?.pixiv,
      youtube: studio.externalLinks?.youtube,
      tiktok: studio.externalLinks?.tiktok,
    }),
    animeCredits: async (studio: any) => {
      const animes = await Anime.find({ "installments.studioId": studio._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 });
      return animes.map((anime) => {
        const installment = anime.installments.find((item) => item.studioId?.equals(studio._id));
        return { anime: {
          id: anime.id,
          title: anime.title,
          slug: anime.slug,
          coverUrl: anime.coverUrl,
          startDate: installment?.startDate?.toISOString().slice(0, 10) ?? null,
          endDate: installment?.endDate?.toISOString().slice(0, 10) ?? null,
          broadcastSeason: installment?.broadcastSeason ?? null,
        } };
      });
    },
    createdAt: (studio: any) => studio.createdAt.toISOString(),
    updatedAt: (studio: any) => studio.updatedAt.toISOString()
  },
  Character: {
    id: (character: any) => character.id ?? character._id.toString(),
    appearances: async (character: any) => {
      const [animes, mangas, lightNovels] = await Promise.all([
        Anime.find({
          "characterCredits.characterId": character._id,
          publicationStatus: "PUBLISHED",
        }).select("title slug coverUrl installments.format"),
        Manga.find({
          characterIds: character._id,
          publicationStatus: "PUBLISHED",
        }).select("title slug coverUrl"),
        LightNovel.find({
          characterIds: character._id,
          publicationStatus: "PUBLISHED",
        }).select("title slug coverUrl"),
      ]);

      const appearances = [
        ...animes.map((work) => ({
          id: work.id,
          title: work.title,
          slug: work.slug,
          coverUrl: work.coverUrl,
          medium: "ANIME",
          formats: [...new Set(work.installments.map((installment) => installment.format))],
        })),
        ...mangas.map((work) => ({ id: work.id, title: work.title, slug: work.slug, coverUrl: work.coverUrl, medium: "MANGA", formats: [] })),
        ...lightNovels.map((work) => ({ id: work.id, title: work.title, slug: work.slug, coverUrl: work.coverUrl, medium: "LIGHT_NOVEL", formats: [] })),
      ];
      const mediumOrder: Record<string, number> = { MANGA: 0, LIGHT_NOVEL: 1, ANIME: 2 };
      return appearances.sort((a, b) =>
        (mediumOrder[a.medium] ?? Number.MAX_SAFE_INTEGER) - (mediumOrder[b.medium] ?? Number.MAX_SAFE_INTEGER)
        || a.title.localeCompare(b.title, "pt-BR"),
      );
    },
    createdAt: (character: any) => character.createdAt.toISOString(),
    updatedAt: (character: any) => character.updatedAt.toISOString()
  },
  CharacterVoiceCredit: {
    seiyuu: (credit: any) => Person.findOne({ slug: credit.seiyuuSlug, roles: "SEIYUU" }),
  },
  MusicArtist: {
    id: (artist: any) => artist.id ?? artist._id.toString(),
    platformLinks: (artist: any) => artist.platformLinks ?? {},
    externalLinks: (artist: any) => artist.externalLinks ?? {},
    discography: (artist: any) => artist.discography ?? [],
    animeSongs: async (artist: any) => {
      const animes = await Anime.find({ publicationStatus: "PUBLISHED", $or: [
        { "songCredits.artistId": artist._id },
        { "songCredits.featuredArtistIds": artist._id },
      ] });
      const featuredIds = animes.flatMap((anime) => anime.songCredits.flatMap((credit) => credit.featuredArtistIds));
      const featuredPeople = await MusicArtist.find({ _id: { $in: featuredIds } });
      const featuredById = new Map(featuredPeople.map((featured) => [featured.id, featured]));
      return animes.flatMap((anime) => anime.songCredits
        .filter((credit) => credit.artistId.equals(artist._id) || credit.featuredArtistIds.some((id) => id.equals(artist._id)))
        .map((credit) => ({
          anime: { id: anime.id, title: anime.title, slug: anime.slug, coverUrl: anime.coverUrl },
          songTitle: credit.songTitle,
          featuredArtists: credit.featuredArtistIds.flatMap((id) => {
            const featured = featuredById.get(id.toString());
            return featured ? [featured] : [];
          }),
          type: credit.type,
          sequence: credit.sequence,
          episodeRange: credit.episodeRange,
        })));
    },
    createdAt: (artist: any) => artist.createdAt.toISOString(),
    updatedAt: (artist: any) => artist.updatedAt.toISOString()
  },
  Publisher: {
    id: (publisher: any) => publisher.id ?? publisher._id.toString(),
    externalLinks: (publisher: any) => publisher.externalLinks ?? {},
    magazines: (publisher: any) => Magazine.find({ publisherId: publisher._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 }),
    lightNovels: (publisher: any) => LightNovel.find({ publisherId: publisher._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 }),
    createdAt: (publisher: any) => publisher.createdAt.toISOString(),
    updatedAt: (publisher: any) => publisher.updatedAt.toISOString()
  },
  Magazine: {
    id: (magazine: any) => magazine.id ?? magazine._id.toString(),
    externalLinks: (magazine: any) => magazine.externalLinks ?? {},
    storeLinks: (magazine: any) => magazine.storeLinks ?? {},
    publisher: (magazine: any) => Publisher.findById(magazine.publisherId),
    mangas: (magazine: any) => Manga.find({ magazineId: magazine._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 }),
    createdAt: (magazine: any) => magazine.createdAt.toISOString(),
    updatedAt: (magazine: any) => magazine.updatedAt.toISOString()
  },
  Query: {
    character: async (_root, args, context: MercuriusContext) => {
      const result = characterSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const character = await Character.findOne({ slug: result.data.slug });
      if (!character) return null;
      if (character.publicationStatus === "PUBLISHED") return character;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? character : null;
    },
    seiyuu: async (_root, args, context: MercuriusContext) => {
      const result = seiyuuSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const person = await Person.findOne({ slug: result.data.slug, roles: "SEIYUU" });
      if (!person) return null;
      if (person.publicationStatus === "PUBLISHED") return person;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? person : null;
    },
    staff: async (_root, args, context: MercuriusContext) => {
      const result = industryPersonSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const person = await Person.findOne({ slug: result.data.slug, roles: "STAFF" });
      if (!person) return null;
      if (person.publicationStatus === "PUBLISHED") return person;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? person : null;
    },
    mangaka: async (_root, args, context: MercuriusContext) => {
      const result = industryPersonSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const person = await Person.findOne({ slug: result.data.slug, roles: "MANGAKA" });
      if (!person) return null;
      if (person.publicationStatus === "PUBLISHED") return person;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? person : null;
    },
    musicArtist: async (_root, args, context: MercuriusContext) => {
      const result = musicArtistSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const artist = await MusicArtist.findOne({ slug: result.data.slug });
      if (!artist) return null;
      if (artist.publicationStatus === "PUBLISHED") return artist;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? artist : null;
    },
    studio: async (_root, args, context: MercuriusContext) => {
      const result = studioSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const studio = await Studio.findOne({ slug: result.data.slug });
      if (!studio) return null;
      if (studio.publicationStatus === "PUBLISHED") return studio;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? studio : null;
    },
    publisher: async (_root, args, context: MercuriusContext) => {
      const result = publisherSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const publisher = await Publisher.findOne({ slug: result.data.slug });
      if (!publisher) return null;
      if (publisher.publicationStatus === "PUBLISHED") return publisher;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? publisher : null;
    },
    magazine: async (_root, args, context: MercuriusContext) => {
      const result = magazineSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const magazine = await Magazine.findOne({ slug: result.data.slug });
      if (!magazine) return null;
      if (magazine.publicationStatus === "PUBLISHED") return magazine;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? magazine : null;
    },
    charactersBySeiyuu: async (_root, args) => {
      const result = characterSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço de seiyuu inválido");
      const seiyuu = await Person.findOne({ slug: result.data.slug, roles: "SEIYUU" }).select("_id");
      const animes = seiyuu
        ? await Anime.find({
            "characterCredits.seiyuuId": seiyuu._id,
            publicationStatus: "PUBLISHED",
          }).select("title characterCredits")
        : [];
      const linkedCharacterIds = animes.flatMap((anime) =>
        anime.characterCredits
          .filter((credit) => credit.seiyuuId.equals(seiyuu!._id))
          .map((credit) => credit.characterId),
      );
      const characters = await Character.find({
        publicationStatus: "PUBLISHED",
        $or: [
          { "voiceCredits.seiyuuSlug": result.data.slug },
          { _id: { $in: linkedCharacterIds } },
        ],
      }).sort({ nameRomaji: 1 });

      return characters.map((character) => {
        const linkedCredits = animes
          .filter((anime) => anime.characterCredits.some((credit) =>
            credit.characterId.equals(character._id) && credit.seiyuuId.equals(seiyuu!._id),
          ))
          .map((anime) => ({ seiyuuSlug: result.data.slug, animeTitle: anime.title }));
        const voiceCredits = [...character.voiceCredits, ...linkedCredits].filter(
          (credit, index, items) => items.findIndex((item) =>
            item.seiyuuSlug === credit.seiyuuSlug && item.animeTitle === credit.animeTitle,
          ) === index,
        );
        return { ...character.toObject(), voiceCredits };
      });
    },
    searchPeople: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Person.find({ displayName: { $regex: safeQuery, $options: "i" } }).sort({ displayName: 1 }).limit(12);
    },
    searchStudios: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Studio.find({ displayName: { $regex: safeQuery, $options: "i" } }).sort({ displayName: 1 }).limit(12);
    },
    searchPublishers: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Publisher.find({ displayName: { $regex: safeQuery, $options: "i" } }).sort({ displayName: 1 }).limit(12);
    },
    searchMagazines: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Magazine.find({ title: { $regex: safeQuery, $options: "i" } }).sort({ title: 1 }).limit(12);
    },
    adminCharacters: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query
        ? { nameRomaji: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
        : {};
      return Character.find(filter).sort({ updatedAt: -1, nameRomaji: 1 });
    },
    adminSeiyuus: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = {
        roles: "SEIYUU",
        ...(query
          ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
          : {}),
      };
      return Person.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminStaff: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      return Person.find({
        roles: "STAFF",
        ...(query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {}),
      }).sort({ updatedAt: -1, displayName: 1 });
    },
    adminMangakas: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      return Person.find({
        roles: "MANGAKA",
        ...(query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {}),
      }).sort({ updatedAt: -1, displayName: 1 });
    },
    adminMusicArtists: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query
        ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
        : {};
      return MusicArtist.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminStudios: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Studio.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminPublishers: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Publisher.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminMagazines: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Magazine.find(filter).sort({ updatedAt: -1, title: 1 });
    }
  },
  Mutation: {
    createMusicArtist: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createMusicArtistSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const input = result.data.input;
      try {
        return await MusicArtist.create({
          ...input,
          slug: animeSlugFromTitle(input.displayName),
          platformLinks: input.platformLinks ?? {},
          externalLinks: input.externalLinks ?? {},
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um artista cadastrado com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    updateMusicArtist: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateMusicArtistSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const { slug, input } = result.data;
      const artist = await MusicArtist.findOne({ slug });
      if (!artist) {
        throw new GraphQLError("Artista não encontrado", { extensions: { code: "NOT_FOUND" } });
      }
      const previousImages = artist.toObject();
      artist.set({ ...input, platformLinks: input.platformLinks ?? {}, externalLinks: input.externalLinks ?? {} });
      await artist.save();
      await cleanupReplacedUploadImages(previousImages, artist.toObject());
      return artist;
    },
    createStudio: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createStudioSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Studio.create({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.displayName) });
      } catch (error: any) {
        if (error?.code === 11000) throw new GraphQLError("Já existe um estúdio cadastrado com este nome", { extensions: { code: "CONFLICT" } });
        throw error;
      }
    },
    updateStudio: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateStudioSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const studio = await Studio.findOne({ slug: result.data.slug });
      if (!studio) throw new GraphQLError("Estúdio não encontrado", { extensions: { code: "NOT_FOUND" } });
      const previousImages = studio.toObject();
      studio.set(result.data.input);
      await studio.save();
      await cleanupReplacedUploadImages(previousImages, studio.toObject());
      return studio;
    },
    createPublisher: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createPublisherSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Publisher.create({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.displayName) });
      } catch (error: any) {
        if (error?.code === 11000) throw new GraphQLError("Já existe uma editora cadastrada com este nome", { extensions: { code: "CONFLICT" } });
        throw error;
      }
    },
    updatePublisher: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updatePublisherSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const publisher = await Publisher.findOne({ slug: result.data.slug });
      if (!publisher) throw new GraphQLError("Editora não encontrada", { extensions: { code: "NOT_FOUND" } });
      const previousImages = publisher.toObject();
      publisher.set(result.data.input);
      await publisher.save();
      await cleanupReplacedUploadImages(previousImages, publisher.toObject());
      return publisher;
    },
    createMagazine: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createMagazineSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      if (!await Publisher.exists({ _id: result.data.input.publisherId })) badInput("A editora vinculada não existe mais");
      try {
        return await Magazine.create({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.title) });
      } catch (error: any) {
        if (error?.code === 11000) throw new GraphQLError("Já existe uma magazine cadastrada com este título", { extensions: { code: "CONFLICT" } });
        throw error;
      }
    },
    updateMagazine: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateMagazineSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      if (!await Publisher.exists({ _id: result.data.input.publisherId })) badInput("A editora vinculada não existe mais");
      const magazine = await Magazine.findOne({ slug: result.data.slug });
      if (!magazine) throw new GraphQLError("Magazine não encontrada", { extensions: { code: "NOT_FOUND" } });
      const previousImages = magazine.toObject();
      magazine.set({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.title) });
      await magazine.save();
      await cleanupReplacedUploadImages(previousImages, magazine.toObject());
      return magazine;
    },
    createSeiyuu: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createSeiyuuSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const input = result.data.input;
      try {
        return await Person.create({
          ...input,
          slug: animeSlugFromTitle(input.displayName),
          roles: ["SEIYUU"],
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe uma pessoa cadastrada com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    updateSeiyuu: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateSeiyuuSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { slug, input } = result.data;
      const person = await Person.findOne({ slug, roles: "SEIYUU" });
      if (!person) {
        throw new GraphQLError("Seiyuu não encontrado", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const previousImages = person.toObject();
      person.set({ ...input, roles: [...new Set([...(person.roles ?? []), "SEIYUU"])] });
      await person.save();
      await cleanupReplacedUploadImages(previousImages, person.toObject());
      return person;
    },
    createStaff: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Person.create({
          ...result.data.input,
          slug: animeSlugFromTitle(result.data.input.displayName),
          roles: ["STAFF"],
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe uma pessoa cadastrada com este nome", { extensions: { code: "CONFLICT" } });
        }
        throw error;
      }
    },
    updateStaff: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const person = await Person.findOne({ slug: result.data.slug, roles: "STAFF" });
      if (!person) throw new GraphQLError("Profissional não encontrado", { extensions: { code: "NOT_FOUND" } });
      const previousImages = person.toObject();
      person.set({ ...result.data.input, roles: [...new Set([...(person.roles ?? []), "STAFF"])] });
      await person.save();
      await cleanupReplacedUploadImages(previousImages, person.toObject());
      return person;
    },
    createMangaka: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Person.create({
          ...result.data.input,
          slug: animeSlugFromTitle(result.data.input.displayName),
          roles: ["MANGAKA"],
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe uma pessoa cadastrada com este nome", { extensions: { code: "CONFLICT" } });
        }
        throw error;
      }
    },
    updateMangaka: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const person = await Person.findOne({ slug: result.data.slug, roles: "MANGAKA" });
      if (!person) throw new GraphQLError("Mangaka não encontrado", { extensions: { code: "NOT_FOUND" } });
      const previousImages = person.toObject();
      person.set({
        ...result.data.input,
        roles: [...new Set([...(person.roles ?? []).filter((role) => role !== "STAFF"), "MANGAKA"])],
      });
      await person.save();
      await cleanupReplacedUploadImages(previousImages, person.toObject());
      return person;
    },
    createCharacter: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = createCharacterSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const input = result.data.input;
      try {
        return await Character.create({
          ...input,
          slug: animeSlugFromTitle(input.nameRomaji),
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um personagem cadastrado com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    updateCharacter: async (_root, args, context: MercuriusContext) => {
      await requireZeus(context);
      const result = updateCharacterSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { slug, input } = result.data;
      const character = await Character.findOne({ slug });
      if (!character) {
        throw new GraphQLError("Personagem não encontrado", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      try {
        const previousImages = character.toObject();
        character.set({ ...input, slug: animeSlugFromTitle(input.nameRomaji) });
        await character.save();
        await cleanupReplacedUploadImages(previousImages, character.toObject());
        return character;
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um personagem cadastrado com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    }
  }
};
