import { graphqlRequest } from "@/shared/auth/api";

export type AnimeTrackerStatus = "planejado" | "assistindo" | "pausado" | "completo" | "abandonado";

export type AnimeListEntry = {
  status: "PLANNED" | "WATCHING" | "PAUSED" | "COMPLETED" | "DROPPED";
  score: number | null;
  seasonProgress: Array<{ order: number; watchedEpisodes: number }>;
};

const statusToApi: Record<AnimeTrackerStatus, AnimeListEntry["status"]> = {
  planejado: "PLANNED",
  assistindo: "WATCHING",
  pausado: "PAUSED",
  completo: "COMPLETED",
  abandonado: "DROPPED",
};

const statusFromApi = Object.fromEntries(
  Object.entries(statusToApi).map(([local, api]) => [api, local]),
) as Record<AnimeListEntry["status"], AnimeTrackerStatus>;

const ENTRY_QUERY = `query MyAnimeListEntry($animeSlug: String!) {
  myAnimeListEntry(animeSlug: $animeSlug) { status score seasonProgress { order watchedEpisodes } }
}`;

const SAVE_MUTATION = `mutation SaveAnimeListEntry($animeSlug: String!, $input: SaveAnimeListEntryInput!) {
  saveAnimeListEntry(animeSlug: $animeSlug, input: $input) { status score seasonProgress { order watchedEpisodes } }
}`;

const REMOVE_MUTATION = `mutation RemoveAnimeListEntry($animeSlug: String!) {
  removeAnimeListEntry(animeSlug: $animeSlug)
}`;

export async function getAnimeListEntry(animeSlug: string, accessToken: string) {
  const data = await graphqlRequest<{ myAnimeListEntry: AnimeListEntry | null }>(ENTRY_QUERY, { animeSlug }, accessToken);
  return data.myAnimeListEntry;
}

export async function saveAnimeListEntry(
  animeSlug: string,
  accessToken: string,
  tracker: { status: string; score?: string; seasonProgress: Record<number, number> },
) {
  const status = statusToApi[tracker.status as AnimeTrackerStatus] ?? "PLANNED";
  const scoreNumber = tracker.score ? Number(tracker.score) : null;
  const data = await graphqlRequest<{ saveAnimeListEntry: AnimeListEntry }>(SAVE_MUTATION, {
    animeSlug,
    input: {
      status,
      score: Number.isInteger(scoreNumber) ? scoreNumber : null,
      seasonProgress: Object.entries(tracker.seasonProgress).map(([order, watchedEpisodes]) => ({
        order: Number(order),
        watchedEpisodes,
      })),
    },
  }, accessToken);
  return data.saveAnimeListEntry;
}

export async function removeAnimeListEntry(animeSlug: string, accessToken: string) {
  const data = await graphqlRequest<{ removeAnimeListEntry: boolean }>(
    REMOVE_MUTATION,
    { animeSlug },
    accessToken,
  );
  return data.removeAnimeListEntry;
}

export function entryToLocalTracker(entry: AnimeListEntry) {
  const seasonProgress = Object.fromEntries(entry.seasonProgress.map((item) => [item.order, item.watchedEpisodes]));
  return {
    isAdded: true,
    seasonProgress,
    watchedEpisodes: entry.seasonProgress.reduce((total, item) => total + item.watchedEpisodes, 0),
    status: statusFromApi[entry.status],
    score: entry.score === null ? "" : String(entry.score),
  };
}
