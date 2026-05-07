"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product, FrameOption } from "@/lib/types";

interface ProductShowcaseProps {
  products: Product[];
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [frameOption, setFrameOption] = useState<"none" | "black" | "white">("none");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = [
    "/hero_poster.png",
    "/poster_detail.png",
    "/poster_lifestyle.png",
  ];

  const basePrice = selectedProduct.price;
  const framePrice = frameOption !== "none" ? 100 : 0;
  const totalPrice = basePrice + framePrice;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      {/* Left: Product Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group">
          <img
            src={images[activeImageIndex]}
            alt="Grid Poster Showcase"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          
          {/* Navigation Arrows */}
          <button 
            onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-charcoal shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-charcoal shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeImageIndex === idx ? "border-charcoal shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt={`Gallery thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Right: Product Details */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} className="w-4 h-4 text-charcoal fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-muted ml-2">4.9 (198 değerlendirme)</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-charcoal mb-4">
          Grid Poster
        </h1>

        <p className="text-muted leading-relaxed mb-8">
          Kamera rulonuzu veya Instagram fotoğraflarınızı bir sanat eserine dönüştürün. 
          Posteriniz, büyük ve güzel bir ızgara şeklinde düzenlenmiş onlarca fotoğrafınızın 
          arşiv kalitesinde bir baskısıdır.
        </p>

        <ul className="text-sm text-muted space-y-2 mb-10">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-charcoal/30" />
            Premium fotoğraf kağıdına profesyonel baskı
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-charcoal/30" />
            {selectedProduct.photo_count} fotoğraf seçeneği
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-charcoal/30" />
            Siyah veya beyaz opsiyonel ahşap çerçeve
          </li>
        </ul>

        {/* Size Selection */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-4">Boyut</h3>
          <div className="flex flex-wrap gap-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedProduct.id === p.id
                    ? "bg-charcoal text-white shadow-lift"
                    : "bg-cream text-charcoal hover:bg-cream/80 border border-transparent hover:border-charcoal/10"
                }`}
              >
                {p.name === "Classic 50" ? "Klasik 50" : p.name === "Mini 35" ? "Mini 35" : p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Selection */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-4">Görünüm</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { id: "none", label: "Çerçevesiz" },
              { id: "black", label: "Siyah Çerçeve" },
              { id: "white", label: "Beyaz Çerçeve" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFrameOption(option.id as FrameOption)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  frameOption === option.id
                    ? "bg-charcoal text-white shadow-lift"
                    : "bg-cream text-charcoal hover:bg-cream/80 border border-transparent hover:border-charcoal/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-end gap-6 pt-6 border-t border-gray-100">
          <div>
            <span className="block text-xs text-muted uppercase tracking-widest mb-1">Toplam Fiyat</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-charcoal">{totalPrice} TL</span>
              {frameOption !== "none" && (
                <span className="text-sm text-muted line-through">{basePrice} TL</span>
              )}
            </div>
          </div>
          <Link
            href={`/editor?product=${selectedProduct.id}&frame=${frameOption}`}
            className="flex-1 bg-charcoal text-off-white py-4 rounded-xl font-medium text-center hover:opacity-90 transition-opacity shadow-lift"
          >
            Hemen Başla
          </Link>
        </div>

        {/* Accordions (Placeholders) */}
        <div className="mt-12 space-y-4 border-t border-gray-100 pt-8">
          <details className="group cursor-pointer">
            <summary className="flex items-center justify-between font-medium text-charcoal list-none">
              Ürün Detayları
              <span className="transition-transform group-open:rotate-180">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-4 text-sm text-muted leading-relaxed">
              Posterlerimiz 250 gsm arşiv kalitesinde mat fotoğraf kağıdına basılmaktadır. 
              Çerçevelerimiz gerçek ahşaptır ve koruyucu pleksi cam ile gelir.
            </div>
          </details>
          <details className="group cursor-pointer">
            <summary className="flex items-center justify-between font-medium text-charcoal list-none">
              Üretim & Gönderim
              <span className="transition-transform group-open:rotate-180">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-4 text-sm text-muted leading-relaxed">
              Tüm siparişler 2-3 iş günü içinde hazırlanır ve MNG Kargo ile Türkiye&apos;nin her yerine ücretsiz gönderilir.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
