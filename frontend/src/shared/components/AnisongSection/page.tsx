import { AnimeSongSection } from "@/shared/components/AnimeSongSection/page";
import type { AnimeSong } from "@/shared/components/AnimeSongSection/page";

const anisongs: AnimeSong[] = [
  {
    title: "Opening 1 (eps 1~12)",
    href: "/artist/yui-horie",
    image: "/singers/yui-horie.png",
    imageAlt: "Yui Horie",
    details: [
      { icon: "song", text: "Scramble" },
      { icon: "artist", text: "Yui Horie feat. Unscandal" },
    ],
  },
  {
    title: "Opening 2 (eps 12~24)",
    href: "/artist/ami-tokito",
    image: "/singers/ami-yokito.jpg",
    imageAlt: "Ami Tokito",
    details: [
      { icon: "song", text: "Sentimental Generation" },
      { icon: "artist", text: "Ami Tokito" },
    ],
  },
  {
    title: "Ending 1 (eps 1~12)",
    href: "/artist/yuko-ogura",
    image: "/singers/yuko-ogura.jpg",
    imageAlt: "Yuko Ogura",
    details: [
      { icon: "song", text: "Onna no ko Otoko no ko" },
      { icon: "artist", text: "Yuko Ogura" },
    ],
  },
];

function AnisongSection() {
  return <AnimeSongSection title="Anisong" songs={anisongs} />;
}

export { AnisongSection };
