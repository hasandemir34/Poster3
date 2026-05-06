import type { PhotoSlot } from "@/lib/types";

const CANVAS_SIZE = 2000;
const CELL_GAP = 2;

export async function generatePosterPng(
  slots: PhotoSlot[],
  cols: number,
  rows: number
): Promise<Blob> {
  const canvas = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("OffscreenCanvas 2D context unavailable");

  ctx.fillStyle = "#F5F0E8";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const totalGapW = CELL_GAP * (cols - 1);
  const totalGapH = CELL_GAP * (rows - 1);
  const cellW = (CANVAS_SIZE - totalGapW) / cols;
  const cellH = (CANVAS_SIZE - totalGapH) / rows;

  await Promise.all(
    slots.map(async (slot, index) => {
      if (!slot.previewUrl) return;

      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * (cellW + CELL_GAP);
      const y = row * (cellH + CELL_GAP);

      const img = await loadImageBitmap(slot.previewUrl);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cellW, cellH);
      ctx.clip();

      const coverScale = Math.max(cellW / img.width, cellH / img.height);
      const drawW = img.width * coverScale * slot.zoom;
      const drawH = img.height * coverScale * slot.zoom;
      const drawX = x + (cellW - drawW) / 2 + slot.panX * coverScale;
      const drawY = y + (cellH - drawH) / 2 + slot.panY * coverScale;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
      img.close();
    })
  );

  return canvas.convertToBlob({ type: "image/png", quality: 1.0 });
}

async function loadImageBitmap(url: string): Promise<ImageBitmap> {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob);
}
