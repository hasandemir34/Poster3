"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, PhotoSlot } from "@/lib/types";
import { PosterGrid } from "@/components/editor/PosterGrid";
import { OrderButton } from "@/components/editor/OrderButton";

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
  allProducts: Product[];
}

export function EditorShell({ product, allProducts }: EditorShellProps) {
  const router = useRouter();
  const [slots, setSlots] = useState<PhotoSlot[]>(() =>
    initSlots(product.photo_count)
  );

  function handleProductSwitch(p: Product) {
    setSlots(initSlots(p.photo_count));
    router.push(`/editor?product=${p.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-xl font-semibold text-charcoal">
          Framely
        </Link>
        <div className="flex gap-2">
          {allProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProductSwitch(p)}
              className={[
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                p.id === product.id
                  ? "bg-charcoal text-off-white"
                  : "bg-cream text-charcoal hover:bg-pastel-sage/40",
              ].join(" ")}
            >
              {p.name === 'Classic 50' ? 'Klasik 50' : p.name === 'Mini 35' ? 'Mini 35' : p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <PosterGrid
          slots={slots}
          onSlotsChange={setSlots}
        />
      </div>

      <div className="flex justify-center">
        <OrderButton product={product} slots={slots} />
      </div>
    </div>
  );
}
