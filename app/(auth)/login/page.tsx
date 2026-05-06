"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <h1 className="text-xl font-semibold text-charcoal mb-6">
        Tekrar hoş geldiniz
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-charcoal bg-off-white focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal transition-colors"
            placeholder="••••••••"
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
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-2xl font-semibold text-charcoal mb-8"
        >
          Framely
        </Link>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl shadow-card p-8 h-64 animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-5 text-center text-sm text-muted">
          Hesabınız yok mu?{" "}
          <Link
            href="/signup"
            className="text-charcoal font-medium underline underline-offset-2"
          >
            Hesap oluştur
          </Link>
        </p>
      </div>
    </main>
  );
}
