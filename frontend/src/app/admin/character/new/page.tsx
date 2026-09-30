"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FiImage, FiPlus, FiTrash2, FiUploadCloud, FiUser } from "react-icons/fi";

import { assetUrl, graphqlRequest, uploadCatalogImage } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import { CustomSelect } from "@/shared/components/CustomSelect/page";
import styles from "../../anime/new/page.module.css";
import { CancelLink } from "@/shared/components/AdminFormActions/CancelLink";
import { SaveButton } from "@/shared/components/AdminFormActions/SaveButton";

const CREATE_CHARACTER = `mutation CreateCharacter($input: CreateCharacterInput!) {
  createCharacter(input: $input) { slug }
}`;
const UPDATE_CHARACTER = `mutation UpdateCharacter($slug: String!, $input: CreateCharacterInput!) {
  updateCharacter(slug: $slug, input: $input) { slug }
}`;
const ADMIN_CHARACTER = `query AdminCharacter($slug: String!) {
  character(slug: $slug) {
    nameRomaji nameKanji description imageUrl dateOfBirth hometown publicationStatus
    voiceCredits { seiyuuSlug animeTitle }
  }
}`;

type VoiceCredit = { seiyuuSlug: string; animeTitle: string };
type CharacterData = {
  nameRomaji: string;
  nameKanji: string | null;
  description: string | null;
  imageUrl: string;
  dateOfBirth: string | null;
  hometown: string | null;
  publicationStatus: "DRAFT" | "PUBLISHED";
  voiceCredits: VoiceCredit[];
};

