"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AuthModal } from "@/components/ui/AuthModal";
import { generatePosterPng } from "@/lib/canvas";
import { createClient } from "@/lib/supabase/client";
import { uploadPoster } from "@/lib/supabase/storage";
import type { PhotoSlot, Product, AddressJson, CreateOrderResponse } from "@/lib/types";

interface OrderButtonProps {
  product: Product;
  slots: PhotoSlot[];
}

type Step =
  | "idle"
  | "auth"
  | "address"
  | "generating"
  | "uploading"
  | "placing"
  | "done"
  | "error";

const EMPTY_ADDRESS: AddressJson = {
  line1: "",
  city: "",
  state: "",
  postcode: "",
  country: "TR",
};

export function OrderButton({ product, slots }: OrderButtonProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [address, setAddress] = useState<AddressJson>(EMPTY_ADDRESS);
  const [errorMessage, setErrorMessage] = useState("");

  const filledCount = slots.filter((s) => s.previewUrl).length;
  const isReady = filledCount === product.photo_count;

  async function fetchSavedAddress() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("address_json")
      .eq("id", user.id)
      .single();
    if (profile?.address_json) {
      setAddress(profile.address_json as AddressJson);
    }
  }

  async function handleOrderClick() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStep("auth");
      return;
    }

    await fetchSavedAddress();
    setStep("address");
  }

  async function handleOrder() {
    setStep("generating");

    try {
      const cols = product.cols;
      const rows = product.photo_count / cols;
      const blob = await generatePosterPng(slots, cols, rows);

      setStep("uploading");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const printReadyUrl = await uploadPoster(user.id, blob);

      setStep("placing");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          printReadyUrl,
          addressJson: address,
        }),
      });

      if (!res.ok) {
        const json: CreateOrderResponse = await res.json();
        throw new Error(json.error ?? "Order failed");
      }

      setStep("done");
      setTimeout(() => router.push("/"), 2500);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setStep("error");
    }
  }

  const stepLabels: Record<Step, string> = {
    idle: "Sipariş Ver",
    auth: "Sipariş Ver",
    address: "Adres Onayla",
    generating: "Baskı dosyası hazırlanıyor...",
    uploading: "Yükleniyor...",
    placing: "Sipariş veriliyor...",
    done: "Sipariş alındı!",
    error: "Tekrar dene",
  };

  const isProcessing = ["generating", "uploading", "placing"].includes(step);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Button
          size="lg"
          onClick={handleOrderClick}
          disabled={!isReady || isProcessing}
          loading={isProcessing}
        >
          {stepLabels[step]}
        </Button>
        {!isReady && (
          <p className="text-xs text-muted">
            {filledCount} / {product.photo_count} fotoğraf eklendi
          </p>
        )}
      </div>

      <AuthModal
        open={step === "auth"}
        onClose={() => setStep("idle")}
        onSuccess={async () => {
          await fetchSavedAddress();
          setStep("address");
        }}
      />

      <Modal
        open={step === "address"}
        onClose={() => setStep("idle")}
        title="Teslimat Adresi"
      >
        <AddressForm
          address={address}
          onChange={setAddress}
          onSubmit={handleOrder}
        />
      </Modal>

      <Modal
        open={step === "error"}
        onClose={() => setStep("idle")}
        title="Bir şeyler yanlış gitti"
      >
        <p className="text-sm text-muted mb-4">{errorMessage}</p>
        <Button onClick={() => setStep("idle")}>Kapat</Button>
      </Modal>

      {step === "done" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal px-10 py-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-pastel-sage flex items-center justify-center">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-charcoal">Siparişiniz Alındı!</h2>
            <p className="text-sm text-muted leading-relaxed">
              Posteriniz hazırlanmaya başlandı. Siparişinizin durumunu profilinizden takip edebilirsiniz.
            </p>
            <p className="text-xs text-muted">Ana sayfaya yönlendiriliyorsunuz…</p>
          </div>
        </div>
      )}
    </>
  );
}

interface AddressFormProps {
  address: AddressJson;
  onChange: (a: AddressJson) => void;
  onSubmit: () => void;
}

function AddressForm({ address, onChange, onSubmit }: AddressFormProps) {
  function field(key: keyof AddressJson) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...address, [key]: e.target.value });
  }

  const labelClass = "block text-xs font-medium text-charcoal mb-1";
  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-charcoal bg-off-white focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
    >
      <div>
        <label className={labelClass}>Açık Adres</label>
        <input
          required
          className={inputClass}
          value={address.line1}
          onChange={field("line1")}
          placeholder="Örn: Atatürk Mah. 123. Sok."
        />
      </div>
      <div>
        <label className={labelClass}>Bina / Kat / Daire (isteğe bağlı)</label>
        <input
          className={inputClass}
          value={address.line2 ?? ""}
          onChange={field("line2")}
          placeholder="No: 5 Daire: 4"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Şehir</label>
          <input
            required
            className={inputClass}
            value={address.city}
            onChange={field("city")}
            placeholder="İstanbul"
          />
        </div>
        <div>
          <label className={labelClass}>İlçe / Eyalet</label>
          <input
            required
            className={inputClass}
            value={address.state}
            onChange={field("state")}
            placeholder="Kadıköy"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className={labelClass}>Posta Kodu</label>
          <input
            required
            className={inputClass}
            value={address.postcode}
            onChange={field("postcode")}
          />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full mt-2">
        Onayla ve Baskıyı Hazırla
      </Button>
    </form>
  );
}
