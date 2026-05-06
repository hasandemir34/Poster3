"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, PhotoSlot } from "@/lib/types";
import { PosterGrid } from "@/components/editor/PosterGrid";
import { OrderButton } from "@/components/editor/OrderButton";
import { LogoutButton } from "@/components/ui/LogoutButton";

function initSlots(count: number): PhotoSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    slotIndex: i,
    file: null,
    previewUrl: null,
    zoom: 1,
    panX: 0,
    panY: 0,
  }));
}

interface EditorShellProps {
  product: Product;
  isLoggedIn?: boolean;
}

export function EditorShell({
  product,
  isLoggedIn,
}: EditorShellProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slots, setSlots] = useState<PhotoSlot[]>(() =>
    initSlots(product.photo_count)
  );
  const [isZoomed, setIsZoomed] = useState(false);

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newSlots = [...slots];
    let fileIndex = 0;

    // Fill the first available empty cells
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

    setSlots(newSlots);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleShuffle = () => {
    // Get all photos from current slots
    const photos = slots
      .filter((s) => s.previewUrl)
      .map((s) => ({
        file: s.file,
        previewUrl: s.previewUrl,
        zoom: s.zoom,
        panX: s.panX,
        panY: s.panY,
      }));

    if (photos.length === 0) return;

    // Get all possible indices and shuffle them
    const allIndices = Array.from({ length: slots.length }, (_, i) => i);
    const shuffledIndices = [...allIndices].sort(() => Math.random() - 0.5);

    // Create new slots, all empty initially
    const newSlots = initSlots(slots.length);

    // Place photos into the first N shuffled indices
    photos.forEach((photo, i) => {
      const targetIdx = shuffledIndices[i];
      newSlots[targetIdx] = {
        ...newSlots[targetIdx],
        ...photo,
      };
    });

    setSlots(newSlots);
  };

  return (
    <div className={`flex flex-col max-w-4xl mx-auto px-4 py-2 ${isZoomed ? "min-h-screen" : "h-[100dvh] overflow-hidden"}`}>
      <div className="flex-none flex items-center justify-between mb-2">
        <Link href="/" className="text-xl font-semibold text-charcoal">
          Framely
        </Link>
        <div className="flex gap-2 items-center">
          {isLoggedIn && (
            <>
              <LogoutButton />
              <Link
                href="/profile"
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-charcoal text-off-white hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profilim
              </Link>
            </>
          )}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? "Ekrana Sığdır" : "Yakınlaştır"}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-cream text-charcoal hover:bg-pastel-sage/40 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isZoomed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              )}
            </svg>
            {isZoomed ? "Sığdır" : "Yakınlaştır"}
          </button>
          <button
            onClick={handleShuffle}
            title="Fotoğrafları Karıştır"
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-cream text-charcoal hover:bg-pastel-sage/40 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Karıştır
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-pastel-sage text-charcoal hover:bg-pastel-sage/80 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Toplu Yükle
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleBulkUpload}
          />
        </div>
      </div>

      {isZoomed ? (
        <div className="flex-none py-10 flex justify-center">
          <div style={{ height: "1200px" }}>
            <PosterGrid slots={slots} onSlotsChange={setSlots} isZoomed={true} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
          <div className="h-full w-full flex items-center justify-center">
            <PosterGrid slots={slots} onSlotsChange={setSlots} isZoomed={false} />
          </div>
        </div>
      )}

      <div className={`flex-none pt-2 pb-1 ${isZoomed ? "sticky bottom-0 bg-off-white/80 backdrop-blur-sm -mx-4 px-4 py-4 border-t border-gray-100 z-50" : ""}`}>
        <div className="flex justify-center">
          <OrderButton product={product} slots={slots} />
        </div>
      </div>
    </div>
  );
}
