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
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal/60 p-1.5 rounded-full text-off-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted/30 hover:text-muted/60 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
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
