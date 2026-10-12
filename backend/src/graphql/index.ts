import { authTypeDefs } from "./modules/auth/schema.js";
import { authResolvers } from "./modules/auth/resolver.js";
import { animeTypeDefs } from "./modules/anime/schema.js";
import { animeResolvers } from "./modules/anime/resolver.js";
import { publicationTypeDefs } from "./modules/publication/schema.js";
import { publicationResolvers } from "./modules/publication/resolver.js";
import { industryTypeDefs } from "./modules/industry/schema.js";
import { industryResolvers } from "./modules/industry/resolver.js";
import { catalogTypeDefs } from "./modules/catalog/schema.js";
import { catalogResolvers } from "./modules/catalog/resolver.js";
import { communityTypeDefs } from "./modules/community/schema.js";
import { communityResolvers } from "./modules/community/resolver.js";
import type { IResolvers } from "mercurius";

export const schema = [
  authTypeDefs,
  animeTypeDefs,
  publicationTypeDefs,
  industryTypeDefs,
  catalogTypeDefs,
  communityTypeDefs
].join("\n");

const modules: IResolvers<any, any>[] = [
  authResolvers,
  animeResolvers,
  publicationResolvers,
  industryResolvers,
  catalogResolvers,
  communityResolvers
];

const mergedResolvers: Record<string, Record<string, unknown>> = {};

for (const moduleResolvers of modules) {
  for (const [typeName, fields] of Object.entries(moduleResolvers)) {
    mergedResolvers[typeName] = {
      ...(mergedResolvers[typeName] ?? {}),
      ...(fields as Record<string, unknown>),
    };
  }
}

export const resolvers = mergedResolvers as IResolvers<any, any>;
