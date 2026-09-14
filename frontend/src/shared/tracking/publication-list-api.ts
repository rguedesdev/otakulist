import { graphqlRequest } from "@/shared/auth/api";

export type PublicationMedium = "MANGA" | "LIGHT_NOVEL";
export type PublicationTrackerStatus = "planejado" | "lendo" | "pausado" | "completo" | "abandonado";

export type PublicationListEntry = {
  status: "PLANNED" | "READING" | "PAUSED" | "COMPLETED" | "DROPPED";
  readChapters: number;
};

const statusToApi: Record<PublicationTrackerStatus, PublicationListEntry["status"]> = {
  planejado: "PLANNED",
  lendo: "READING",
  pausado: "PAUSED",
  completo: "COMPLETED",
  abandonado: "DROPPED",
};

const statusFromApi = Object.fromEntries(
  Object.entries(statusToApi).map(([local, api]) => [api, local]),
) as Record<PublicationListEntry["status"], PublicationTrackerStatus>;

const ENTRY_QUERY = `query MyPublicationListEntry($medium: WorkMedium!, $slug: String!) {
  myPublicationListEntry(medium: $medium, slug: $slug) { status readChapters }
}`;

const SAVE_MUTATION = `mutation SavePublicationListEntry($medium: WorkMedium!, $slug: String!, $input: SavePublicationListEntryInput!) {
  savePublicationListEntry(medium: $medium, slug: $slug, input: $input) { status readChapters }
}`;

const REMOVE_MUTATION = `mutation RemovePublicationListEntry($medium: WorkMedium!, $slug: String!) {
  removePublicationListEntry(medium: $medium, slug: $slug)
}`;

export async function getPublicationListEntry(medium: PublicationMedium, slug: string, accessToken: string) {
  const data = await graphqlRequest<{ myPublicationListEntry: PublicationListEntry | null }>(
    ENTRY_QUERY,
    { medium, slug },
    accessToken,
  );
  return data.myPublicationListEntry;
}

export async function savePublicationListEntry(
  medium: PublicationMedium,
  slug: string,
  accessToken: string,
  tracker: { status: string; readChapters: number },
) {
  const status = statusToApi[tracker.status as PublicationTrackerStatus] ?? "PLANNED";
  const data = await graphqlRequest<{ savePublicationListEntry: PublicationListEntry }>(
    SAVE_MUTATION,
    { medium, slug, input: { status, readChapters: tracker.readChapters } },
    accessToken,
  );
  return data.savePublicationListEntry;
}

export async function removePublicationListEntry(medium: PublicationMedium, slug: string, accessToken: string) {
  const data = await graphqlRequest<{ removePublicationListEntry: boolean }>(
    REMOVE_MUTATION,
    { medium, slug },
    accessToken,
  );
  return data.removePublicationListEntry;
}

export function publicationEntryToLocalTracker(entry: PublicationListEntry) {
  return {
    isAdded: true,
    readChapters: entry.readChapters,
    status: statusFromApi[entry.status],
  };
}
