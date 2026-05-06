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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
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
            onClick={() => fileInputRef.current?.click()}
            className="mr-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-pastel-sage text-charcoal hover:bg-pastel-sage/80 transition-colors flex items-center gap-2"
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

      <div className="flex justify-center mb-8">
        <PosterGrid slots={slots} onSlotsChange={setSlots} />
      </div>

      <div className="flex justify-center">
        <OrderButton product={product} slots={slots} />
      </div>
    </div>
  );
}
