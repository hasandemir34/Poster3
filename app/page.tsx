import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("price", { ascending: false });

  return (
    <main className="min-h-screen bg-off-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-2xl font-semibold tracking-tight text-charcoal">
          Framely
        </span>
        <div className="flex gap-3">
          {user ? (
            <Link
              href="/editor"
              className="px-5 py-2 rounded-lg bg-charcoal text-off-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Open Editor
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 rounded-lg text-charcoal text-sm font-medium hover:bg-cream transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 rounded-lg bg-charcoal text-off-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-charcoal leading-tight">
          Your moments,
          <br />
          <span className="text-muted">beautifully printed.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl mx-auto leading-relaxed">
          Build a 50- or 35-photo poster in minutes. Upload, arrange, zoom and
          pan each photo — then order your print.
        </p>
        <Link
          href={user ? "/editor" : "/signup"}
          className="inline-block mt-10 px-8 py-4 rounded-xl bg-charcoal text-off-white font-medium text-base hover:opacity-90 transition-opacity shadow-lift"
        >
          Create Your Poster
        </Link>
      </section>

      {products && products.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-24">
          <h2 className="text-center text-xl font-medium text-charcoal mb-8">
            Choose your size
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(products as Product[]).map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-cream border border-cream shadow-card p-8 text-center"
              >
                <p className="text-lg font-semibold text-charcoal">{p.name}</p>
                <p className="mt-1 text-muted text-sm">{p.photo_count} photos</p>
                <p className="mt-4 text-3xl font-semibold text-charcoal">
                  ${p.price}
                </p>
                <Link
                  href={user ? `/editor?product=${p.id}` : "/signup"}
                  className="inline-block mt-6 px-6 py-3 rounded-lg bg-charcoal text-off-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Start Creating
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
