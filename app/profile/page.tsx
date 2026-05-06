import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "@/app/profile/ProfileForm";
import { OrderHistory } from "@/components/profile/OrderHistory";
import type { Profile, OrderWithItems } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto mb-10">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-charcoal hover:opacity-80 transition-opacity">
          Framely
        </Link>
        <Link 
          href="/"
          className="px-5 py-2 rounded-lg text-charcoal text-sm font-medium hover:bg-cream transition-colors"
        >
          Ana Sayfa
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-charcoal">Profilim</h1>
          <p className="text-muted mt-2">
            Hesap bilgilerinizi ve sipariş geçmişinizi buradan takip edebilirsiniz.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-6 flex items-center gap-2">
              <svg className="w-5 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Hesap Bilgileri
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <ProfileForm profile={profile as Profile} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-charcoal mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Geçmiş Siparişlerim
            </h2>
            <OrderHistory orders={(orders as unknown as OrderWithItems[]) || []} />
          </section>
        </div>
      </div>
    </main>
  );
}
