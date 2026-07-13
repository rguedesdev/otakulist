// Style Sheet CSS
import styles from "./footer.module.css";

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footer}>
        <h2 className={styles.title}>
          © 2026 Otakulist | Todos os direitos reservados!
        </h2>
        <h3>Alpha • 1.0.0</h3>
      </div>
    </footer>
  );
}

export { Footer };
