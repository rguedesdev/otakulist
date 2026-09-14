import { MagazineFormPage } from "../../new/page";

export default async function EditMagazinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MagazineFormPage editSlug={slug} />;
}
