import { PublisherFormPage } from "../../new/page";

export default async function EditPublisherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublisherFormPage editSlug={slug} />;
}
