"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "demirhasan0108@gmail.com";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/");
}

export async function updateOrderStatus(orderId: string, status: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}
