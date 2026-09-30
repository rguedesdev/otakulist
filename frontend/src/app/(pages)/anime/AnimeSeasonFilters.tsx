"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FiChevronDown, FiFilter } from "react-icons/fi";

import styles from "./anime.module.css";

type AnimeFormatFilter = "TV" | "MOVIE" | "OVA";
type AnimeStatusFilter = "AIRING" | "ANNOUNCED";

const formatFilters: Array<{ value: AnimeFormatFilter; label: string }> = [
  { value: "TV", label: "TV" },
  { value: "MOVIE", label: "Filmes" },
  { value: "OVA", label: "OVA" },
];

const statusFilters: Array<{ value: AnimeStatusFilter; label: string }> = [
  { value: "AIRING", label: "Em lançamento" },
  { value: "ANNOUNCED", label: "Próximos" },
];

export function AnimeSeasonFilters({
  genres,
  selectedFormat,
  selectedStatus,
  selectedGenre,
}: {
  genres: string[];
  selectedFormat: AnimeFormatFilter | null;
  selectedStatus: AnimeStatusFilter | null;
  selectedGenre: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const hasActiveFilters = Boolean(selectedFormat || selectedStatus || selectedGenre);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, key === "genre" ? value : value.toLowerCase());
      else params.delete(key);
    });
    startTransition(() => {
      router.replace(`/anime?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={styles.filterBar} aria-label="Filtros de anime" aria-busy={isPending}>
      <span className={styles.filterLabel}><FiFilter aria-hidden="true" />Filtros</span>
      <button
        className={!hasActiveFilters ? styles.filterActive : undefined}
        type="button"
        disabled={isPending}
        onClick={() => updateFilters({ format: null, status: null, genre: null })}
      >
        Todos
      </button>
      {formatFilters.map((filter) => (
        <button
          className={selectedFormat === filter.value ? styles.filterActive : undefined}
          type="button"
          disabled={isPending}
          aria-pressed={selectedFormat === filter.value}
          onClick={() => updateFilters({ format: selectedFormat === filter.value ? null : filter.value })}
          key={filter.value}
        >
          {filter.label}
        </button>
      ))}
      {statusFilters.map((filter) => (
        <button
          className={selectedStatus === filter.value ? styles.filterActive : undefined}
          type="button"
          disabled={isPending}
          aria-pressed={selectedStatus === filter.value}
          onClick={() => updateFilters({ status: selectedStatus === filter.value ? null : filter.value })}
          key={filter.value}
        >
          {filter.label}
        </button>
      ))}
      <label className={selectedGenre ? styles.genreFilterActive : styles.genreFilter}>
        <span className={styles.srOnly}>Filtrar por gênero</span>
        <select
          value={selectedGenre ?? ""}
          disabled={isPending}
          onChange={(event) => updateFilters({ genre: event.target.value || null })}
        >
          <option value="">Gêneros</option>
          {genres.map((genre) => <option value={genre} key={genre}>{genre}</option>)}
        </select>
        <FiChevronDown aria-hidden="true" />
      </label>
    </div>
  );
}
