"use client";

import { useRef } from "react";
import type { PhotoSlot } from "@/lib/types";
import type { CellDragProps } from "./useDragDrop";

interface PhotoCellProps {
  slot: PhotoSlot;
  onFileSelected: (slotIndex: number, file: File) => void;
  onOpenZoomPan: (slotIndex: number) => void;
  dragProps: CellDragProps;
  isDragSource: boolean;
  isDragOver: boolean;
}

export function PhotoCell({
  slot,
  onFileSelected,
  onOpenZoomPan,
  dragProps,
  isDragSource,
  isDragOver,
}: PhotoCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    // Don't open zoom if we just finished a drag
    if (slot.previewUrl) {
      onOpenZoomPan(slot.slotIndex);
    } else {
      inputRef.current?.click();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(slot.slotIndex, file);
    e.target.value = "";
  }

  return (
    <div
      data-slot-index={slot.slotIndex}
      className="aspect-square bg-cream overflow-hidden cursor-pointer select-none relative group"
      onClick={handleClick}
      style={{
        opacity: isDragSource ? 0.4 : 1,
        transition: "opacity 150ms ease, box-shadow 150ms ease",
        boxShadow: isDragOver
          ? "inset 0 0 0 2px #2C2C2C"
          : "none",
      }}
      draggable={dragProps.draggable}
      onDragStart={dragProps.onDragStart}
      onDragEnd={dragProps.onDragEnd}
      onDragOver={dragProps.onDragOver}
      onDragEnter={dragProps.onDragEnter}
      onDragLeave={dragProps.onDragLeave}
      onDrop={dragProps.onDrop}
      onTouchStart={dragProps.onTouchStart}
      onTouchMove={dragProps.onTouchMove}
      onTouchEnd={dragProps.onTouchEnd}
    >
      {/* Drop highlight overlay */}
      {isDragOver && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "rgba(213, 232, 213, 0.35)",
          }}
        />
      )}

      {slot.previewUrl ? (
        <>
          <img
            src={slot.previewUrl}
            alt=""
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
            style={{
              transform: `scale(${slot.zoom}) translate(${slot.panX}%, ${slot.panY}%)`,
              transformOrigin: "center center",
            }}
          />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-off-white text-xs bg-charcoal/60 px-2 py-1 rounded-md">
              Tap to adjust
            </span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted/50 hover:text-muted transition-colors">
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-xs font-medium hidden sm:block">Add photo</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
