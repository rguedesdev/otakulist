"use client";

import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import styles from "./customdatepicker.module.css";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type CalendarView = "days" | "months" | "years";

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
  const [view, setView] = useState<CalendarView>("days");
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
      setView("days");
    }
    setOpen((current) => !current);
  };

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toIsoDate(new Date());
  const minDate = min ? parseDate(min) : null;
  const maxDate = max ? parseDate(max) : null;
  const minMonthIndex = minDate ? minDate.getFullYear() * 12 + minDate.getMonth() : null;
  const maxMonthIndex = maxDate ? maxDate.getFullYear() * 12 + maxDate.getMonth() : null;
  const visibleMonthIndex = year * 12 + month;
  const firstYear = minDate?.getFullYear() ?? 1;
  const lastYear = maxDate?.getFullYear() ?? 9999;
  const decadeStart = Math.floor(year / 10) * 10;
  const decadeEnd = decadeStart + 9;
  const visibleYears = Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index);
  const todayDisabled = Boolean((min && today < min) || (max && today > max));

  const changeVisibleMonth = (nextYear: number, nextMonth: number) => {
    const requestedIndex = nextYear * 12 + nextMonth;
    let boundedIndex = requestedIndex;
    if (minMonthIndex !== null) boundedIndex = Math.max(minMonthIndex, boundedIndex);
    if (maxMonthIndex !== null) boundedIndex = Math.min(maxMonthIndex, boundedIndex);
    setVisibleMonth(new Date(Math.floor(boundedIndex / 12), boundedIndex % 12, 1));
  };

  const navigate = (direction: -1 | 1) => {
    if (view === "days") changeVisibleMonth(year, month + direction);
    if (view === "months") changeVisibleMonth(year + direction, month);
    if (view === "years") changeVisibleMonth(year + direction * 10, month);
  };

  const previousDisabled = view === "days"
    ? minMonthIndex !== null && visibleMonthIndex <= minMonthIndex
    : view === "months"
      ? year <= firstYear
      : decadeStart <= firstYear;
  const nextDisabled = view === "days"
    ? maxMonthIndex !== null && visibleMonthIndex >= maxMonthIndex
    : view === "months"
      ? year >= lastYear
      : decadeEnd >= lastYear;
  const navigationUnit = view === "days" ? "mês" : view === "months" ? "ano" : "década";
  const nextNavigationLabel = view === "days" ? "Próximo mês" : view === "months" ? "Próximo ano" : "Próxima década";

  return <div className={styles.picker} ref={wrapperRef}>
    {name && <input type="hidden" name={name} value={selectedValue} />}
    <button id={id} className={styles.trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={toggleCalendar}>
      <span className={selectedValue ? undefined : styles.placeholder}>{formatDate(selectedValue)}</span>
      <FiCalendar aria-hidden="true" />
    </button>
    {open && <div
      className={styles.calendar}
      role="dialog"
      aria-label="Escolher data"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.preventDefault()}
    >
      <div className={styles.header}>
        <button type="button" aria-label={`${navigationUnit} anterior`} disabled={previousDisabled} onClick={() => navigate(-1)}><FiChevronLeft aria-hidden="true" /></button>
        {view === "days" && (
          <button className={styles.periodButton} type="button" aria-label="Selecionar mês" onClick={() => setView("months")}>{monthNames[month]} {year}</button>
        )}
        {view === "months" && (
          <button className={styles.periodButton} type="button" aria-label="Selecionar ano" onClick={() => setView("years")}>{year}</button>
        )}
        {view === "years" && <strong className={styles.periodRange}>{decadeStart}–{decadeEnd}</strong>}
        <button type="button" aria-label={nextNavigationLabel} disabled={nextDisabled} onClick={() => navigate(1)}><FiChevronRight aria-hidden="true" /></button>
      </div>
      {view === "days" && <>
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
      </>}
      {view === "months" && <div className={styles.months}>
        {monthNames.map((monthName, index) => {
          const optionIndex = year * 12 + index;
          const disabled = Boolean(
            (minMonthIndex !== null && optionIndex < minMonthIndex)
            || (maxMonthIndex !== null && optionIndex > maxMonthIndex),
          );
          return <button
            className={index === month ? styles.activePeriod : undefined}
            type="button"
            disabled={disabled}
            key={monthName}
            onClick={() => { changeVisibleMonth(year, index); setView("days"); }}
          >{monthName}</button>;
        })}
      </div>}
      {view === "years" && <div className={styles.years}>
        {visibleYears.map((optionYear) => <button
          className={optionYear === year ? styles.activePeriod : undefined}
          type="button"
          disabled={optionYear < firstYear || optionYear > lastYear}
          key={optionYear}
          onClick={() => { changeVisibleMonth(optionYear, month); setView("months"); }}
        >{optionYear}</button>)}
      </div>}
      <div className={styles.actions}>
        <button type="button" disabled={todayDisabled} onClick={() => {
          const date = new Date();
          setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
          choose(toIsoDate(date));
        }}>Hoje</button>
        <button type="button" disabled={!selectedValue} onClick={() => choose("")}>Limpar</button>
      </div>
    </div>}
  </div>;
}