export function CharacterFormPage({ editSlug }: { editSlug?: string }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [initial, setInitial] = useState<CharacterData | null>(null);
  const [nameRomaji, setNameRomaji] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [voiceCredits, setVoiceCredits] = useState<VoiceCredit[]>([]);
  const [loadingCharacter, setLoadingCharacter] = useState(Boolean(editSlug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState("");

  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : assetUrl(imageUrl), [imageFile, imageUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!editSlug || !accessToken || user?.role !== "ZEUS") return;
    let active = true;
    void graphqlRequest<{ character: CharacterData | null }>(ADMIN_CHARACTER, { slug: editSlug }, accessToken)
      .then((data) => {
        if (!active) return;
        if (!data.character) throw new Error("Personagem não encontrado");
        setInitial(data.character);
        setNameRomaji(data.character.nameRomaji);
        setImageUrl(data.character.imageUrl);
        setVoiceCredits(data.character.voiceCredits);
      })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar o personagem"); })
      .finally(() => { if (active) setLoadingCharacter(false); });
    return () => { active = false; };
  }, [accessToken, editSlug, user?.role]);

  const updateCredit = (index: number, field: keyof VoiceCredit, value: string) => {
    setVoiceCredits((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError("");
    setSavedSlug("");
    const form = new FormData(event.currentTarget);

    try {
      const uploadedImage = imageFile ? await uploadCatalogImage(imageFile, accessToken) : imageUrl;
      if (!uploadedImage) throw new Error("Selecione uma imagem para o personagem");
      const input = {
        nameRomaji: nameRomaji.trim(),
        nameKanji: String(form.get("nameKanji") ?? "").trim() || null,
        description: String(form.get("description") ?? "").trim() || null,
        imageUrl: uploadedImage,
        dateOfBirth: String(form.get("dateOfBirth") ?? "").trim() || null,
        hometown: String(form.get("hometown") ?? "").trim() || null,
        publicationStatus: String(form.get("publicationStatus")),
        voiceCredits: voiceCredits.map((credit) => ({
          seiyuuSlug: credit.seiyuuSlug.trim(),
          animeTitle: credit.animeTitle.trim(),
        })),
      };
      if (editSlug) {
        const data = await graphqlRequest<{ updateCharacter: { slug: string } }>(
          UPDATE_CHARACTER,
          { slug: editSlug, input },
          accessToken,
        );
        setSavedSlug(data.updateCharacter.slug);
      } else {
        const data = await graphqlRequest<{ createCharacter: { slug: string } }>(
          CREATE_CHARACTER,
          { input },
          accessToken,
        );
        setSavedSlug(data.createCharacter.slug);
      }
      setImageUrl(uploadedImage);
      setImageFile(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar o personagem");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingCharacter) return <main className={styles.accessPage}><div className={styles.spinner} /><p>Preparando editor…</p></main>;
  if (!user || user.role !== "ZEUS") return <main className={styles.accessPage}><section className={styles.accessCard}><span className={styles.accessIcon}><FiUser /></span><h1>Acesso restrito</h1><p>Entre com uma conta ZEUS para editar personagens.</p><Link className={styles.accessAction} href={user ? "/" : "/login"}>{user ? "Voltar" : "Entrar"}</Link></section></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>Administração · Personagem</span><h1>{editSlug ? "Editar personagem" : "Cadastrar personagem"}</h1></div>
        <p>Gerencie os dados exibidos na página pública e nos perfis de seiyuus.</p>
      </header>

      <form className={styles.form} autoComplete="off" onSubmit={submit}>
        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>01</span><div><h2>Identidade</h2><p>Informações principais do personagem.</p></div></div>
          <div className={styles.grid}>
            <label><span>Nome em Romaji *</span><input required value={nameRomaji} onChange={(event) => setNameRomaji(event.target.value)} /></label>
            <label><span>Nome em Kanji</span><input name="nameKanji" defaultValue={initial?.nameKanji ?? ""} /></label>
            <label><span>Data de nascimento</span><input name="dateOfBirth" defaultValue={initial?.dateOfBirth ?? ""} /></label>
            <label><span>Cidade natal</span><input name="hometown" defaultValue={initial?.hometown ?? ""} /></label>
            <label><span>Visibilidade</span><CustomSelect name="publicationStatus" defaultValue={initial?.publicationStatus ?? "DRAFT"} options={[{ value: "DRAFT", label: "Rascunho" }, { value: "PUBLISHED", label: "Publicado" }]} /></label>
            <label className={styles.wide}><span>Descrição</span><textarea name="description" rows={6} defaultValue={initial?.description ?? ""} /></label>
            <div className={`${styles.wide} ${styles.imagePicker}`}>
              <div className={styles.coverPreview}>{preview ? <Image src={preview} alt="Prévia do personagem" fill sizes="112px" unoptimized /> : <span><FiImage /><small>Nenhuma imagem</small></span>}</div>
              <div className={styles.imagePickerContent}>
                <strong>Imagem do personagem *</strong><p>Envie JPEG, PNG ou WebP, ou mantenha a imagem já cadastrada.</p>
                <label className={styles.fileButton}><FiUploadCloud />Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><span>02</span><div><h2>Trabalhos de voz</h2><p>Vincule o personagem ao perfil do seiyuu e informe o anime.</p></div></div>
          {voiceCredits.map((credit, index) => (
            <div className={styles.row} key={index}>
              <input required value={credit.seiyuuSlug} placeholder="Slug do seiyuu (ex.: kitou-akari)" onChange={(event) => updateCredit(index, "seiyuuSlug", event.target.value)} />
              <input required value={credit.animeTitle} placeholder="Anime (ex.: Ranma 1⁄2)" onChange={(event) => updateCredit(index, "animeTitle", event.target.value)} />
              <button className={styles.remove} type="button" onClick={() => setVoiceCredits((items) => items.filter((_, itemIndex) => itemIndex !== index))}><FiTrash2 /> Remover</button>
            </div>
          ))}
          <button className={styles.add} type="button" onClick={() => setVoiceCredits((items) => [...items, { seiyuuSlug: "", animeTitle: "" }])}><FiPlus /> Vincular seiyuu</button>
        </section>

        {error && <p className={styles.error}>{error}</p>}
        {savedSlug && <p className={styles.success}>Personagem {editSlug ? "atualizado" : "cadastrado"}. <Link href={`/character/${savedSlug}`}>Abrir página</Link></p>}
        <div className={styles.footerActions}><CancelLink className={styles.cancelAction} href="/admin/character">Cancelar</CancelLink><SaveButton disabled={saving}>{editSlug ? "Salvar alterações" : "Cadastrar personagem"}</SaveButton></div>
      </form>
    </main>
  );
}

export default function NewCharacterPage() {
  return <CharacterFormPage />;
}
