"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import Loading from "@/app/loading";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingFromPathname, setLoadingFromPathname] = useState<string | null>(null);

  useEffect(() => {
    if (loadingFromPathname === null || loadingFromPathname === pathname) return;
    const clearCompletedNavigation = window.setTimeout(() => setLoadingFromPathname(null), 0);
    return () => window.clearTimeout(clearCompletedNavigation);
  }, [loadingFromPathname, pathname]);

  useEffect(() => {
    const beginNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;

      event.preventDefault();
      setLoadingFromPathname(window.location.pathname);
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    };

    const clearHistoryNavigation = () => setLoadingFromPathname(null);

    document.addEventListener("click", beginNavigation, true);
    window.addEventListener("popstate", clearHistoryNavigation);
    return () => {
      document.removeEventListener("click", beginNavigation, true);
      window.removeEventListener("popstate", clearHistoryNavigation);
    };
  }, [router]);

  return loadingFromPathname === pathname ? <Loading /> : children;
}
