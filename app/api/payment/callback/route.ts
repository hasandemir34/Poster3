import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCallbackHash } from "@/lib/paytr";

export const runtime = "nodejs";

// PayTR sunucu bildirimi — tarayıcı yönlendirmesi değil
export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new NextResponse("PAYTR notification failed: bad body", { status: 400 });
  }

  const merchantOid = formData.get("merchant_oid") as string;
  const status = formData.get("status") as string;
  const totalAmount = formData.get("total_amount") as string;
  const hash = formData.get("hash") as string;

  if (!merchantOid || !status || !totalAmount || !hash) {
    return new NextResponse("PAYTR notification failed: missing fields", { status: 400 });
  }

  if (!verifyCallbackHash(merchantOid, status, totalAmount, hash)) {
    console.error("paytr callback: hash mismatch", { merchantOid });
    return new NextResponse("PAYTR notification failed: hash mismatch", { status: 400 });
  }

  if (status === "success") {
    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", merchantOid);
  }

  // PayTR "OK" yanıtı bekler — aksi halde bildirimi tekrarlar
  return new NextResponse("OK");
}
