"use client";

import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import styles from "./customdatepicker.module.css";

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("pt-BR").format(date) : "Selecione a data";
}

export function CustomDatePicker({ value, defaultValue = "", name, id, onChange, min, max }: {
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  onChange?(value: string): void;
  min?: string;
  max?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = parseDate(value ?? defaultValue) ?? new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedValue = value ?? internalValue;

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const choose = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  };

  const toggleCalendar = () => {
    if (!open) {
      const selected = parseDate(selectedValue);
      if (selected) setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    setOpen((current) => !current);
  };

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(visibleMonth);
  const today = toIsoDate(new Date());

  return <div className={styles.picker} ref={wrapperRef}>
    {name && <input type="hidden" name={name} value={selectedValue} />}
    <button id={id} className={styles.trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={toggleCalendar}>
      <span className={selectedValue ? undefined : styles.placeholder}>{formatDate(selectedValue)}</span>
      <FiCalendar aria-hidden="true" />
    </button>
    {open && <div className={styles.calendar} role="dialog" aria-label="Escolher data">
      <div className={styles.header}>
        <button type="button" aria-label="Mês anterior" onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}><FiChevronLeft aria-hidden="true" /></button>
        <strong>{monthLabel}</strong>
        <button type="button" aria-label="Próximo mês" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}><FiChevronRight aria-hidden="true" /></button>
      </div>
      <div className={styles.weekdays} aria-hidden="true">
        {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className={styles.days}>
        {Array.from({ length: leadingDays }, (_, index) => <span key={`empty-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const isoDate = toIsoDate(new Date(year, month, day));
          const disabled = Boolean((min && isoDate < min) || (max && isoDate > max));
          return <button
            type="button"
            className={`${isoDate === selectedValue ? styles.selected : ""} ${isoDate === today ? styles.today : ""}`}
            disabled={disabled}
            aria-pressed={isoDate === selectedValue}
            key={isoDate}
            onClick={() => choose(isoDate)}
          >{day}</button>;
        })}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => {
          const date = new Date();
          setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
          choose(toIsoDate(date));
        }}>Hoje</button>
        <button type="button" disabled={!selectedValue} onClick={() => choose("")}>Limpar</button>
      </div>
    </div>}
  </div>;
}
