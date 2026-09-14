import { PublicationWorkFormPage } from "../../../_components/PublicationWorkFormPage";
export default async function EditLightNovelPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <PublicationWorkFormPage medium="LIGHT_NOVEL" editSlug={slug} />; }
