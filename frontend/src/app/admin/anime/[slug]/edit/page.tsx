import { AnimeFormPage } from "../../new/page";

export default async function EditAnimePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AnimeFormPage editSlug={slug} />;
}
