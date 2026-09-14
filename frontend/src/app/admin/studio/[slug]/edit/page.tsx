import { StudioFormPage } from "../../new/page";

export default async function EditStudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StudioFormPage editSlug={slug} />;
}
