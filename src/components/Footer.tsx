import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© VA Career Launch AI</p>
        <p className="max-w-xl text-xs">
          AI-generated content can contain mistakes. Always review and edit before sending to a
          client. This tool does not guarantee job offers.
        </p>
        <Link href="/dashboard" className="font-semibold text-brand-700 hover:underline">
          Open Dashboard
        </Link>
      </div>
    </footer>
  );
}
