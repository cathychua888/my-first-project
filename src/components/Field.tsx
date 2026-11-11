"use client";

import { inputClass } from "@/lib/ui";

interface BaseProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  placeholder?: string;
}

function Label({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-ink">
      {label}
      {required ? <span className="text-brand-600"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
    </label>
  );
}

function Help({ name, hint, error }: { name: string; hint?: string; error?: string }) {
  if (error)
    return (
      <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
        {error}
      </p>
    );
  if (hint) return <p id={`${name}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>;
  return null;
}

export function TextField({ type = "text", ...p }: BaseProps & { type?: string }) {
  return (
    <div>
      <Label name={p.name} label={p.label} required={p.required} />
      <input
        id={p.name}
        name={p.name}
        type={type}
        value={p.value}
        placeholder={p.placeholder}
        onChange={(e) => p.onChange(e.target.value)}
        aria-invalid={!!p.error}
        aria-describedby={p.error ? `${p.name}-error` : p.hint ? `${p.name}-hint` : undefined}
        className={`${inputClass} ${p.error ? "border-red-400" : ""}`}
      />
      <Help name={p.name} hint={p.hint} error={p.error} />
    </div>
  );
}

export function TextArea({ rows = 4, ...p }: BaseProps & { rows?: number }) {
  return (
    <div>
      <Label name={p.name} label={p.label} required={p.required} />
      <textarea
        id={p.name}
        name={p.name}
        rows={rows}
        value={p.value}
        placeholder={p.placeholder}
        onChange={(e) => p.onChange(e.target.value)}
        aria-invalid={!!p.error}
        aria-describedby={p.error ? `${p.name}-error` : p.hint ? `${p.name}-hint` : undefined}
        className={`${inputClass} resize-y leading-relaxed ${p.error ? "border-red-400" : ""}`}
      />
      <Help name={p.name} hint={p.hint} error={p.error} />
    </div>
  );
}

export function SelectField(p: BaseProps & { options: readonly string[] }) {
  return (
    <div>
      <Label name={p.name} label={p.label} required={p.required} />
      <select
        id={p.name}
        name={p.name}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        className={inputClass}
      >
        {p.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Help name={p.name} hint={p.hint} error={p.error} />
    </div>
  );
}
