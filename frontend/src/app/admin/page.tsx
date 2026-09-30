"use client";

import Link from "next/link";
import { FiBookOpen, FiEdit3, FiMusic, FiTv } from "react-icons/fi";
import { RiBuildingLine, RiQuillPenLine } from "react-icons/ri";
import { GiEvilBook } from "react-icons/gi";
import { LiaMicrophoneSolid } from "react-icons/lia";
import { LuBookHeart, LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineHomeWork, MdOutlinePeopleAlt, MdOutlinePersonOutline } from "react-icons/md";

import { useAuth } from "@/shared/auth/auth-provider";
import styles from "./page.module.css";

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className={styles.statePage}><div className={styles.loader} /><p>Preparando administração…</p></main>;
  }

  if (!user || user.role !== "ZEUS") {
    return (
      <main className={styles.statePage}>
        <LuLayoutDashboard />
        <h1>Acesso restrito</h1>
        <p>Entre com uma conta ZEUS para gerenciar o catálogo.</p>
        <Link href={user ? "/" : "/login"}>{user ? "Voltar ao início" : "Entrar"}</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>Administração</span>
        <h1>Catálogo</h1>
        <p>Escolha a área que deseja cadastrar, revisar ou editar.</p>
      </header>

      <section className={styles.sections} aria-label="Áreas administrativas">
        <Link href="/admin/anime">
          <span className={styles.icon}><FiTv /></span>
          <div><h2>Animes</h2><p>Gerencie obras, temporadas, vínculos, staff e publicação.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/collaborations">
          <span className={styles.icon}><FiEdit3 /></span>
          <div><h2>Colaborações da comunidade</h2><p>Revise e aprove melhorias sugeridas para as obras do catálogo.</p></div>
          <strong>Revisar →</strong>
        </Link>
        <Link href="/admin/manga">
          <span className={styles.icon}><GiEvilBook /></span>
          <div><h2>Mangas</h2><p>Gerencie publicação, capítulos, volumes, autores e vínculos.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/light-novel">
          <span className={styles.icon}><LuBookHeart /></span>
          <div><h2>Light novels</h2><p>Gerencie séries, volumes, editoras, autores e relações.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/character">
          <span className={styles.icon}><MdOutlinePersonOutline className={styles.characterIcon} /></span>
          <div><h2>Personagens</h2><p>Gerencie perfis, imagens e trabalhos de voz.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/seiyuu">
          <span className={styles.icon}><LiaMicrophoneSolid size={20} /></span>
          <div><h2>Seiyuus</h2><p>Gerencie perfis, biografias, agências e imagens.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/artist">
          <span className={styles.icon}><FiMusic /></span>
          <div><h2>Artistas musicais</h2><p>Gerencie cantores, cantoras, grupos e bandas.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/staff">
          <span className={styles.icon}><MdOutlinePeopleAlt className={styles.staffIcon} /></span>
          <div><h2>Staff</h2><p>Gerencie diretores, roteiristas, animadores e demais profissionais.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/mangaka">
          <span className={styles.icon}><RiQuillPenLine className={styles.mangakaIcon} /></span>
          <div><h2>Mangakas</h2><p>Gerencie autores de manga em uma área própria do catálogo.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/studio">
          <span className={styles.icon}><MdOutlineHomeWork className={styles.studioIcon} /></span>
          <div><h2>Estúdios</h2><p>Gerencie perfis e vínculos com lançamentos de anime.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/publisher">
          <span className={styles.icon}><RiBuildingLine className={styles.publisherIcon} /></span>
          <div><h2>Editoras</h2><p>Gerencie perfis e vínculos com mangas e light novels.</p></div>
          <strong>Acessar →</strong>
        </Link>
        <Link href="/admin/magazine">
          <span className={styles.icon}><FiBookOpen /></span>
          <div><h2>Magazines</h2><p>Gerencie revistas e seus vínculos com editoras.</p></div>
          <strong>Acessar →</strong>
        </Link>
      </section>
    </main>
  );
}
