import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { Footer } from "@/components/ui/Footer";
import type { OrderWithItems } from "@/lib/types";

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-off-white pb-20">
      <Navbar backHref="/" backLabel="Ana Sayfa" />

      <div className="max-w-xl mx-auto px-6 mt-10">
        <h1 className="text-2xl font-semibold text-charcoal mb-8 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Siparişlerim
        </h1>
        <OrderHistory orders={(orders as unknown as OrderWithItems[]) || []} />
      </div>
      <Footer />
    </main>
  );
}
