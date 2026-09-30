"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

import styles from "./slidinglinktabs.module.css";

type LinkTab = { id: string; label: string; href: string; icon?: ReactNode };

export function SlidingLinkTabs({ tabs, activeId, className, activeClassName, ariaLabel = "Conteúdo do perfil" }: { tabs: LinkTab[]; activeId: string; className: string; activeClassName: string; ariaLabel?: string }) {
  const nav = useRef<HTMLElement | null>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, visible: false });

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const link = links.current.get(activeId);
      if (!link) return;
      setIndicator({ left: link.offsetLeft, top: link.offsetTop, width: link.offsetWidth, height: link.offsetHeight, visible: true });
    };
    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    if (nav.current) observer.observe(nav.current);
    window.addEventListener("resize", updateIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeId]);

  return (
    <nav ref={nav} className={className} aria-label={ariaLabel}>
      <span
        className={styles.indicator}
        aria-hidden="true"
        style={{ width: indicator.width, height: indicator.height, transform: `translate(${indicator.left}px, ${indicator.top}px)`, opacity: indicator.visible ? 1 : 0 }}
      />
      {tabs.map((tab) => (
        <Link
          ref={(node) => { if (node) links.current.set(tab.id, node); else links.current.delete(tab.id); }}
          className={`${styles.link} ${activeId === tab.id ? activeClassName : ""}`}
          href={tab.href}
          aria-current={activeId === tab.id ? "page" : undefined}
          key={tab.id}
        >
          {tab.icon}
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
