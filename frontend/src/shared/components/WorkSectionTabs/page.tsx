"use client";

import { Fragment, type ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import transitionStyles from "./worksectiontabs.module.css";

export type WorkSection = {
  id: string;
  label: string;
  content: ReactNode;
  generalContent?: ReactNode;
};

export function WorkSectionTabs({
  sidebar,
  tracker,
  sections,
  classes,
}: {
  sidebar: ReactNode;
  tracker: ReactNode;
  sections: WorkSection[];
  classes: Record<string, string>;
}) {
  const [selectedSection, setSelectedSection] = useState("geral");
  const [displayedSection, setDisplayedSection] = useState("geral");
  const [isChanging, setIsChanging] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const changeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionIds = useRef(new Set(["geral", ...sections.map((section) => section.id)]));
  const sectionNav = useRef<HTMLElement | null>(null);
  const tabButtons = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    sectionIds.current = new Set(["geral", ...sections.map((section) => section.id)]);
  }, [sections]);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const button = tabButtons.current.get(selectedSection);
      if (!button) return;
      setIndicator({ left: button.offsetLeft + 12, width: button.offsetWidth - 24, visible: true });
    };
    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    if (sectionNav.current) observer.observe(sectionNav.current);
    window.addEventListener("resize", updateIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [selectedSection]);

  useEffect(() => {
    const sectionFromHash = () => {
      const hash = window.location.hash.slice(1);
      const id = hash === "acompanhar" ? "geral" : hash;
      return sectionIds.current.has(id) ? id : "geral";
    };
    const syncFromHistory = () => {
      const id = sectionFromHash();
      setSelectedSection(id);
      setIsChanging(true);
      if (changeTimer.current) clearTimeout(changeTimer.current);
      changeTimer.current = setTimeout(() => {
        setDisplayedSection(id);
        setIsChanging(false);
      }, 140);
    };

    const initialSection = sectionFromHash();
    setSelectedSection(initialSection);
    setDisplayedSection(initialSection);
    window.addEventListener("hashchange", syncFromHistory);
    window.addEventListener("popstate", syncFromHistory);
    return () => {
      window.removeEventListener("hashchange", syncFromHistory);
      window.removeEventListener("popstate", syncFromHistory);
      if (changeTimer.current) clearTimeout(changeTimer.current);
    };
  }, []);

  function selectSection(id: string) {
    if (id === selectedSection) return;
    setSelectedSection(id);
    setIsChanging(true);
    if (changeTimer.current) clearTimeout(changeTimer.current);
    changeTimer.current = setTimeout(() => {
      setDisplayedSection(id);
      setIsChanging(false);
    }, 140);
    window.history.pushState(null, "", `#${id}`);
  }

  const visibleSections = displayedSection === "geral"
    ? sections
    : sections.filter((section) => section.id === displayedSection);

  return (
    <>
      <nav ref={sectionNav} className={classes.sectionNav} aria-label="Seções da página" role="tablist">
        <span
          className={transitionStyles.tabIndicator}
          aria-hidden="true"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)`, opacity: indicator.visible ? 1 : 0 }}
        />
        <button ref={(node) => { if (node) tabButtons.current.set("geral", node); else tabButtons.current.delete("geral"); }} type="button" role="tab" aria-selected={selectedSection === "geral"} className={selectedSection === "geral" ? classes.activeTab : undefined} onClick={() => selectSection("geral")}>Geral</button>
        {sections.map((section) => (
          <button ref={(node) => { if (node) tabButtons.current.set(section.id, node); else tabButtons.current.delete(section.id); }} key={section.id} type="button" role="tab" aria-selected={selectedSection === section.id} className={selectedSection === section.id ? classes.activeTab : undefined} onClick={() => selectSection(section.id)}>
            {section.label}
          </button>
        ))}
      </nav>
      <div className={classes.contentContainer}>
        <div className={classes.sidebarColumn}>{sidebar}</div>
        <div className={`${classes.centralContainer} ${transitionStyles.contentTransition} ${isChanging ? transitionStyles.contentChanging : ""}`} role="tabpanel" aria-live="polite">
          {displayedSection === "geral" && <Fragment key="general-tracker">{tracker}</Fragment>}
          {visibleSections.map((section) => <div id={section.id} className={classes.contentSection} key={section.id}>{displayedSection === "geral" ? section.generalContent ?? section.content : section.content}</div>)}
        </div>
      </div>
    </>
  );
}
