"use client";

// Imports Principais
import { useState, useRef } from "react";
import Image from "next/image";

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

  return (
    <header className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Image src="/logo.png" alt="Logo" width={150} height={50} priority />
          <span className={styles.badgeVersion}>Alpha</span>
        </div>

        <ul className={styles.navList}>
          <li className={styles.navLink}>
            <RiHome3Line size={18} />
            <span>Home</span>
          </li>
          <li className={styles.navLink}>
            <FiTv size={18} />
            <span>Anime</span>
          </li>

          <li className={styles.navLink}>
            <GiEvilBook size={18} />
            <span>Manga</span>
          </li>

          <li className={styles.navLink}>
            <LuBookHeart size={18} />
            <span>Novel</span>
          </li>

          <li className={styles.navLink}>
            <BsBook size={18} />
            <span>Magazine</span>
          </li>
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
              <FiLogIn size={20} />
              <span>Login</span>
            </button>
            <button className={styles.btnSignUp}>
              <PiNotePencil size={20} />
              <span>Cadastrar</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export { Navbar };
