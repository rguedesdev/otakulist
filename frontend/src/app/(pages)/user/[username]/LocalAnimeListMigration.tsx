"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/shared/auth/auth-provider";
import { saveAnimeListEntry } from "@/shared/tracking/anime-list-api";

export function LocalAnimeListMigration({ profileUserId }: { profileUserId: string }) {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !accessToken || user.id !== profileUserId) return;
    const prefix = `otakulist:anime-tracker:${user.id}:`;
    const entries = Object.keys(window.localStorage)
      .filter((key) => key.startsWith(prefix))
      .map((key) => ({ key, slug: key.slice(prefix.length) }));
    if (entries.length === 0) return;

    let active = true;
    void Promise.all(entries.map(async ({ key, slug }) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const migrationKey = `otakulist:anime-tracker-migrated:${key}`;
      if (window.sessionStorage.getItem(migrationKey) === raw) return false;
      try {
        const tracker = JSON.parse(raw) as { isAdded?: boolean; status?: string; score?: string; seasonProgress?: Record<number, number> };
        if (tracker.isAdded === false || !tracker.seasonProgress) return false;
        await saveAnimeListEntry(slug, accessToken, {
          status: tracker.status ?? "planejado",
          score: tracker.score ?? "",
          seasonProgress: tracker.seasonProgress,
        });
        window.sessionStorage.setItem(migrationKey, raw);
        return true;
      } catch {
        return false;
      }
    })).then((results) => {
      if (active && results.some(Boolean)) router.refresh();
    });

    return () => { active = false; };
  }, [accessToken, profileUserId, router, user]);

  return null;
}
