import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold text-ink">
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm text-white"
      >
        VA
      </span>
      <span className="text-base sm:text-lg">
        Career Launch <span className="text-brand-600">AI</span>
      </span>
    </Link>
  );
}
