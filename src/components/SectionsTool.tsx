"use client";

import { useState } from "react";
import { SelectField, TextArea, TextField } from "@/components/Field";
import { ErrorBox, MissingInfo, Spinner } from "@/components/Feedback";
import { CopyButton } from "@/components/CopyButton";
import { useGenerate } from "@/components/useGenerate";
import { INPUT_SCHEMAS, fieldErrors, type SectionsOutput } from "@/lib/ai/schemas";
import { saveBlob, safeFileName } from "@/lib/export/download";
import type { ToolId } from "@/lib/tools";
import { btn, cardClass } from "@/lib/ui";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  rows?: number;
  options?: readonly string[];
  defaultValue?: string;
  /** Show two short fields side by side on wider screens. */
  half?: boolean;
}

interface Props {
  tool: Exclude<ToolId, "resume">;
  fields: FieldConfig[];
  submitLabel: string;
  documentTitle: string;
}

type Section = { title: string; content: string };

function initialValues(fields: FieldConfig[]) {
  return Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? (f.options ? f.options[0] : "")]));
}

/** Generic form + editable results. Used by every tool except the Resume Builder. */
export function SectionsTool({ tool, fields, submitLabel, documentTitle }: Props) {
  const schema = INPUT_SCHEMAS[tool];
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<Section[] | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [downloadError, setDownloadError] = useState("");
  const gen = useGenerate<SectionsOutput>(tool);

  const allErrors = { ...gen.fieldErrors, ...errors };

  async function submit() {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    if (sections && !window.confirm("Regenerate? Your edits to the current results will be replaced.")) return;
    setErrors({});
    const result = await gen.generate(parsed.data);
    if (result) {
      setSections(result.sections);
      setMissing(result.missingInfo);
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clearAll() {
    if (!window.confirm("Clear the form and results?")) return;
    gen.reset();
    setValues(initialValues(fields));
    setErrors({});
    setSections(null);
    setMissing([]);
  }

  const allText = (sections ?? []).map((s) => `${s.title.toUpperCase()}\n\n${s.content}`).join("\n\n\n");
  const fileBase = safeFileName(documentTitle, values.jobTitle ?? "");

  async function downloadDocx() {
    if (!sections) return;
    setDownloadError("");
    try {
      const { buildSectionsDocx } = await import("@/lib/export/docx");
      saveBlob(await buildSectionsDocx(documentTitle, sections), `${fileBase}.docx`);
    } catch (err) {
      console.error(err);
      setDownloadError("The download could not be created. Please try again.");
    }
  }

  function downloadTxt() {
    saveBlob(new Blob([allText], { type: "text/plain;charset=utf-8" }), `${fileBase}.txt`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* FORM */}
      <form
        noValidate
        className={`${cardClass} h-fit space-y-5 p-5 sm:p-6`}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => {
            const common = {
              name: f.name,
              label: f.label,
              required: f.required,
              hint: f.hint,
              placeholder: f.placeholder,
              value: values[f.name] ?? "",
              error: allErrors[f.name],
              onChange: (v: string) => setValues((s) => ({ ...s, [f.name]: v })),
            };
            return (
              <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
                {f.type === "textarea" ? (
                  <TextArea {...common} rows={f.rows ?? 4} />
                ) : f.type === "select" ? (
                  <SelectField {...common} options={f.options ?? []} />
                ) : (
                  <TextField {...common} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" className={`${btn.primary} flex-1`} disabled={gen.loading}>
            {gen.loading ? "Generating…" : sections ? "↻ Regenerate" : `✨ ${submitLabel}`}
          </button>
          <button type="button" className={btn.ghost} onClick={clearAll} disabled={gen.loading}>
            Clear / reset
          </button>
        </div>
      </form>

      {/* RESULTS */}
      <section id="results" aria-label="Results" className="scroll-mt-20 space-y-4">
        {gen.loading && <Spinner />}
        {gen.error && <ErrorBox message={gen.error} />}
        {downloadError && <ErrorBox message={downloadError} />}

        {!sections && !gen.loading && (
          <div className="grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-brand-200 bg-white/60 p-8 text-center text-sm text-muted">
            Your results will appear here. Fill in the form and click “{submitLabel}”.
          </div>
        )}

        {sections && (
          <>
            <div className={`${cardClass} flex flex-wrap items-center gap-2 p-3`}>
              <p className="mr-auto px-1 text-sm font-semibold">Review and edit before sending.</p>
              <CopyButton text={allText} label="Copy all" />
              <button type="button" className={btn.small} onClick={downloadDocx}>
                Download Word
              </button>
              <button type="button" className={btn.small} onClick={downloadTxt}>
                Download .txt
              </button>
              <button type="button" className={btn.small} onClick={submit} disabled={gen.loading}>
                Regenerate
              </button>
            </div>
            <MissingInfo items={missing} />
            {sections.map((s, i) => (
              <div key={i} className={`${cardClass} p-4`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="font-bold text-brand-800">{s.title}</h2>
                  <CopyButton text={s.content} />
                </div>
                <label htmlFor={`result-${i}`} className="sr-only">
                  {s.title}
                </label>
                <textarea
                  id={`result-${i}`}
                  value={s.content}
                  onChange={(e) =>
                    setSections((all) => all!.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))
                  }
                  rows={Math.min(22, Math.max(4, s.content.split("\n").length + 2))}
                  className="w-full resize-y rounded-xl border border-brand-100 bg-canvas p-3 text-sm leading-relaxed focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
