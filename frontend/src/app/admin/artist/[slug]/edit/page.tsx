import { ArtistFormPage } from "../../new/page";

export default async function EditArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArtistFormPage editSlug={slug} />;
}
