import { CharacterFormPage } from "../../new/page";

export default async function EditCharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CharacterFormPage editSlug={slug} />;
}
