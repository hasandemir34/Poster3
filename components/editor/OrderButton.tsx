"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AuthModal } from "@/components/ui/AuthModal";
import { generatePosterPng } from "@/lib/canvas";
import { createClient } from "@/lib/supabase/client";
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
  country: "US",
};

export function OrderButton({ product, slots }: OrderButtonProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [address, setAddress] = useState<AddressJson>(EMPTY_ADDRESS);
  const [errorMessage, setErrorMessage] = useState("");

  const filledCount = slots.filter((s) => s.previewUrl).length;
  const isReady = filledCount === product.photo_count;

  async function handleOrderClick() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStep("auth");
      return;
    }
    setStep("address");
  }

  async function handleOrder() {
    setStep("generating");

    try {
      const cols = 5;
      const rows = product.photo_count / cols;
      const blob = await generatePosterPng(slots, cols, rows);

      setStep("uploading");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(fileName, blob, { contentType: "image/png" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("posters")
        .getPublicUrl(fileName);

      const printReadyUrl = urlData.publicUrl;

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
    generating: "Baskı dosyası oluşturuluyor…",
    uploading: "Yükleniyor…",
    placing: "Sipariş veriliyor…",
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
            {filledCount} / {product.photo_count} photos added
          </p>
        )}
      </div>

      <AuthModal
        open={step === "auth"}
        onClose={() => setStep("idle")}
        onSuccess={() => setStep("address")}
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
        title="Something went wrong"
      >
        <p className="text-sm text-muted mb-4">{errorMessage}</p>
        <Button onClick={() => setStep("idle")}>Close</Button>
      </Modal>

      {step === "done" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-pastel-sage text-charcoal px-6 py-3 rounded-xl shadow-lift text-sm font-medium">
          Order placed! Redirecting…
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
        <label className={labelClass}>Street Address</label>
        <input
          required
          className={inputClass}
          value={address.line1}
          onChange={field("line1")}
          placeholder="123 Main St"
        />
      </div>
      <div>
        <label className={labelClass}>Apt / Suite (optional)</label>
        <input
          className={inputClass}
          value={address.line2 ?? ""}
          onChange={field("line2")}
          placeholder="Apt 4B"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>City</label>
          <input
            required
            className={inputClass}
            value={address.city}
            onChange={field("city")}
          />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input
            required
            className={inputClass}
            value={address.state}
            onChange={field("state")}
            placeholder="CA"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Postcode</label>
          <input
            required
            className={inputClass}
            value={address.postcode}
            onChange={field("postcode")}
          />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input
            required
            className={inputClass}
            value={address.country}
            onChange={field("country")}
          />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full mt-2">
        Confirm &amp; Generate Print
      </Button>
    </form>
  );
}
