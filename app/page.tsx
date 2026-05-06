import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("price", { ascending: false });

  const products: Product[] = data && data.length > 0 ? (data as Product[]) : [];

  return (
    <main className="min-h-screen bg-off-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-2xl font-semibold tracking-tight text-charcoal">
          Framely
        </span>
        <div className="flex gap-3">
          {user ? (
            <>
              <Link
                href="/editor"
                className="px-5 py-2 rounded-lg text-charcoal text-sm font-medium hover:bg-cream transition-colors"
              >
                Editörü Aç
              </Link>
              <LogoutButton />
              <Link
                href="/profile"
                className="px-5 py-2 rounded-lg bg-charcoal text-off-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profilim
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 rounded-lg text-charcoal text-sm font-medium hover:bg-cream transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/editor"
                className="px-5 py-2 rounded-lg bg-charcoal text-off-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Hemen Başla
              </Link>
            </>
          )}
        </div>
      </nav>

      {products.length > 0 ? (
        <ProductShowcase products={products} />
      ) : (
        <div className="text-center py-20 text-muted">Ürün bulunamadı.</div>
      )}
    </main>
  );
}
