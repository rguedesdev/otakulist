import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowLeft, FiSettings } from "react-icons/fi";

import styles from "./adult-content-gate.module.css";

function AdultContentGate({ blocked, children }: { blocked: boolean; children: ReactNode }) {
  if (!blocked) return children;

  return (
    <div className={styles.gate}>
      <div className={styles.restrictedContent} aria-hidden="true" inert>
        {children}
      </div>
      <div className={styles.overlay}>
        <section className={styles.warning} role="alert" aria-labelledby="adult-content-title">
          <span className={styles.ageBadge}>18+</span>
          <h1 id="adult-content-title">Conteúdo adulto</h1>
          <p>
            Esta obra foi marcada como conteúdo +18. Ative a exibição de conteúdo
            adulto nas configurações da sua conta para visualizar esta página.
          </p>
          <div className={styles.actions}>
            <Link className={styles.settingsAction} href="/settings/profile">
              <FiSettings aria-hidden="true" />
              Abrir configurações
            </Link>
            <Link className={styles.backAction} href="/">
              <FiArrowLeft aria-hidden="true" />
              Voltar para a home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export { AdultContentGate };
