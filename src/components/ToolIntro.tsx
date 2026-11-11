import Link from "next/link";

export function ToolIntro({ icon, title, description, steps }: { icon: string; title: string; description: string; steps: string[] }) {
  return (
    <div className="mb-8">
      <Link href="/dashboard" className="text-sm font-semibold text-brand-700 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-4 flex items-start gap-4">
        <span aria-hidden className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-2xl sm:grid">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-muted">{description}</p>
        </div>
      </div>
      <details className="mt-4 rounded-xl border border-brand-100 bg-white p-4 text-sm" open>
        <summary className="cursor-pointer font-semibold text-brand-800">How to use this tool</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
