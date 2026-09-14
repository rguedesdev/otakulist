import { SeiyuuFormPage } from "../../new/page";

export default async function EditSeiyuuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeiyuuFormPage editSlug={slug} />;
}
