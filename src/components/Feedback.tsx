export function Spinner({ label = "Generating…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" aria-hidden />
      <span>
        {label} <span className="text-muted">This can take up to a minute.</span>
      </span>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}

export function MissingInfo({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Make it stronger: please add these details</p>
      <p className="mt-1 text-xs text-amber-800">
        We never make up experience or results. Add these to your answers and click Regenerate, or
        edit the text directly. Replace any text in [square brackets] before sending.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
}
