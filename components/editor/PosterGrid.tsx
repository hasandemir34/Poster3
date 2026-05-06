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
  const [isOverGrid, setIsOverGrid] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsOverGrid(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverGrid(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOverGrid(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length === 0) return;

      const newSlots = [...slots];
      let fileIndex = 0;

      for (let i = 0; i < newSlots.length && fileIndex < files.length; i++) {
        if (!newSlots[i].file) {
          const file = files[fileIndex];
          newSlots[i] = {
            ...newSlots[i],
            file,
            previewUrl: URL.createObjectURL(file),
            zoom: 1,
            panX: 0,
            panY: 0,
          };
          fileIndex++;
        }
      }

      onSlotsChange(newSlots);
    },
    [slots, onSlotsChange]
  );

  const activeSlot = zoomPanIndex !== null ? slots[zoomPanIndex] : null;

  return (
    <>
      <div
        id="poster-grid"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`transition-all duration-300 ${
          isOverGrid ? "ring-4 ring-pastel-sage ring-offset-4 ring-offset-off-white scale-[1.02] rounded-sm" : ""
        }`}
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
