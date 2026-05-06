"use client";


import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile, AddressJson } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface ProfileFormProps {
  profile: Profile | null;
  userId: string;
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [address, setAddress] = useState<AddressJson>(
    profile?.address_json || {
      line1: "",
      city: "",
      state: "",
      postcode: "",
      country: "TR",
    }
  );
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        address_json: address,
      });

    if (error) {
      setMessage({ type: "error", text: "Güncellenirken bir hata oluştu: " + error.message });
    } else {
      setMessage({ type: "success", text: "Bilgileriniz başarıyla güncellendi." });
      router.refresh();
    }
    setLoading(false);
  }

  const labelClass = "block text-sm font-medium text-charcoal mb-1.5";
  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-charcoal bg-off-white focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-pastel-sage/30 text-charcoal"
              : "bg-pastel-rose/30 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className={labelClass}>Ad Soyad</label>
        <input
          required
          className={inputClass}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Adınız Soyadınız"
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-charcoal mb-4">Varsayılan Teslimat Adresi</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Açık Adres</label>
            <input
              required
              className={inputClass}
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              placeholder="Örn: Atatürk Mah. 123. Sok."
            />
          </div>
          <div>
            <label className={labelClass}>Bina / Kat / Daire (isteğe bağlı)</label>
            <input
              className={inputClass}
              value={address.line2 ?? ""}
              onChange={(e) => setAddress({ ...address, line2: e.target.value })}
              placeholder="No: 5 Daire: 4"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Şehir</label>
              <input
                required
                className={inputClass}
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="İstanbul"
              />
            </div>
            <div>
              <label className={labelClass}>İlçe</label>
              <input
                required
                className={inputClass}
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="Kadıköy"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Posta Kodu</label>
            <input
              required
              className={inputClass}
              value={address.postcode}
              onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
              placeholder="34710"
            />
          </div>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Değişiklikleri Kaydet
      </Button>
    </form>
  );
}
