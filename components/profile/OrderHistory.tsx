import type { OrderWithItems } from "@/lib/types";

interface OrderHistoryProps {
  orders: OrderWithItems[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
        <div className="bg-cream w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-muted font-medium">Henüz bir siparişiniz bulunmuyor.</p>
        <p className="text-sm text-muted/60 mt-1">İlk posterinizi tasarlamaya hemen başlayabilirsiniz!</p>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    paid: "bg-blue-50 text-blue-600 border-blue-100",
    printing: "bg-indigo-50 text-indigo-600 border-indigo-100",
    shipped: "bg-purple-50 text-purple-600 border-purple-100",
    delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  const statusLabels = {
    pending: "Ödeme Bekleniyor",
    paid: "Ödendi",
    printing: "Hazırlanıyor",
    shipped: "Kargoya Verildi",
    delivered: "Teslim Edildi",
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-charcoal/10 transition-colors"
        >
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Sipariş Tarihi
                </p>
                <p className="text-sm font-semibold text-charcoal">
                  {new Date(order.created_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Toplam Tutar
                </p>
                <p className="text-sm font-semibold text-charcoal">
                  ₺{order.total.toLocaleString("tr-TR")}
                </p>
              </div>
              <div>
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-t border-gray-50">
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal">{item.products.name}</h4>
                    <p className="text-xs text-muted mt-1">Ürün Kodu: {item.products.id.slice(0, 8)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
            <span className="text-[10px] text-muted font-medium uppercase tracking-tight">
              Sipariş No: #{order.id.slice(0, 8)}
            </span>
            <button className="text-[10px] font-bold text-charcoal uppercase tracking-widest hover:underline">
              Detayları Görüntüle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
