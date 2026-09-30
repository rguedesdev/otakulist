import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LuSaveAll } from "react-icons/lu";
import styles from "./admin-form-actions.module.css";

type SaveButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
};

export function SaveButton({ children, className, ...props }: SaveButtonProps) {
  return (
    <button {...props} className={[styles.saveButton, className].filter(Boolean).join(" ")} type="submit">
      <LuSaveAll aria-hidden="true" />
      <span>{children}</span>
    </button>
  );
}
