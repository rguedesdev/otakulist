"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import { assetUrl } from "@/shared/auth/api";
import { useAuth } from "@/shared/auth/auth-provider";
import styles from "./media-search.module.css";

type SearchMedium = "ANIME" | "MANGA" | "LIGHT_NOVEL";

type MediaSearchResult = {
  id: string;
  title: string;
  coverUrl: string;
  status: string;
  href: string;
};

type MediaSearchProps = {
  medium: SearchMedium;
  label: string;
  placeholder: string;
};

const searchWorksQuery = `query SearchWorks($query: String!, $medium: WorkMedium!, $includeAdult: Boolean!) {
  searchWorks(query: $query, medium: $medium, includeAdult: $includeAdult) {
    id title coverUrl status href
  }
}`;

const statusLabels: Record<string, string> = {
  ANNOUNCED: "Anunciado",
  AIRING: "Em exibição",
  PUBLISHING: "Em publicação",
  FINISHED: "Finalizado",
  HIATUS: "Em hiato",
  CANCELLED: "Cancelado",
};

function MediaSearch({ medium, label, placeholder }: MediaSearchProps) {
  const { user } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const normalizedQuery = query.trim();

  useEffect(() => {
    if (normalizedQuery.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchWorksQuery,
            variables: { query: normalizedQuery, medium, includeAdult: user?.showAdultContent ?? false },
          }),
          signal: controller.signal,
        });
        const body = await response.json() as {
          data?: { searchWorks: MediaSearchResult[] };
          errors?: Array<{ message: string }>;
        };
        if (!response.ok || body.errors || !body.data) throw new Error("Busca indisponível");
        setResults(body.data.searchWorks);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
        setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [medium, normalizedQuery, user?.showAdultContent]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const showResults = isOpen && normalizedQuery.length >= 2;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputBox}>
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          role="combobox"
          aria-label={label}
          aria-expanded={showResults}
          aria-controls={`${medium.toLowerCase()}-search-results`}
          aria-autocomplete="list"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setIsOpen(true);
            if (nextQuery.trim().length < 2) {
              setResults([]);
              setLoading(false);
              setFailed(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button
            className={styles.clearButton}
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
          >
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      {showResults && (
        <div
          className={styles.results}
          id={`${medium.toLowerCase()}-search-results`}
          aria-live="polite"
        >
          {loading ? (
            <p className={styles.message}>Buscando…</p>
          ) : failed ? (
            <p className={styles.message}>Não foi possível realizar a busca.</p>
          ) : results.length === 0 ? (
            <p className={styles.message}>Nenhum resultado encontrado.</p>
          ) : (
            <ul>
              {results.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    <Image
                      src={assetUrl(item.coverUrl) ?? item.coverUrl}
                      alt=""
                      width={42}
                      height={58}
                      unoptimized
                    />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{statusLabels[item.status] ?? item.status}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export { MediaSearch };
