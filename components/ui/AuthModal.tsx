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
  const [showPassword, setShowPassword] = useState(false);
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
        let msg = error.message;
        if (msg.includes("User already registered")) {
          msg = "Bu e-posta adresi zaten kullanımda.";
        } else if (msg.includes("Signup is disabled")) {
          msg = "Kayıt işlemi şu an kapalı.";
        } else {
          msg = "Kayıt olurken bir hata oluştu: " + msg;
        }
        setError(msg);
        setLoading(false);
        return;
      }
      // Auto-login after signup
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError("Hesabını doğrulamak için e-postanı kontrol et, ardından tekrar giriş yap.");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        let msg = error.message;
        if (msg.includes("Invalid login credentials")) {
          msg = "E-posta veya şifre hatalı.";
        } else if (msg.includes("Email not confirmed")) {
          msg = "Lütfen e-posta adresinizi doğrulayın.";
        } else {
          msg = "Giriş yapılırken bir hata oluştu: " + msg;
        }
        setError(msg);
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass + " pr-11"}
              placeholder={tab === "signup" ? "Min. 8 karakter" : "••••••••"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
