"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FiChevronDown, FiFilter } from "react-icons/fi";

import styles from "./publication-filters.module.css";

type Props = {
  medium: "manga" | "light-novel";
  statuses: string[];
  facets: Array<{ key: string; label: string; values: string[] }>;
  selected: Record<string, string>;
};

const statusLabels: Record<string, string> = {
  PUBLISHING: "Em publicação",
  FINISHED: "Completo",
  ANNOUNCED: "Próximos",
  HIATUS: "Em hiato",
  CANCELLED: "Cancelado",
};

export function PublicationFilters({ medium, statuses, facets, selected }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const selectedStatus = selected.workStatus ?? "";
  const hasActiveFilters = Boolean(selectedStatus || facets.some(({ key }) => selected[key]));

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  return (
    <div className={styles.filterBar} aria-label={`Filtros de ${medium === "manga" ? "manga" : "light novel"}`} aria-busy={isPending}>
      <span className={styles.filterLabel}><FiFilter aria-hidden="true" />Filtros</span>
      <button
        className={!hasActiveFilters ? styles.filterActive : undefined}
        type="button"
        disabled={isPending}
        onClick={() => updateFilters({ workStatus: null, ...Object.fromEntries(facets.map(({ key }) => [key, null])) })}
      >Todos</button>
      {statuses.map((status) => (
        <button
          className={selectedStatus === status ? styles.filterActive : undefined}
          type="button"
          disabled={isPending}
          aria-pressed={selectedStatus === status}
          onClick={() => updateFilters({ workStatus: selectedStatus === status ? null : status })}
          key={status}
        >{statusLabels[status] ?? status}</button>
      ))}
      {facets.map(({ key, label, values }) => {
        const active = Boolean(selected[key]);
        return (
          <label className={active ? styles.facetActive : styles.facet} key={key}>
            <span className={styles.srOnly}>Filtrar por {label.toLocaleLowerCase("pt-BR")}</span>
            <select
              value={selected[key] ?? ""}
              disabled={isPending}
              onChange={(event) => updateFilters({ [key]: event.target.value || null })}
            >
              <option value="">{label}</option>
              {values.map((value) => <option value={value} key={value}>{value}</option>)}
            </select>
            <FiChevronDown aria-hidden="true" />
          </label>
        );
      })}
    </div>
  );
}
