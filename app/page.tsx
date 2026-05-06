import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/Navbar";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { Footer } from "@/components/ui/Footer";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("price", { ascending: false });

  const products: Product[] = data && data.length > 0 ? (data as Product[]) : [];

  return (
    <main className="min-h-screen bg-off-white">
      <Navbar />
      {products.length > 0 ? (
        <ProductShowcase products={products} />
      ) : (
        <div className="text-center py-20 text-muted">Ürün bulunamadı.</div>
      )}
      <Footer />
    </main>
  );
}
