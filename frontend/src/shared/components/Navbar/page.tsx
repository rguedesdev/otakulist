"use client";

// Imports Principais
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { assetUrl } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";

// Style Sheet CSS
import styles from "./navbar.module.css";

// Icones
import { RiHome3Line } from "react-icons/ri";
import { FiTv } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart, LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineKeyboardArrowDown, MdOutlineManageAccounts, MdOutlinePersonOutline } from "react-icons/md";

import { FiLogIn, FiLogOut } from "react-icons/fi";
import { PiNotePencil } from "react-icons/pi";

function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current); // cancela fechamento
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200); // 200ms de delay, dá tempo de navegar para o menu
  };

  const isActive = (href: string) =>
    href === "/"
      ? pathname === href
      : pathname.startsWith(`${href}/`) || pathname === href;

  return (
    <header className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Link
            className={styles.logoLink}
            href="/"
            aria-label="OtakuList - Início"
          >
            <Image
              src="/logo-v4.png"
              alt="OtakuList"
              width={150}
              height={50}
              priority
            />
          </Link>
          <span className={styles.badgeVersion}>Alpha</span>
        </div>

        <ul className={styles.navList}>
          <li>
            <Link
              className={`${styles.navLink} ${isActive("/") ? styles.navLinkActive : ""}`}
              href="/"
              aria-current={isActive("/") ? "page" : undefined}
            >
              <RiHome3Line size={16} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              className={`${styles.navLink} ${isActive("/anime") ? styles.navLinkActive : ""}`}
              href="/anime"
              aria-current={isActive("/anime") ? "page" : undefined}
            >
              <FiTv size={16} />
              <span>Anime</span>
            </Link>
          </li>

          <li>
            <Link
              className={`${styles.navLink} ${isActive("/manga") ? styles.navLinkActive : ""}`}
              href="/manga"
              aria-current={isActive("/manga") ? "page" : undefined}
            >
              <GiEvilBook size={16} />
              <span>Manga</span>
            </Link>
          </li>

          <li>
            <Link
              className={`${styles.navLink} ${isActive("/light-novel") ? styles.navLinkActive : ""}`}
              href="/light-novel"
              aria-current={isActive("/light-novel") ? "page" : undefined}
            >
              <LuBookHeart size={16} />
              <span>Novel</span>
            </Link>
          </li>

          {/* <li>
            <Link
              className={`${styles.navLink} ${isActive("/magazine") ? styles.navLinkActive : ""}`}
              href="/magazine"
              aria-current={isActive("/magazine") ? "page" : undefined}
            >
              <BsBook size={16} />
              <span>Magazine</span>
            </Link>
          </li> */}
        </ul>

        {!loading && user ? (
          <div
            className={styles.profileDropdownWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={styles.profileDropdownTrigger}
              type="button"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <span
                className={styles.avatar}
                role="img"
                aria-label={`Avatar de ${user.displayName}`}
                style={
                  user.avatarUrl
                    ? { backgroundImage: `url("${assetUrl(user.avatarUrl)}")` }
                    : undefined
                }
              >
                {!user.avatarUrl && user.displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className={styles.profileUsername}>{user.username}</span>
              <MdOutlineKeyboardArrowDown
                className={dropdownOpen ? styles.dropdownArrowOpen : styles.dropdownArrow}
                aria-hidden="true"
              />
            </button>

            {/* Menu */}
            {dropdownOpen && (
              <ul
                className={styles.menuDropdown}
                role="menu"
                onMouseEnter={handleMouseEnter}
              >
                <li role="none">
                  <Link href={`/user/${user.username}`} role="menuitem">
                    <MdOutlinePersonOutline aria-hidden="true" />
                    <span>Meu perfil</span>
                  </Link>
                </li>
                <li role="none">
                  <Link href="/settings/profile" role="menuitem">
                    <MdOutlineManageAccounts aria-hidden="true" />
                    <span>Editar perfil</span>
                  </Link>
                </li>
                {user.role === "ZEUS" && (
                  <li role="none">
                    <Link href="/admin" role="menuitem">
                      <LuLayoutDashboard aria-hidden="true" />
                      <span>Administrar catálogo</span>
                    </Link>
                  </li>
                )}
                <li className={styles.logoutItem} role="none">
                  <button type="button" role="menuitem" onClick={() => void logout()}>
                    <FiLogOut aria-hidden="true" />
                    <span>Sair da conta</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <div className={styles.navButtons} aria-busy={loading}>
            <Link className={styles.btnSignIn} href="/login">
              <FiLogIn size={18} />
              <span>Login</span>
            </Link>
            <Link className={styles.btnSignUp} href="/register">
              <PiNotePencil size={18} />
              <span>Cadastrar</span>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export { Navbar };
