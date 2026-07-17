// Imports Pricipais
import Link from "next/link";

// Style Sheet CSS
import styles from "./footer.module.css";

// Icones
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandBluesky } from "react-icons/tb";
import { RiDiscordLine } from "react-icons/ri";

import { BsGithub } from "react-icons/bs";

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footer}>
        <div className={styles.socialMediasContainer}>
          <p>Siga-nos nas Redes Sociais</p>
          <div className={styles.socialMedias}>
            <Link className={styles.instagramIcon} href={`/`}>
              <FaInstagram size={20} />
            </Link>

            <Link className={styles.twitterXIcon} href={`/`}>
              <FaXTwitter size={18} />
            </Link>

            <Link className={styles.blueskyIcon} href={`/`}>
              <TbBrandBluesky size={22} />
            </Link>

            <Link className={styles.discordIcon} href={`/`}>
              <RiDiscordLine size={24} />
            </Link>

            <Link className={styles.githubIcon} href={`/`}>
              <BsGithub size={20} />
            </Link>
          </div>
        </div>
        <hr className={styles.hrFaded} />
        <div className={styles.copyrightVersionContainer}>
          <h2 className={styles.copyright}>
            © 2026 OtakuList • Todos os direitos reservados.
          </h2>
          <h3 className={styles.titleVersion}>Alpha • 0.1.0</h3>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
