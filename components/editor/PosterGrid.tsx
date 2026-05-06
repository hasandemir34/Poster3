"use client";

import { useState, useCallback } from "react";
import type { PhotoSlot } from "@/lib/types";
import { PhotoCell } from "@/components/editor/PhotoCell";
import { ZoomPanModal } from "@/components/editor/ZoomPanModal";
import { useDragDrop } from "@/components/editor/useDragDrop";
import { DragGhost } from "@/components/editor/DragGhost";

interface PosterGridProps {
  slots: PhotoSlot[];
  onSlotsChange: (slots: PhotoSlot[]) => void;
}

export function PosterGrid({ slots, onSlotsChange }: PosterGridProps) {
  const [zoomPanIndex, setZoomPanIndex] = useState<number | null>(null);

  const cols = 5;

  const { state: dragState, getCellDragProps, ghostInfo } = useDragDrop(
    slots,
    onSlotsChange
  );

  const handleFileSelected = useCallback(
    (slotIndex: number, file: File) => {
      const previewUrl = URL.createObjectURL(file);
      onSlotsChange(
        slots.map((s) =>
          s.slotIndex === slotIndex
            ? { ...s, file, previewUrl, zoom: 1, panX: 0, panY: 0 }
            : s
        )
      );
    },
    [slots, onSlotsChange]
  );

  const handleZoomPanSave = useCallback(
    (slotIndex: number, zoom: number, panX: number, panY: number) => {
      onSlotsChange(
        slots.map((s) => (s.slotIndex === slotIndex ? { ...s, zoom, panX, panY } : s))
      );
    },
    [slots, onSlotsChange]
  );

  const activeSlot = zoomPanIndex !== null ? slots[zoomPanIndex] : null;

  return (
    <>
      <div
        id="poster-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "2px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        {slots.map((slot) => (
          <PhotoCell
            key={slot.slotIndex}
            slot={slot}
            onFileSelected={handleFileSelected}
            onOpenZoomPan={setZoomPanIndex}
            dragProps={getCellDragProps(slot.slotIndex, !!slot.previewUrl)}
            isDragSource={dragState.dragSourceIndex === slot.slotIndex}
            isDragOver={
              dragState.dragOverIndex === slot.slotIndex &&
              dragState.dragSourceIndex !== slot.slotIndex
            }
          />
        ))}
      </div>

      <DragGhost ghostInfo={ghostInfo} />

      <ZoomPanModal
        slot={activeSlot}
        onClose={() => setZoomPanIndex(null)}
        onSave={handleZoomPanSave}
        onReplace={handleFileSelected}
      />
    </>
  );
}
