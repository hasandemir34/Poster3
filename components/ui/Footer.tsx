export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-20">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
          {/* Brand */}
          <div>
            <span className="text-xl font-semibold tracking-tight text-charcoal block mb-3">
              Framely
            </span>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Fotoğraflarınızı sanat eserine dönüştürüyoruz. Arşiv kalitesinde baskı, kapınıza teslim.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-pastel-sage border border-pastel-sage/60" />
              <span className="text-xs text-muted">Türkiye geneli ücretsiz kargo</span>
            </div>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-xs font-semibold text-charcoal uppercase tracking-widest mb-4">
              Neden Framely?
            </h4>
            <ul className="space-y-3">
              {[
                "250 gsm arşiv kalitesi kağıt",
                "2–3 iş günü üretim",
                "MNG Kargo ile hızlı teslimat",
                "Güvenli ödeme",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-charcoal/40 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Framely. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-5">
            <span className="text-xs text-muted/60">Türkiye&apos;de üretildi 🇹🇷</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
