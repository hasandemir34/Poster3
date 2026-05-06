import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditorShell } from "./EditorShell";
import type { Product } from "@/lib/types";

interface EditorPageProps {
  searchParams: Promise<{ product?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { product: productId } = await searchParams;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("price", { ascending: false });

  if (!products || products.length === 0) {
    redirect("/");
  }

  const selectedProduct =
    (productId &&
      (products as Product[]).find((p: Product) => p.id === productId)) ||
    (products as Product[])[0];

  return (
    <main className="min-h-screen bg-off-white">
      <EditorShell
        product={selectedProduct as Product}
        allProducts={products as Product[]}
      />
    </main>
  );
}
