import type { PhotoSlot } from "@/lib/types";

/**
 * Renders the entire poster grid into a high-resolution PNG blob.
 * Target: ~300 DPI equivalent.
 * We maximize resolution by keeping the largest dimension around 8000px,
 * which is a safe limit for most modern browsers/devices.
 */
const MAX_SAFE_DIMENSION = 3000;
const CELL_GAP = 4;

export async function generatePosterPng(
  slots: PhotoSlot[],
  cols: number,
  rows: number
): Promise<Blob> {
  const maxCells = Math.max(cols, rows);
  const cellSize = Math.floor(
    (MAX_SAFE_DIMENSION - (maxCells - 1) * CELL_GAP) / maxCells
  );

  const width = cols * cellSize + (cols - 1) * CELL_GAP;
  const height = rows * cellSize + (rows - 1) * CELL_GAP;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("OffscreenCanvas 2D context unavailable");

  // Background
  ctx.fillStyle = "#F5F0E8"; // off-white
  ctx.fillRect(0, 0, width, height);

  // Render slots
  await Promise.all(
    slots.map(async (slot, index) => {
      if (!slot.previewUrl) return;

      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * (cellSize + CELL_GAP);
      const y = row * (cellSize + CELL_GAP);

      try {
        const img = await loadImageBitmap(slot.previewUrl);

        ctx.save();
        // Clip to cell area
        ctx.beginPath();
        ctx.rect(x, y, cellSize, cellSize);
        ctx.clip();

        // Calculate "cover" scale
        const coverScale = Math.max(
          cellSize / img.width,
          cellSize / img.height
        );
        
        const baseW = img.width * coverScale;
        const baseH = img.height * coverScale;

        const drawW = baseW * slot.zoom;
        const drawH = baseH * slot.zoom;

        const offsetX = (slot.panX / 100) * baseW * slot.zoom;
        const offsetY = (slot.panY / 100) * baseH * slot.zoom;

        const drawX = x + (cellSize - drawW) / 2 + offsetX;
        const drawY = y + (cellSize - drawH) / 2 + offsetY;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
        img.close();
      } catch (err) {
        console.error(`Failed to load image for slot ${index}:`, err);
      }
    })
  );

  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.95 });
}

async function loadImageBitmap(url: string): Promise<ImageBitmap> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const blob = await res.blob();
  return createImageBitmap(blob);
}
