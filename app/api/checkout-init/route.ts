import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { iyzico } from "@/lib/iyzico";
import Iyzipay from "iyzipay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutFormInitializeResult = Iyzipay.CheckoutFormInitialResult & {
  errorMessage?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
}

export async function GET() {
  return NextResponse.json({ message: "Iyzico API is working" });
}

export async function POST(request: NextRequest) {
  console.log(">>> CHECKOUT-INIT POST HIT <<<");
  const body = await request.json();
  const { orderId } = body;
  console.log("POST /api/checkout-init hit with orderId:", orderId);
  try {
    const supabase = await createClient();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch Order with items and profile
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        ),
        profiles:user_id (*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // In Supabase, if the relationship is N-to-1, it might come back as an object or a single-element array.
    const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
    const orderItems = Array.isArray(order.order_items) ? order.order_items : [order.order_items];
    const orderItem = orderItems[0];
    const product = orderItem?.products;
    const address = profile?.address_json;

    if (!profile || !product || !address) {
      console.error("Missing order details:", { 
        hasProfile: !!profile, 
        hasProduct: !!product, 
        hasAddress: !!address 
      });
      return NextResponse.json({ error: "Sipariş detayları eksik (Adres veya Ürün bilgisi bulunamadı)" }, { status: 400 });
    }

    // Ensure total is a string with 2 decimals for Iyzico
    const formattedPrice = Number(order.total).toFixed(2);

    // 2. Prepare Iyzico Request
    const requestPayload = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: order.id,
      price: formattedPrice,
      paidPrice: formattedPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: order.id,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/checkout-callback`, // TODO: Buraya ngrok adresi eklenecek
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: user.id,
        name: profile.full_name?.split(" ")[0] || "Müşteri",
        surname: profile.full_name?.split(" ").slice(1).join(" ") || "Soyadı",
        gsmNumber: "+905350000000",
        email: user.email || "musteri@example.com",
        identityNumber: "74455555555",
        lastLoginDate: "2023-10-05 12:43:35",
        registrationDate: "2023-04-21 15:12:09",
        registrationAddress: address.line1 || "Adres bilgisi yok",
        ip: "85.34.78.112",
        city: address.city || "Istanbul",
        country: "Turkey",
        zipCode: address.postcode || "34000",
      },
      shippingAddress: {
        contactName: profile.full_name || "Müşteri",
        city: address.city || "Istanbul",
        country: "Turkey",
        address: address.line1 || "Adres bilgisi yok",
        zipCode: address.postcode || "34000",
      },
      billingAddress: {
        contactName: profile.full_name || "Müşteri",
        city: address.city || "Istanbul",
        country: "Turkey",
        address: address.line1 || "Adres bilgisi yok",
        zipCode: address.postcode || "34000",
      },
      basketItems: [
        {
          id: product.id,
          name: product.name,
          category1: "Poster",
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price: formattedPrice,
        },
      ],
    } satisfies Record<string, unknown>;

    const iyzicoResult = await new Promise<CheckoutFormInitializeResult>((resolve, reject) => {
      iyzico.checkoutFormInitialize.create(
        requestPayload as unknown as Iyzipay.ThreeDSInitializePaymentRequestData,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    if (iyzicoResult.status !== "success") {
      console.error("Iyzico Error Response:", iyzicoResult);
      return NextResponse.json(
        { error: iyzicoResult?.errorMessage || "Ödeme sistemi başlatılamadı" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutFormContent: iyzicoResult.checkoutFormContent,
      token: iyzicoResult.token,
    });
  } catch (err: unknown) {
    console.error("Checkout initialization crash:", err);
    return NextResponse.json({ error: "Sunucu hatası: " + getErrorMessage(err) }, { status: 500 });
  }
}
