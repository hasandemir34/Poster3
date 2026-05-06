import { createClient } from "@/lib/supabase/server";
import { EditorShell } from "./EditorShell";
import type { Product, FrameOption } from "@/lib/types";

const FALLBACK_PRODUCTS: Product[] = [
  { id: "classic", name: "Classic", price: 50, photo_count: 50, cols: 5 },
  { id: "mini", name: "Mini", price: 35, photo_count: 9, cols: 3 },
];

interface EditorPageProps {
  searchParams: Promise<{ product?: string; frame?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { product: productId, frame } = await searchParams;
  const frameOption: FrameOption =
    frame === "black" || frame === "white" ? frame : "none";
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
      <EditorShell product={selectedProduct} frameOption={frameOption} />
    </main>
  );
}
