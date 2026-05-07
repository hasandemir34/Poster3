"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { PhotoSlot } from "@/lib/types";

interface ZoomPanModalProps {
  slot: PhotoSlot | null;
  onClose: () => void;
  onSave: (slotIndex: number, zoom: number, panX: number, panY: number) => void;
  onRemove: (slotIndex: number) => void;
}

export function ZoomPanModal({ slot, onClose, onSave, onRemove }: ZoomPanModalProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    lastPanX: number;
    lastPanY: number;
  } | null>(null);
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);

  function clamp(px: number, py: number, z: number): [number, number] {
    const limit = z <= 1 ? 0 : ((z - 1) / (2 * z)) * 100;
    return [
      Math.max(-limit, Math.min(limit, px)),
      Math.max(-limit, Math.min(limit, py)),
    ];
  }

  useEffect(() => {
    if (slot) {
      setZoom(slot.zoom);
      setPanX(slot.panX);
      setPanY(slot.panY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot?.slotIndex]);

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastPanX: panX,
      lastPanY: panY,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const containerSize = containerRef.current?.clientWidth ?? 400;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const [cx, cy] = clamp(
      dragRef.current.lastPanX + (dx * 100) / (containerSize * zoom),
      dragRef.current.lastPanY + (dy * 100) / (containerSize * zoom),
      zoom
    );
    setPanX(cx);
    setPanY(cy);
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const newZoom = Math.min(3, Math.max(1, zoom - e.deltaY * 0.002));
    const [cx, cy] = clamp(panX, panY, newZoom);
    setZoom(newZoom);
    setPanX(cx);
    setPanY(cy);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    if (!pinchRef.current) {
      pinchRef.current = { startDist: dist, startZoom: zoom };
    } else {
      const newZoom = Math.min(3, Math.max(1, pinchRef.current.startZoom * (dist / pinchRef.current.startDist)));
      const [cx, cy] = clamp(panX, panY, newZoom);
      setZoom(newZoom);
      setPanX(cx);
      setPanY(cy);
    }
  }

  function handleTouchEnd() {
    pinchRef.current = null;
  }

  function handleSave() {
    if (!slot) return;
    onSave(slot.slotIndex, zoom, panX, panY);
    onClose();
  }

  function handleReset() {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }

  function handleRemove() {
    if (!slot) return;
    onRemove(slot.slotIndex);
    onClose();
  }

  return (
    <Modal open={!!slot} onClose={onClose} title="Fotoğrafı Ayarla">
      {slot?.previewUrl && (
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="w-full aspect-square bg-cream rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={slot.previewUrl}
              alt=""
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
              style={{
                transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
                transformOrigin: "center center",
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted w-10">Ölçek</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => {
                const newZoom = Number(e.target.value);
                const [cx, cy] = clamp(panX, panY, newZoom);
                setZoom(newZoom);
                setPanX(cx);
                setPanY(cy);
              }}
              className="flex-1 accent-charcoal"
            />
            <span className="text-xs text-muted w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <p className="text-xs text-center text-muted">
            Kaydırmak için sürükleyin · Yakınlaştırmak için kaydırın veya iki parmağınızla kıstırın
          </p>

          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Sıfırla
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Kaldır
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} className="flex-1">
              Uygula
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
