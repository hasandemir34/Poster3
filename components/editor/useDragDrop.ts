"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PhotoSlot } from "@/lib/types";

export interface DragDropState {
  /** Index of the slot currently being dragged */
  dragSourceIndex: number | null;
  /** Index of the slot currently hovered during drag */
  dragOverIndex: number | null;
}

interface UseDragDropReturn {
  state: DragDropState;
  /** Props to spread onto each PhotoCell wrapper */
  getCellDragProps: (slotIndex: number, hasPhoto: boolean) => CellDragProps;
  /** Ghost image element to render (portal-style) */
  ghostInfo: GhostInfo | null;
}

export interface CellDragProps {
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export interface GhostInfo {
  previewUrl: string;
  x: number;
  y: number;
}

export function useDragDrop(
  slots: PhotoSlot[],
  onSlotsChange: (slots: PhotoSlot[]) => void
): UseDragDropReturn {
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [ghostInfo, setGhostInfo] = useState<GhostInfo | null>(null);

  // Touch-drag refs
  const touchDragRef = useRef<{
    sourceIndex: number;
    startX: number;
    startY: number;
    isDragging: boolean;
    longPressTimer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  // Keep a ref to the grid element for hit-testing during touch
  const gridCellsRef = useRef<Map<number, DOMRect>>(new Map());

  // Cleanup ghost on unmount
  useEffect(() => {
    return () => {
      if (touchDragRef.current?.longPressTimer) {
        clearTimeout(touchDragRef.current.longPressTimer);
      }
    };
  }, []);

  /** Execute the swap/move between source and target */
  const executeMove = useCallback(
    (sourceIdx: number, targetIdx: number) => {
      if (sourceIdx === targetIdx) return;
      const source = slots[sourceIdx];
      const target = slots[targetIdx];

      // Only move if source has a photo
      if (!source.previewUrl) return;

      const next = slots.map((s) => {
        if (s.slotIndex === sourceIdx) {
          // Source gets target's data (swap) or becomes empty (move)
          if (target.previewUrl) {
            return {
              ...s,
              file: target.file,
              previewUrl: target.previewUrl,
              zoom: target.zoom,
              panX: target.panX,
              panY: target.panY,
            };
          } else {
            return {
              ...s,
              file: null,
              previewUrl: null,
              zoom: 1,
              panX: 0,
              panY: 0,
            };
          }
        }
        if (s.slotIndex === targetIdx) {
          // Target gets source's data
          return {
            ...s,
            file: source.file,
            previewUrl: source.previewUrl,
            zoom: source.zoom,
            panX: source.panX,
            panY: source.panY,
          };
        }
        return s;
      });

      onSlotsChange(next);
    },
    [slots, onSlotsChange]
  );

  /** Find which cell a touch point is over */
  const hitTest = useCallback((x: number, y: number): number | null => {
    let found: number | null = null;
    gridCellsRef.current.forEach((rect, idx) => {
      if (
        found === null &&
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        found = idx;
      }
    });
    return found;
  }, []);

  /** Refresh all cell rects (call at drag start) */
  const refreshRects = useCallback(() => {
    // We'll query from DOM using data attributes
    const cells = document.querySelectorAll<HTMLElement>("[data-slot-index]");
    gridCellsRef.current.clear();
    cells.forEach((el) => {
      const idx = parseInt(el.dataset.slotIndex!, 10);
      gridCellsRef.current.set(idx, el.getBoundingClientRect());
    });
  }, []);

  const getCellDragProps = useCallback(
    (slotIndex: number, hasPhoto: boolean): CellDragProps => {
      return {
        draggable: hasPhoto,

        // ── HTML5 Drag & Drop ──────────────────────────────────
        onDragStart: (e: React.DragEvent) => {
          if (!hasPhoto) {
            e.preventDefault();
            return;
          }
          setDragSourceIndex(slotIndex);

          // Create a tiny transparent drag image (we'll show our own ghost)
          const blank = document.createElement("canvas");
          blank.width = 1;
          blank.height = 1;
          e.dataTransfer.setDragImage(blank, 0, 0);
          e.dataTransfer.effectAllowed = "move";

          const slot = slots[slotIndex];
          if (slot.previewUrl) {
            setGhostInfo({
              previewUrl: slot.previewUrl,
              x: e.clientX,
              y: e.clientY,
            });
          }
        },

        onDragEnd: () => {
          setDragSourceIndex(null);
          setDragOverIndex(null);
          setGhostInfo(null);
        },

        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDragOverIndex(slotIndex);

          // Update ghost position
          setGhostInfo((prev) =>
            prev ? { ...prev, x: e.clientX, y: e.clientY } : null
          );
        },

        onDragEnter: (e: React.DragEvent) => {
          e.preventDefault();
          setDragOverIndex(slotIndex);
        },

        onDragLeave: () => {
          setDragOverIndex((prev) => (prev === slotIndex ? null : prev));
        },

        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          if (dragSourceIndex !== null) {
            executeMove(dragSourceIndex, slotIndex);
          }
          setDragSourceIndex(null);
          setDragOverIndex(null);
          setGhostInfo(null);
        },

        // ── Touch events ───────────────────────────────────────
        onTouchStart: (e: React.TouchEvent) => {
          if (!hasPhoto) return;
          const touch = e.touches[0];

          // Use a long-press (300ms) to initiate drag on touch
          const timer = setTimeout(() => {
            if (!touchDragRef.current) return;
            touchDragRef.current.isDragging = true;
            setDragSourceIndex(slotIndex);
            refreshRects();

            const slot = slots[slotIndex];
            if (slot.previewUrl) {
              setGhostInfo({
                previewUrl: slot.previewUrl,
                x: touch.clientX,
                y: touch.clientY,
              });
            }
          }, 300);

          touchDragRef.current = {
            sourceIndex: slotIndex,
            startX: touch.clientX,
            startY: touch.clientY,
            isDragging: false,
            longPressTimer: timer,
          };
        },

        onTouchMove: (e: React.TouchEvent) => {
          if (!touchDragRef.current) return;
          const touch = e.touches[0];

          // Cancel long-press if finger moves too much before it fires
          if (!touchDragRef.current.isDragging) {
            const dx = touch.clientX - touchDragRef.current.startX;
            const dy = touch.clientY - touchDragRef.current.startY;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
              if (touchDragRef.current.longPressTimer) {
                clearTimeout(touchDragRef.current.longPressTimer);
                touchDragRef.current.longPressTimer = null;
              }
            }
            return;
          }

          // Prevent scrolling while dragging
          e.preventDefault();

          // Update ghost
          setGhostInfo((prev) =>
            prev
              ? { ...prev, x: touch.clientX, y: touch.clientY }
              : null
          );

          // Hit-test for hover highlight
          const overIdx = hitTest(touch.clientX, touch.clientY);
          setDragOverIndex(overIdx);
        },

        onTouchEnd: () => {
          if (!touchDragRef.current) return;

          if (touchDragRef.current.longPressTimer) {
            clearTimeout(touchDragRef.current.longPressTimer);
          }

          if (
            touchDragRef.current.isDragging &&
            dragOverIndex !== null &&
            dragSourceIndex !== null
          ) {
            executeMove(dragSourceIndex, dragOverIndex);
          }

          touchDragRef.current = null;
          setDragSourceIndex(null);
          setDragOverIndex(null);
          setGhostInfo(null);
        },
      };
    },
    [
      slots,
      dragSourceIndex,
      dragOverIndex,
      executeMove,
      hitTest,
      refreshRects,
    ]
  );

  return {
    state: { dragSourceIndex, dragOverIndex },
    getCellDragProps,
    ghostInfo,
  };
}
