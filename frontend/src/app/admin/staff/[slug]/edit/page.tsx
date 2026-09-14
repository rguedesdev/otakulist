import { IndustryPersonFormPage } from "../../../_components/IndustryPersonFormPage";
export default async function EditStaffPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <IndustryPersonFormPage kind="staff" editSlug={slug} />; }
