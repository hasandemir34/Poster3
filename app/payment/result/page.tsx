import Link from "next/link";

interface PageProps {
  searchParams: { status?: string; orderId?: string; error?: string };
}

export default function PaymentResultPage({ searchParams }: PageProps) {
  const { status, orderId, error } = searchParams;
  const isSuccess = status === "success";

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card px-10 py-10 flex flex-col items-center gap-4 max-w-sm w-full text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-pastel-sage flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-charcoal">
              Ödeme Başarılı!
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              Siparişiniz onaylandı ve baskıya alındı. En kısa sürede
              kargoya verilecektir.
            </p>
            {orderId && (
              <p className="text-xs text-muted font-mono">
                Sipariş #{orderId.slice(0, 8)}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-pastel-rose flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-charcoal">
              Ödeme Başarısız
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              {error
                ? decodeURIComponent(error)
                : "Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin."}
            </p>
          </>
        )}

        <div className="flex flex-col gap-2 w-full mt-2">
          {!isSuccess && (
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-charcoal text-white text-sm font-medium text-center hover:bg-charcoal/90 transition-colors"
            >
              Tekrar Dene
            </Link>
          )}
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-charcoal text-sm font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
