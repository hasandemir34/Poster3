"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-xl font-semibold text-charcoal">
            E-postanızı kontrol edin
          </h1>
          <p className="mt-2 text-muted text-sm">
            Doğrulama bağlantısını şu adrese gönderdik: <strong>{email}</strong>. Hesabınızı aktif etmek için bağlantıya tıklayın.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-sm text-charcoal underline"
          >
            Giriş sayfasına dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-2xl font-semibold text-charcoal mb-8"
        >
          Framely
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-xl font-semibold text-charcoal mb-6">
            Hesabınızı oluşturun
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Ad Soyad
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-charcoal bg-off-white focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal transition-colors"
                placeholder="Ada Lovelace"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                E-posta
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-charcoal bg-off-white focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal transition-colors"
                placeholder="sen@ornek.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Şifre
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-charcoal bg-off-white focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal transition-colors"
                placeholder="En az 8 karakter"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-pastel-rose/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-charcoal text-off-white text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? "Hesap oluşturuluyor…" : "Hesap Oluştur"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Zaten hesabınız var mı?{" "}
          <Link
            href="/login"
            className="text-charcoal font-medium underline underline-offset-2"
          >
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}
