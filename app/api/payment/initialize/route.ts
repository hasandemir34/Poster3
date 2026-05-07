import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initPaytrPayment } from "@/lib/paytr";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let orderId: string;
  try {
    ({ orderId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, order_items(id, products(id, name))")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, address_json")
    .eq("id", user.id)
    .single();

  const fullName = profile?.full_name ?? user.email?.split("@")[0] ?? "Müşteri";

  const addr = profile?.address_json as {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
  } | null;

  const addressStr =
    [addr?.line1, addr?.line2, addr?.city].filter(Boolean).join(", ") ||
    "Adres belirtilmedi";

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  const rawTotal = order.total as number | null;
  if (!rawTotal || rawTotal <= 0) {
    return NextResponse.json({ error: "Sipariş tutarı geçersiz" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (order as any).order_items ?? [];
  const productName = items[0]?.products?.name ?? "Framely Poster";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  let paytrResult;
  try {
    paytrResult = await initPaytrPayment({
      merchantOid: order.id,
      email: user.email!,
      paymentAmount: Math.round(rawTotal * 100), // kuruş
      userIp: ip,
      userName: fullName,
      userAddress: addressStr,
      basketItems: [
        {
          name: productName,
          price: rawTotal.toFixed(2),
          quantity: 1,
        },
      ],
      okUrl: `${baseUrl}/payment/result?status=success&orderId=${order.id}`,
      failUrl: `${baseUrl}/payment/result?status=fail`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("paytr exception:", msg);
    return NextResponse.json(
      { error: `Ödeme servisiyle bağlantı kurulamadı: ${msg}` },
      { status: 502 }
    );
  }

  if (paytrResult.status !== "success" || !paytrResult.token) {
    console.error("paytr error:", paytrResult);
    return NextResponse.json(
      { error: paytrResult.reason ?? "Ödeme başlatılamadı" },
      { status: 502 }
    );
  }

  await supabase
    .from("orders")
    .update({ payment_token: paytrResult.token })
    .eq("id", order.id);

  return NextResponse.json({ token: paytrResult.token });
}
