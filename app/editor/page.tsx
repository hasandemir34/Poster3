import { createClient } from "@/lib/supabase/server";
import { EditorShell } from "./EditorShell";
import type { Product } from "@/lib/types";

const FALLBACK_PRODUCTS: Product[] = [
  { id: "classic", name: "Classic", price: 50, photo_count: 50 },
  { id: "mini", name: "Mini", price: 35, photo_count: 35 },
];

interface EditorPageProps {
  searchParams: Promise<{ product?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { product: productId } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("price", { ascending: false });

  const products: Product[] =
    data && data.length > 0 ? (data as Product[]) : FALLBACK_PRODUCTS;

  const selectedProduct =
    (productId && products.find((p) => p.id === productId)) || products[0];

  return (
    <main className="bg-off-white">
      <EditorShell product={selectedProduct} />
    </main>
  );
}
