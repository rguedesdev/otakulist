import { notFound } from "next/navigation";

import { assetUrl } from "@/shared/auth/api";
import { AnimeSongSection, type AnimeSong } from "@/shared/components/AnimeSongSection/page";
import { DiscographySection } from "@/shared/components/DiscographySection/page";
import { EntityDetailPage } from "@/shared/components/EntityDetailPage/page";
import { MusicPlatformLinks } from "@/shared/components/FormatSidebarInfo/page";
import type { MusicArtistEntity } from "@/shared/types/entities";

export const dynamic = "force-dynamic";

type MusicArtistData = {
  displayName: string;
  kind: "SOLO" | "BAND";
  nameKanji: string | null;
  imageUrl: string;
  description: string | null;
  origin: string | null;
  dateOfBirth: string | null;
  activityPeriod: string | null;
  recordLabel: string | null;
  genres: string[];
  discography: Array<{ title: string; releaseType: string; year: string; tracks: number; cover: string }>;
  platformLinks: { spotify?: string; tidal?: string; deezer?: string; amazonMusic?: string };
  externalLinks: { website?: string; x?: string; instagram?: string; pixiv?: string; youtube?: string; tiktok?: string };
  animeSongs: Array<{
    anime: { title: string; slug: string; coverUrl: string };
    songTitle: string;
    type: "OPENING" | "ENDING" | "INSERT";
    sequence: number | null;
    episodeRange: string | null;
  }>;
};

const query = `query MusicArtist($slug: String!) {
  musicArtist(slug: $slug) {
    displayName kind nameKanji imageUrl description origin dateOfBirth activityPeriod recordLabel genres
    platformLinks { spotify tidal deezer amazonMusic }
    externalLinks { website x instagram pixiv youtube tiktok }
    discography { title releaseType year tracks cover }
    animeSongs { anime { title slug coverUrl } songTitle type sequence episodeRange }
  }
}`;

const songTypeLabels = { OPENING: "Opening", ENDING: "Ending", INSERT: "Insert song" } as const;

function songUsage(type: keyof typeof songTypeLabels, sequence: number | null, episodeRange: string | null) {
  const numberedType = `${songTypeLabels[type]}${sequence ? ` ${sequence}` : ""}`;
  const normalizedRange = episodeRange?.replace(/^(?:eps?\.?|episódios?)\s*/i, "").trim();
  return normalizedRange ? `${numberedType} • Episódios ${normalizedRange}` : numberedType;
}

async function getMusicArtist(slug: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { slug } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar o artista");
  const body = await response.json() as { data?: { musicArtist: MusicArtistData | null } };
  return body.data?.musicArtist ?? null;
}

export default async function ArtistBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getMusicArtist(slug);
  if (!artist) notFound();

  const entity: MusicArtistEntity = {
    cover: assetUrl(artist.imageUrl) ?? artist.imageUrl,
    title: artist.displayName,
    entityType: "music_artist",
    artist_kind: artist.kind === "BAND" ? "band" : "solo",
    name_kanji: artist.nameKanji ?? undefined,
    description: artist.description ?? "",
    origin: artist.origin ?? undefined,
    date_of_birth: artist.dateOfBirth ?? undefined,
    activity_period: artist.activityPeriod ?? undefined,
    record_label: artist.recordLabel ?? undefined,
    musical_genres: artist.genres,
    externalLinks: artist.externalLinks,
  };
  const animeSongs: AnimeSong[] = artist.animeSongs.map((song) => ({
    title: song.anime.title,
    href: `/anime/${song.anime.slug}`,
    image: assetUrl(song.anime.coverUrl) ?? song.anime.coverUrl,
    imageAlt: song.anime.title,
    details: [
      { icon: "song", text: song.songTitle },
      { icon: "usage", text: songUsage(song.type, song.sequence, song.episodeRange) },
    ],
  }));

  return (
    <EntityDetailPage entity={entity} sidebarChildren={<MusicPlatformLinks {...artist.platformLinks} />}>
      <AnimeSongSection title="Canções em animes" songs={animeSongs} />
      <DiscographySection releases={artist.discography.map((release) => ({ ...release, cover: assetUrl(release.cover) ?? release.cover }))} />
    </EntityDetailPage>
  );
}
