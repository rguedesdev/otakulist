import { PublicationWorkFormPage } from "../../../_components/PublicationWorkFormPage";
export default async function EditMangaPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <PublicationWorkFormPage medium="MANGA" editSlug={slug} />; }
