import { AnimeSongSection } from "@/shared/components/AnimeSongSection/page";
import type { AnimeSong } from "@/shared/components/AnimeSongSection/page";
import { EntityDetailPage } from "@/shared/components/EntityDetailPage/page";
import { DiscographySection } from "@/shared/components/DiscographySection/page";
import type { DiscographyRelease } from "@/shared/components/DiscographySection/page";
import { MusicPlatformLinks } from "@/shared/components/FormatSidebarInfo/page";

const artistInfo = {
  cover: "/singers/yui-horie.png",
  name_romaji: "Yui Horie",
  name_kanji: "堀江由衣",
  format: "artist",
  date_of_birth: "20 Set 1976",
  hometown: "Tóquio, Japão",
  activity_period: "1997–presente",
  record_label: "King Records",
  musical_genres: ["J-Pop", "Anisong"],
  description:
    "Cantora e seiyuu japonesa conhecida por uma extensa carreira musical ligada a animes. Além de seus lançamentos próprios, interpretou temas de abertura e encerramento que marcaram diferentes temporadas.",
};

const animeSongs: AnimeSong[] = [
  {
    title: "School Rumble",
    href: "/anime/school-rumble",
    image: "/animes/mayonaka.jpg",
    imageAlt: "Imagem de anime usada na demonstração",
    details: [
      { icon: "song", text: "Scramble" },
      { icon: "usage", text: "Opening 1 · Episódios 1–24 · 2004" },
    ],
  },
  {
    title: "Toradora!",
    href: "/anime/toradora",
    image: "/animes/mao2.jpg",
    imageAlt: "Imagem de anime usada na demonstração",
    details: [
      { icon: "song", text: "Vanilla Salt" },
      { icon: "usage", text: "Ending 1 · Episódios 1–16 · 2008" },
    ],
  },
  {
    title: "Toradora!",
    href: "/anime/toradora",
    image: "/animes/inuyasha2.png",
    imageAlt: "Imagem de anime usada na demonstração",
    details: [
      { icon: "song", text: "silky heart" },
      { icon: "usage", text: "Opening 2 · Episódios 17–24 · 2009" },
    ],
  },
  {
    title: "Golden Time",
    href: "/anime/golden-time",
    image: "/animes/rinne2.jpg",
    imageAlt: "Imagem de anime usada na demonstração",
    details: [
      { icon: "song", text: "Golden Time" },
      { icon: "usage", text: "Opening 1 · Episódios 1–12 · 2013" },
    ],
  },
  {
    title: "Golden Time",
    href: "/anime/golden-time",
    image: "/animes/gachiakuta.jpg",
    imageAlt: "Imagem de anime usada na demonstração",
    details: [
      { icon: "song", text: "The♡World's♡End" },
      { icon: "usage", text: "Opening 2 · Episódios 13–24 · 2014" },
    ],
  },
  {
    title: "Dog Days",
    href: "/anime/dog-days",
    image: "/animes/wolfs.jpg",
    imageAlt: "Imagem de anime usada na demonstração",
    details: [
      { icon: "song", text: "PRESENTER" },
      { icon: "usage", text: "Ending · Episódios 1–13 · 2011" },
    ],
  },
];

const discography: DiscographyRelease[] = [
  {
    title: "5am",
    releaseType: "Álbum",
    year: "2009",
    tracks: 13,
    cover: "/singers/milet_5am.jpg",
    href: "/artist/yui-horie/discography/honey-jet",
  },
  {
    title: "Eyes",
    releaseType: "Álbum",
    year: "2015",
    tracks: 13,
    cover: "/singers/milet_eyes.jpg",
    href: "/artist/yui-horie/discography/world-end-no-niwa",
  },
  {
    title: "Visions",
    releaseType: "Álbum",
    year: "2022",
    tracks: 11,
    cover: "/singers/milet_visions.jpg",
    href: "/artist/yui-horie/discography/bungaku-shoujo-no-kashuu",
  },
  {
    title: "5am",
    releaseType: "Single",
    year: "2008",
    tracks: 4,
    cover: "/singers/milet_5am.jpg",
    href: "/artist/yui-horie/discography/vanilla-salt",
  },
  {
    title: "Eyes",
    releaseType: "Single",
    year: "2011",
    tracks: 4,
    cover: "/singers/milet_eyes.jpg",
    href: "/artist/yui-horie/discography/presenter",
  },
  {
    title: "Visions",
    releaseType: "Single",
    year: "2013",
    tracks: 4,
    cover: "/singers/milet_visions.jpg",
    href: "/artist/yui-horie/discography/golden-time",
  },
];

function ArtistBySlug() {
  return (
    <EntityDetailPage
      formatInfo={artistInfo}
      sidebarChildren={(
        <MusicPlatformLinks spotify="/" tidal="/" deezer="/" amazonMusic="/" />
      )}
    >
      <AnimeSongSection title="Canções em animes" songs={animeSongs} />
      <DiscographySection releases={discography} />
    </EntityDetailPage>
  );
}

export default ArtistBySlug;
