import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.loadingPage} aria-label="Carregando página" aria-live="polite" aria-busy="true">
      <span className={styles.spinner} aria-hidden="true" />
    </main>
  );
}
