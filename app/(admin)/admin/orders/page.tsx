import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import OrdersClient from "./OrdersClient";
import type { AddressJson } from "@/lib/types";

const ADMIN_EMAIL = "demirhasan0108@gmail.com";

export interface AdminOrder {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  user_email: string;
  customer_name: string | null;
  address: AddressJson | null;
  preset_name: string;
  print_ready_url: string | null;
}

export default async function AdminOrdersPage() {
  // Server-side auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/");

  const admin = createAdminClient();

  // Fetch all orders with nested profile + order_items → products
  const { data: raw } = await admin
    .from("orders")
    .select(
      `id, user_id, total, status, created_at,
       profiles(full_name, address_json),
       order_items(id, print_ready_url, products(name))`
    )
    .order("created_at", { ascending: false });

  // Fetch auth emails via admin API
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = Object.fromEntries(
    (usersData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  // Normalise into flat AdminOrder shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: AdminOrder[] = (raw ?? []).map((o: any) => ({
    id: o.id,
    user_id: o.user_id,
    total: o.total,
    status: o.status,
    created_at: o.created_at,
    user_email: emailMap[o.user_id] ?? "",
    customer_name: o.profiles?.full_name ?? null,
    address: o.profiles?.address_json ?? null,
    preset_name: o.order_items?.[0]?.products?.name ?? "—",
    print_ready_url: o.order_items?.[0]?.print_ready_url ?? null,
  }));

  // Stats
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="min-h-screen bg-off-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-charcoal">Admin — Siparişler</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Toplam Sipariş" value={String(totalOrders)} />
          <StatCard label="Beklemede" value={String(pendingCount)} />
          <StatCard
            label="Toplam Gelir"
            value={`₺${totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
          />
        </div>

        {/* Table */}
        <OrdersClient orders={orders} />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-charcoal mt-1">{value}</p>
    </div>
  );
}
