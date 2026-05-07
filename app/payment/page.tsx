import { createAdminClient } from "@/lib/supabase/admin";
import { PaytrFrame } from "./PaytrFrame";

interface PageProps {
  searchParams: { token?: string };
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const token = searchParams.token;

  if (!token) {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center">
        <p className="text-muted">Geçersiz ödeme bağlantısı.</p>
      </main>
    );
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("payment_token", token)
    .single();

  if (!order) {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center">
        <p className="text-muted">Ödeme formu bulunamadı.</p>
      </main>
    );
  }

  if (order.status === "paid") {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-charcoal">Bu sipariş zaten ödendi.</p>
          <a href="/" className="text-sm text-muted underline">Ana sayfaya dön</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <h1 className="text-xl font-semibold text-charcoal text-center mb-6">
          Güvenli Ödeme
        </h1>
        <PaytrFrame token={token} />
      </div>
    </main>
  );
}
