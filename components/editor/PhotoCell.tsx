"use client";

import { useRef } from "react";
import type { PhotoSlot } from "@/lib/types";

interface PhotoCellProps {
  slot: PhotoSlot;
  onFileSelected: (slotIndex: number, file: File) => void;
  onOpenZoomPan: (slotIndex: number) => void;
}

export function PhotoCell({ slot, onFileSelected, onOpenZoomPan }: PhotoCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
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
      className="aspect-square bg-cream overflow-hidden cursor-pointer select-none relative group"
      onClick={handleClick}
    >
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
