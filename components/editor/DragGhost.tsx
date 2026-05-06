"use client";

import type { GhostInfo } from "@/components/editor/useDragDrop";

interface DragGhostProps {
  ghostInfo: GhostInfo | null;
}

/**
 * Renders a semi-transparent floating thumbnail that follows the cursor/finger
 * during a drag operation.
 */
export function DragGhost({ ghostInfo }: DragGhostProps) {
  if (!ghostInfo) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: ghostInfo.x,
        top: ghostInfo.y,
        width: 72,
        height: 72,
        transform: "translate(-50%, -50%)",
        opacity: 0.75,
        pointerEvents: "none",
        zIndex: 9999,
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      <img
        src={ghostInfo.previewUrl}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
