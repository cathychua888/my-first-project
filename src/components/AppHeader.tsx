import Link from "next/link";
import { Logo } from "./Logo";

/** Header for the dashboard and tool pages. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-muted hover:bg-brand-50 hover:text-brand-700">
            Dashboard
          </Link>
          <Link href="/" className="hidden rounded-lg px-3 py-2 text-muted hover:bg-brand-50 hover:text-brand-700 sm:inline-block">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
