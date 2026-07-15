// Style Sheet CSS
import styles from "./footer.module.css";

// Icones
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { AiOutlineDiscord } from "react-icons/ai";
import { TbBrandBluesky } from "react-icons/tb";
import { BsGithub } from "react-icons/bs";

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footer}>
        <div>
          <p>Siga-nos nas redes sociais</p>
          <FaInstagram size={20} />
          <FaXTwitter size={20} />
          <AiOutlineDiscord size={22} />
          <TbBrandBluesky size={20} />
          <BsGithub size={20} />
        </div>
        <div>
          <h2 className={styles.title}>
            © 2026 OtakuList | Todos os direitos reservados.
          </h2>
          <h3 className={styles.titleVersion}>Alpha • 1.0.0</h3>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
