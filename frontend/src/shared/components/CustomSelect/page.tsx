"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import styles from "./customselect.module.css";

export type CustomSelectOption = { value: string; label: string };

export function CustomSelect({ options, value, defaultValue, name, id, onChange, required = false, compact = false }: {
  options: readonly CustomSelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  onChange?(value: string): void;
  required?: boolean;
  compact?: boolean;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const choose = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  };

  return <div className={`${styles.select} ${compact ? styles.compact : ""}`} ref={wrapperRef}>
    {name && <input type="hidden" name={name} value={selectedValue} />}
    <button id={id} className={styles.trigger} type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span className={selected ? undefined : styles.placeholder}>{selected?.label ?? "Selecione"}</span>
      <FiChevronDown aria-hidden="true" />
    </button>
    {open && <div className={styles.menu} role="listbox">
      {options.map((option) => <button className={option.value === selectedValue ? styles.selected : undefined} type="button" role="option" aria-selected={option.value === selectedValue} key={option.value} onClick={() => choose(option.value)}>{option.label}</button>)}
    </div>}
    {required && !selectedValue && <input className={styles.required} required tabIndex={-1} aria-hidden="true" value="" onChange={() => undefined} />}
  </div>;
}
