import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./admin-form-actions.module.css";

type CancelLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
  children: ReactNode;
};

export function CancelLink({ children, className, ...props }: CancelLinkProps) {
  return (
    <Link {...props} className={[styles.cancelLink, className].filter(Boolean).join(" ")}>
      <FiArrowLeft aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
