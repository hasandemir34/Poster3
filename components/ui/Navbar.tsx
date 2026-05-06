import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

interface NavbarProps {
  backHref?: string;
  backLabel?: string;
}

export async function Navbar({ backHref, backLabel }: NavbarProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initials = user
    ? (user.user_metadata?.full_name ?? user.email ?? "?")[0].toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-charcoal transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {backLabel ?? "Geri"}
            </Link>
          ) : (
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-charcoal hover:opacity-75 transition-opacity"
            >
              Framely
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-charcoal hover:bg-cream transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden sm:inline">Siparişlerim</span>
              </Link>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              <Link
                href="/profile"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-cream transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-charcoal text-off-white flex items-center justify-center text-xs font-semibold shrink-0 group-hover:opacity-80 transition-opacity">
                  {initials}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-charcoal max-w-[120px] truncate">
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
                </span>
              </Link>

              <LogoutButton compact />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-charcoal hover:bg-cream transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/editor"
                className="px-4 py-1.5 rounded-lg bg-charcoal text-off-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Hemen Başla
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
