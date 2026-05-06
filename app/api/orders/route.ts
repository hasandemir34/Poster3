import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateOrderPayload, CreateOrderResponse } from "@/lib/types";

const FRAME_PRICE = 100;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json<CreateOrderResponse>(
      { orderId: "", error: "Unauthorized" },
      { status: 401 }
    );
  }

  let payload: CreateOrderPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<CreateOrderResponse>(
      { orderId: "", error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { productId, printReadyUrl, addressJson, frameOption } = payload;

  if (!productId || !printReadyUrl || !addressJson) {
    return NextResponse.json<CreateOrderResponse>(
      { orderId: "", error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("price")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json<CreateOrderResponse>(
      { orderId: "", error: "Product not found" },
      { status: 404 }
    );
  }

  await supabase
    .from("profiles")
    .upsert({ id: user.id, address_json: addressJson }, { onConflict: "id" });

  const total = product.price + (frameOption && frameOption !== "none" ? FRAME_PRICE : 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, total, status: "pending" })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json<CreateOrderResponse>(
      { orderId: "", error: "Failed to create order" },
      { status: 500 }
    );
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: productId,
    print_ready_url: printReadyUrl,
  });

  if (itemError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json<CreateOrderResponse>(
      { orderId: "", error: "Failed to create order item" },
      { status: 500 }
    );
  }

  return NextResponse.json<CreateOrderResponse>(
    { orderId: order.id },
    { status: 201 }
  );
}
