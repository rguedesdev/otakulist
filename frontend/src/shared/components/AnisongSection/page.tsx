import { AnimeSongSection } from "@/shared/components/AnimeSongSection/page";
import type { AnimeSong } from "@/shared/components/AnimeSongSection/page";

function AnisongSection({ songs = [] }: { songs?: AnimeSong[] }) {
  return <AnimeSongSection title="Anisong" songs={songs} />;
}

export { AnisongSection };
