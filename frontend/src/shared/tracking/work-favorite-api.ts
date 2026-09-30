import { graphqlRequest } from "@/shared/auth/api";

export type FavoriteMedium = "ANIME" | "MANGA" | "LIGHT_NOVEL";

const FAVORITE_QUERY = `query MyWorkFavorite($medium: WorkMedium!, $slug: String!) {
  myWorkFavorite(medium: $medium, slug: $slug)
}`;

const SET_FAVORITE_MUTATION = `mutation SetWorkFavorite($medium: WorkMedium!, $slug: String!, $favorite: Boolean!) {
  setWorkFavorite(medium: $medium, slug: $slug, favorite: $favorite)
}`;

export async function getWorkFavorite(
  medium: FavoriteMedium,
  slug: string,
  accessToken: string,
) {
  const data = await graphqlRequest<{ myWorkFavorite: boolean }>(
    FAVORITE_QUERY,
    { medium, slug },
    accessToken,
  );
  return data.myWorkFavorite;
}

export async function setWorkFavorite(
  medium: FavoriteMedium,
  slug: string,
  favorite: boolean,
  accessToken: string,
) {
  const data = await graphqlRequest<{ setWorkFavorite: boolean }>(
    SET_FAVORITE_MUTATION,
    { medium, slug, favorite },
    accessToken,
  );
  return data.setWorkFavorite;
}
