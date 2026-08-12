"use client";

// Imports Principais
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Style Sheet CSS
import styles from "./navbar.module.css";

// Icones
import { RiHome3Line } from "react-icons/ri";
import { FiTv } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";

import { FiLogIn } from "react-icons/fi";
import { PiNotePencil } from "react-icons/pi";

import { BsBook } from "react-icons/bs";

function Navbar() {
  const pathname = usePathname();
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

  const Authenticated = false;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === href
      : pathname.startsWith(`${href}/`) || pathname === href;

  return (
    <header className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <Link
          className={styles.logoContainer}
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
          <span className={styles.badgeVersion}>Alpha</span>
        </Link>

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

        {Authenticated ? (
          <div
            className={styles.profileDropdownWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Avatar */}
            <Image
              className={styles.avatar}
              src="/kon.jpg"
              alt="Profile Picture"
              width={40}
              height={40}
              priority
            />

            {/* Menu */}
            {dropdownOpen && (
              <ul
                className={styles.menuDropdown}
                onMouseEnter={handleMouseEnter}
              >
                <li>Perfil</li>
                <li>Configurações</li>
              </ul>
            )}
          </div>
        ) : (
          <div className={styles.navButtons}>
            <button className={styles.btnSignIn}>
              <FiLogIn size={18} />
              <span>Login</span>
            </button>
            <button className={styles.btnSignUp}>
              <PiNotePencil size={18} />
              <span>Cadastrar</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export { Navbar };
