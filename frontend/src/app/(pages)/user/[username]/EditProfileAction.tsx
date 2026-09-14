"use client";

import Link from "next/link";
import { MdOutlineEdit } from "react-icons/md";

import { useAuth } from "@/shared/auth/auth-provider";
import styles from "./userprofile.module.css";

export function EditProfileAction({ username }: { username: string }) {
  const { user, loading } = useAuth();
  if (loading || user?.username !== username) return null;

  return (
    <Link className={styles.editProfileButton} href="/settings/profile">
      <MdOutlineEdit aria-hidden="true" />
      Editar perfil
    </Link>
  );
}
