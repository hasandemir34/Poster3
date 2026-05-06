"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { PhotoSlot } from "@/lib/types";

interface ZoomPanModalProps {
  slot: PhotoSlot | null;
  onClose: () => void;
  onSave: (slotIndex: number, zoom: number, panX: number, panY: number) => void;
}

export function ZoomPanModal({ slot, onClose, onSave }: ZoomPanModalProps) {
  const [zoom, setZoom] = useState(slot?.zoom ?? 1);
  const [panX, setPanX] = useState(slot?.panX ?? 0);
  const [panY, setPanY] = useState(slot?.panY ?? 0);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    lastPanX: number;
    lastPanY: number;
  } | null>(null);
  const pinchRef = useRef<{
    startDist: number;
    startZoom: number;
  } | null>(null);

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
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPanX(dragRef.current.lastPanX + dx / zoom);
    setPanY(dragRef.current.lastPanY + dy / zoom);
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.002)));
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (!pinchRef.current) {
        pinchRef.current = { startDist: dist, startZoom: zoom };
      } else {
        const scale = dist / pinchRef.current.startDist;
        setZoom(Math.min(3, Math.max(1, pinchRef.current.startZoom * scale)));
      }
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

  // Sync local state when a new slot opens
  const prevSlotIndex = useRef<number | null>(null);
  if (slot && slot.slotIndex !== prevSlotIndex.current) {
    prevSlotIndex.current = slot.slotIndex;
    setZoom(slot.zoom);
    setPanX(slot.panX);
    setPanY(slot.panY);
  }

  return (
    <Modal open={!!slot} onClose={onClose} title="Adjust Photo">
      {slot?.previewUrl && (
        <div className="space-y-4">
          <div
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
                transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                transformOrigin: "center center",
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted w-10">Zoom</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-charcoal"
            />
            <span className="text-xs text-muted w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <p className="text-xs text-center text-muted">
            Drag to pan · Pinch or scroll to zoom
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
