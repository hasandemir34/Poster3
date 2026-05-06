import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { ProfileForm } from "@/app/profile/ProfileForm";
import { Footer } from "@/components/ui/Footer";
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
      <Navbar backHref="/" backLabel="Ana Sayfa" />

      <div className="max-w-xl mx-auto px-6 mt-10">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl shadow-card p-6 flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-full bg-charcoal text-off-white flex items-center justify-center text-2xl font-semibold select-none shrink-0">
            {((profile as Profile)?.full_name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-charcoal text-lg leading-tight truncate">
              {(profile as Profile)?.full_name ?? "—"}
            </p>
            <p className="text-sm text-muted truncate">{user.email}</p>
            <p className="text-xs text-muted mt-0.5">
              Üyelik: {new Date(user.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Hesap Bilgileri
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <ProfileForm profile={profile as Profile | null} userId={user.id} />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
