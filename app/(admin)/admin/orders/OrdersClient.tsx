"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { updateOrderStatus } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { AdminOrder } from "./page";
import type { AddressJson } from "@/lib/types";

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "printing",
  "shipped",
  "delivered",
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  paid: "Ödendi",
  printing: "Baskıda",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
};

const STATUS_BG: Record<string, string> = {
  pending: "#FEF9C3",
  paid: "#D5E2F2",
  printing: "#EDE9FE",
  shipped: "#DBEAFE",
  delivered: "#D5E8D5",
};
const STATUS_FG: Record<string, string> = {
  pending: "#854D0E",
  paid: "#1E3A5F",
  printing: "#4C1D95",
  shipped: "#1E40AF",
  delivered: "#14532D",
};

function formatAddress(addr: AddressJson) {
  return [addr.line1, addr.line2, addr.city, addr.state, addr.postcode, addr.country]
    .filter(Boolean)
    .join(", ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersClient({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(orders.map((o) => [o.id, o.status]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          setNewOrderAlert(true);
          router.refresh();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function handleStatusChange(orderId: string, next: string) {
    const prev = statuses[orderId];
    setStatuses((s) => ({ ...s, [orderId]: next }));
    setSavingId(orderId);
    try {
      await updateOrderStatus(orderId, next);
    } catch {
      setStatuses((s) => ({ ...s, [orderId]: prev }));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDownload(order: AdminOrder) {
    if (!order.print_ready_url) return;
    setDownloadingId(order.id);
    try {
      const res = await fetch(order.print_ready_url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (order.customer_name ?? order.user_email.split("@")[0]).replace(
        /\s+/g,
        "_"
      );
      a.href = blobUrl;
      a.download = `Order_${order.id.slice(0, 8)}_${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <>
      {newOrderAlert && (
        <div className="flex items-center justify-between bg-pastel-sage text-charcoal px-5 py-3 rounded-xl shadow-subtle text-sm font-medium mb-2">
          <span>🔔 Yeni sipariş geldi!</span>
          <button
            onClick={() => setNewOrderAlert(false)}
            className="text-xs text-muted hover:text-charcoal ml-4"
          >
            Kapat
          </button>
        </div>
      )}
    <div className="overflow-x-auto rounded-xl shadow-card bg-white">
      <table className="w-full text-sm text-charcoal">
        <thead>
          <tr className="border-b border-gray-100 text-muted text-xs uppercase tracking-wide">
            <th className="px-4 py-3 text-left font-medium">ID / Tarih</th>
            <th className="px-4 py-3 text-left font-medium">Müşteri</th>
            <th className="px-4 py-3 text-left font-medium">Ürün</th>
            <th className="px-4 py-3 text-left font-medium">Adres</th>
            <th className="px-4 py-3 text-left font-medium">Durum</th>
            <th className="px-4 py-3 text-left font-medium">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center text-muted">
                Henüz sipariş yok.
              </td>
            </tr>
          )}
          {orders.map((order) => {
            const status = statuses[order.id] ?? order.status;
            return (
              <tr
                key={order.id}
                className="border-b border-gray-50 hover:bg-cream transition-colors last:border-0"
              >
                {/* ID / Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-xs text-muted">
                    {order.id.slice(0, 8)}…
                  </span>
                  <br />
                  <span className="text-xs text-muted">{formatDate(order.created_at)}</span>
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                  {order.customer_name && (
                    <p className="font-medium leading-tight">{order.customer_name}</p>
                  )}
                  <p className="text-xs text-muted">{order.user_email}</p>
                </td>

                {/* Preset */}
                <td className="px-4 py-3 text-sm">{order.preset_name}</td>

                {/* Address */}
                <td className="px-4 py-3 max-w-[200px]">
                  {order.address ? (
                    <span className="text-xs text-charcoal leading-relaxed">
                      {formatAddress(order.address)}
                    </span>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={savingId === order.id}
                    className="text-xs rounded-lg px-2 py-1 border-0 outline-none cursor-pointer font-medium disabled:opacity-60"
                    style={{
                      backgroundColor: STATUS_BG[status] ?? "#F3F4F6",
                      color: STATUS_FG[status] ?? "#374151",
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDownload(order)}
                    disabled={!order.print_ready_url || downloadingId === order.id}
                    className="flex items-center gap-1.5 text-xs bg-charcoal text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download size={12} />
                    {downloadingId === order.id ? "…" : "İndir"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
