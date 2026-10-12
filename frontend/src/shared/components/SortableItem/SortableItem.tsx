"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";

import styles from "./sortableitem.module.css";

type SortableItemProps = {
  listId: string;
  index: number;
  count: number;
  onMove(from: number, to: number): void;
  children: ReactNode;
};

function SortableItem({ listId, index, count, onMove, children }: SortableItemProps) {
  const itemElement = useRef<HTMLDivElement>(null);
  const contentElement = useRef<HTMLDivElement>(null);
  const controlsElement = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ id: number; x: number; y: number; active: boolean; target: number } | null>(null);
  const dropTargetElement = useRef<HTMLElement | null>(null);
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const item = itemElement.current;
    const content = contentElement.current;
    const controls = controlsElement.current;
    if (!item || !content || !controls) return;

    const alignControls = () => {
      const field = content.querySelector<HTMLElement>("input:not([type='hidden']), select, textarea, [role='combobox'], button");
      if (!field) return;
      const fieldCenter = field.getBoundingClientRect().top + field.getBoundingClientRect().height / 2;
      const itemTop = item.getBoundingClientRect().top;
      controls.style.top = `${fieldCenter - itemTop - controls.offsetHeight / 2}px`;
    };

    alignControls();
    const observer = new ResizeObserver(alignControls);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children]);

  const moveWithTransition = (from: number, to: number) => {
    if (from === to) return;
    const selector = `[data-sortable-list="${listId}"]`;
    const beforeElements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const beforeTops = new Map(beforeElements.map((element) => [Number(element.dataset.sortableIndex), element.getBoundingClientRect().top]));

    onMove(from, to);

    requestAnimationFrame(() => {
      const afterElements = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const low = Math.min(from, to);
      const high = Math.max(from, to);
      for (const element of afterElements) {
        const newIndex = Number(element.dataset.sortableIndex);
        if (newIndex < low || newIndex > high) continue;
        const oldIndex = newIndex === to ? from : from < to ? newIndex + 1 : newIndex - 1;
        const oldTop = beforeTops.get(oldIndex);
        if (oldTop === undefined) continue;
        const offset = oldTop - element.getBoundingClientRect().top;
        if (offset === 0) continue;
        element.animate(
          [{ transform: `translateY(${offset}px)` }, { transform: "translateY(0)" }],
          { duration: 240, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)" },
        );
      }
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY, active: false, target: index };
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    if (!start.active && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6) return;
    start.active = true;
    setDragging(true);
    const selector = `[data-sortable-list="${listId}"]`;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>(selector);
    const targetIndex = Number(target?.dataset.sortableIndex);
    if (Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < count) {
      start.target = targetIndex;
      if (dropTargetElement.current !== target) {
        dropTargetElement.current?.removeAttribute("data-drop-target");
        target?.setAttribute("data-drop-target", "true");
        dropTargetElement.current = target ?? null;
      }
    } else {
      dropTargetElement.current?.removeAttribute("data-drop-target");
      dropTargetElement.current = null;
    }
  };

  const finishPointerDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    if (start.active && start.target !== index) moveWithTransition(index, start.target);
    pointerStart.current = null;
    setDragging(false);
    dropTargetElement.current?.removeAttribute("data-drop-target");
    dropTargetElement.current = null;
  };

  return (
    <div ref={itemElement} className={styles.item} data-sortable-list={listId} data-sortable-index={index} data-dragging={dragging || undefined}>
      <div ref={controlsElement} className={styles.controls}>
        <button className={styles.moveButton} type="button" aria-label={`Mover item ${index + 1} para cima`} disabled={index === 0} onClick={() => moveWithTransition(index, index - 1)}><FiChevronUp aria-hidden="true" /></button>
        <button
          className={styles.dragHandle}
          type="button"
          aria-label={`Arrastar item ${index + 1}`}
          title="Arraste para mudar a posição"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerDrag}
          onPointerCancel={finishPointerDrag}
        ><FiMenu aria-hidden="true" /></button>
        <button className={styles.moveButton} type="button" aria-label={`Mover item ${index + 1} para baixo`} disabled={index === count - 1} onClick={() => moveWithTransition(index, index + 1)}><FiChevronDown aria-hidden="true" /></button>
      </div>
      <div ref={contentElement} className={styles.content}>{children}</div>
    </div>
  );
}

function reorderItems<T>(items: T[], from: number, to: number) {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return items;
  const reordered = [...items];
  const [item] = reordered.splice(from, 1);
  reordered.splice(to, 0, item);
  return reordered;
}

export { SortableItem, reorderItems };
