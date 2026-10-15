import Image from "next/image";
import Link from "next/link";

import { assetUrl } from "@/shared/auth/api";
import styles from "./publicationcharacters.module.css";

export type PublicationCharacter = { id: string; nameRomaji: string; slug: string; imageUrl: string };

export function PublicationCharacterSection({ characters, limit }: { characters: PublicationCharacter[]; limit?: number }) {
  if (characters.length === 0) return null;
  return <section><h2 className={styles.title}>Personagens</h2><div className={styles.grid}>{characters.slice(0, limit).map((character) => <Link href={`/character/${character.slug}`} key={character.id}><article><Image src={assetUrl(character.imageUrl) ?? character.imageUrl} alt={character.nameRomaji} width={60} height={80} unoptimized /><strong>{character.nameRomaji}</strong></article></Link>)}</div></section>;
}
