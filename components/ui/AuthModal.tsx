"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Tab = "signup" | "login";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-charcoal bg-off-white focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal transition-colors";
const labelClass = "block text-sm font-medium text-charcoal mb-1.5";

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setError(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setLoading(false);
  }

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (tab === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${location.origin}/editor`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Auto-login after signup (Supabase confirms immediately in dev or if email confirm is off)
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        // Confirmation email sent — show message
        setError("Hesabını doğrulamak için e-postanı kontrol et, ardından tekrar giriş yap.");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    reset();
    onSuccess();
  }

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Siparişini tamamla"
    >
      <p className="text-sm text-muted mb-5 -mt-1">
        Tasarımın kaydedildi. Siparişi vermek için hesap oluştur veya giriş yap.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream rounded-xl p-1 mb-5">
        {(["signup", "login"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={[
              "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
              tab === t
                ? "bg-white text-charcoal shadow-subtle"
                : "text-muted hover:text-charcoal",
            ].join(" ")}
          >
            {t === "signup" ? "Hesap Oluştur" : "Giriş Yap"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === "signup" && (
          <div>
            <label className={labelClass}>Ad Soyad</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="Ada Lovelace"
            />
          </div>
        )}

        <div>
          <label className={labelClass}>E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="sen@ornek.com"
          />
        </div>

        <div>
          <label className={labelClass}>Şifre</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder={tab === "signup" ? "Min. 8 karakter" : "••••••••"}
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
          {loading
            ? "Lütfen bekle…"
            : tab === "signup"
            ? "Hesap Oluştur & Devam Et"
            : "Giriş Yap & Devam Et"}
        </button>
      </form>
    </Modal>
  );
}
