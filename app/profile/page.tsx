import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "@/app/profile/ProfileForm";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-off-white pb-20">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto mb-10">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-charcoal">
          Framely
        </Link>
        <Link 
          href="/"
          className="px-5 py-2 rounded-lg text-charcoal text-sm font-medium hover:bg-cream transition-colors"
        >
          Ana Sayfa
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-charcoal">Hesap Bilgileri</h1>
          <p className="text-muted mt-2">
            Adınızı ve teslimat adresinizi buradan güncelleyebilirsiniz.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <ProfileForm profile={profile as Profile} />
        </div>
      </div>
    </main>
  );
}
