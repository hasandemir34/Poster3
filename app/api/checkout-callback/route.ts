import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { iyzico } from "@/lib/iyzico";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token") as string;

  if (!token) {
    return NextResponse.redirect(new URL("/?payment=error", request.url));
  }

  const result: any = await new Promise((resolve) => {
    iyzico.checkoutForm.retrieve({ token }, (err: any, result: any) => {
      resolve(result);
    });
  });

  const supabase = await createClient();
  const orderId = result.basketId;

  if (result.status === "success" && result.paymentStatus === "SUCCESS") {
    // Update order to 'paid'
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    return NextResponse.redirect(new URL(`/?payment=success&orderId=${orderId}`, request.url));
  } else {
    // Update order to 'pending' or leave it
    return NextResponse.redirect(
      new URL(`/?payment=failed&reason=${result.errorMessage || "Payment failed"}`, request.url)
    );
  }
}
