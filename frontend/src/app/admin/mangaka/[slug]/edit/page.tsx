import { IndustryPersonFormPage } from "../../../_components/IndustryPersonFormPage";
export default async function EditMangakaPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <IndustryPersonFormPage kind="mangaka" editSlug={slug} />; }
