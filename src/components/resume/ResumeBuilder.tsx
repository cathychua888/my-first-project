"use client";

import { useMemo, useState } from "react";
import { TextArea, TextField } from "@/components/Field";
import { ErrorBox, MissingInfo, Spinner } from "@/components/Feedback";
import { CopyButton } from "@/components/CopyButton";
import { useGenerate } from "@/components/useGenerate";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { fieldErrors, resumeInputSchema, type ResumeInput, type ResumeOutput } from "@/lib/ai/schemas";
import { toDoc, toEditable, resumeToText, type Contact, type EditableResume } from "@/lib/resume/model";
import { saveBlob, safeFileName } from "@/lib/export/download";
import { btn, cardClass } from "@/lib/ui";

type CareerFields = Omit<ResumeInput, "mode">;
type Mode = ResumeInput["mode"];

const EMPTY_CONTACT: Contact = { fullName: "", email: "", phone: "", location: "", link: "" };
const EMPTY_CAREER: CareerFields = {
  previousJobTitle: "",
  companyOrIndustry: "",
  responsibilities: "",
  experienceDuration: "",
  education: "",
  vaExperience: "",
  achievements: "",
  certifications: "",
  adminSkills: "",
  socialMediaSkills: "",
  customerServiceSkills: "",
  technicalSkills: "",
  tools: "",
  niche: "",
  targetClient: "",
  jobType: "",
};

const STEPS = ["Resume type", "Personal info", "Career background", "VA skills", "Career objective"];

/** Which form fields belong to each step (used to show errors on the right step). */
const STEP_FIELDS: Record<number, string[]> = {
  2: ["previousJobTitle", "companyOrIndustry", "responsibilities", "experienceDuration", "education", "vaExperience", "achievements", "certifications"],
  3: ["adminSkills", "socialMediaSkills", "customerServiceSkills", "technicalSkills", "tools"],
  4: ["niche", "targetClient", "jobType"],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [career, setCareer] = useState<CareerFields>(EMPTY_CAREER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [edit, setEdit] = useState<EditableResume | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [tab, setTab] = useState<"edit" | "preview">("preview");
  const [downloading, setDownloading] = useState<"" | "pdf" | "docx">("");
  const [downloadError, setDownloadError] = useState("");
  const gen = useGenerate<ResumeOutput>("resume");

  const doc = useMemo(() => (edit ? toDoc(edit) : null), [edit]);

  const setC = (k: keyof Contact) => (v: string) => setContact((c) => ({ ...c, [k]: v }));
  const setF = (k: keyof CareerFields) => (v: string) => setCareer((c) => ({ ...c, [k]: v }));

  /** Validates the current step. Returns true if the user can continue. */
  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0 && !mode) e.mode = "Please choose a resume type.";
    if (s === 1) {
      if (!contact.fullName.trim()) e.fullName = "Full name is required.";
      if (!contact.email.trim()) e.email = "Email is required.";
      else if (!EMAIL_RE.test(contact.email.trim())) e.email = "Please enter a valid email address.";
    }
    if (s >= 2 && mode) {
      const parsed = resumeInputSchema.safeParse({ mode, ...career });
      if (!parsed.success) {
        const all = fieldErrors(parsed.error);
        for (const f of STEP_FIELDS[s] ?? []) if (all[f]) e[f] = all[f];
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function generate() {
    for (const s of [0, 1, 2, 3, 4]) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    // Only career information goes to the AI. Contact details stay in the browser.
    const result = await gen.generate({ mode, ...career });
    if (result) {
      setEdit(toEditable(result, contact));
      setMissing(result.missingInfo);
      setTab("preview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function regenerate() {
    if (!window.confirm("Regenerate your resume? Your edits to the current version will be replaced.")) return;
    const result = await gen.generate({ mode, ...career });
    if (result) {
      setEdit(toEditable(result, edit?.contact ?? contact));
      setMissing(result.missingInfo);
    }
  }

  function startOver() {
    if (!window.confirm("Start over? All your answers and your generated resume will be cleared.")) return;
    gen.reset();
    setEdit(null);
    setMissing([]);
    setMode(null);
    setContact(EMPTY_CONTACT);
    setCareer(EMPTY_CAREER);
    setErrors({});
    setStep(0);
  }

  async function download(kind: "pdf" | "docx") {
    if (!doc) return;
    setDownloading(kind);
    setDownloadError("");
    try {
      const name = safeFileName(doc.contact.fullName, "VA Resume");
      if (kind === "pdf") {
        const { buildResumePdf } = await import("@/lib/export/pdf");
        saveBlob(await buildResumePdf(doc), `${name}.pdf`);
      } else {
        const { buildResumeDocx } = await import("@/lib/export/docx");
        saveBlob(await buildResumeDocx(doc), `${name}.docx`);
      }
    } catch (err) {
      console.error(err);
      setDownloadError("The download could not be created. Please try again.");
    } finally {
      setDownloading("");
    }
  }

  // ---------------- RESULT VIEW ----------------
  if (edit && doc) {
    return (
      <div className="space-y-5">
        <div className={`${cardClass} flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center`}>
          <p className="mr-auto text-sm font-semibold text-ink">Your resume is ready. Review it carefully before sending.</p>
          <button type="button" className={btn.primary} onClick={() => download("pdf")} disabled={!!downloading}>
            {downloading === "pdf" ? "Preparing…" : "Download PDF"}
          </button>
          <button type="button" className={btn.secondary} onClick={() => download("docx")} disabled={!!downloading}>
            {downloading === "docx" ? "Preparing…" : "Download Word (.docx)"}
          </button>
          <CopyButton text={resumeToText(doc)} label="Copy text" className={btn.secondary} />
          <button type="button" className={btn.secondary} onClick={regenerate} disabled={gen.loading}>
            Regenerate
          </button>
          <button type="button" className={btn.ghost} onClick={() => setEdit(null)}>
            Change my answers
          </button>
          <button type="button" className={btn.ghost} onClick={startOver}>
            Start over
          </button>
        </div>

        {gen.loading && <Spinner label="Regenerating your resume…" />}
        {gen.error && <ErrorBox message={gen.error} />}
        {downloadError && <ErrorBox message={downloadError} />}
        <MissingInfo items={missing} />

        <div className="flex gap-2 lg:hidden" role="tablist">
          {(["preview", "edit"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${tab === t ? "bg-brand-600 text-white" : "bg-white text-brand-700 border border-brand-200"}`}
            >
              {t === "preview" ? "Preview" : "Edit"}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={tab === "edit" ? "" : "hidden lg:block"}>
            <h2 className="mb-3 hidden text-lg font-bold lg:block">Edit</h2>
            <ResumeEditor value={edit} onChange={setEdit} />
          </div>
          <div className={tab === "preview" ? "" : "hidden lg:block"}>
            <h2 className="mb-3 hidden text-lg font-bold lg:block">Preview</h2>
            <div className="lg:sticky lg:top-20">
              <ResumePreview doc={doc} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- FORM VIEW ----------------
  // Server-side validation errors (rare, since the browser validates first) are shown too.
  const allErrors = { ...gen.fieldErrors, ...errors };
  const isExperienced = mode === "experienced";
  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <ol className="mb-6 flex gap-1.5" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-brand-600" : "bg-brand-100"}`} />
            <span className={`mt-1.5 hidden text-xs sm:block ${i === step ? "font-semibold text-brand-800" : "text-muted"}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>
      <p className="mb-4 text-sm text-muted sm:hidden">
        Step {step + 1} of {STEPS.length}: <strong className="text-ink">{STEPS[step]}</strong>
      </p>

      <form
        className={`${cardClass} space-y-5 p-5 sm:p-8`}
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEPS.length - 1) next();
          else generate();
        }}
        noValidate
      >
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold">Which describes you best?</h2>
            <p className="mt-1 text-sm text-muted">This changes how your resume is written.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Resume type">
              {(
                [
                  ["beginner", "Beginner VA Resume", "I have no paid VA or freelance experience yet. Highlight my transferable skills from other jobs or studies."],
                  ["experienced", "Experienced VA Resume", "I have worked as a VA or freelancer before. Highlight my VA clients and results."],
                ] as const
              ).map(([value, title, desc]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  onClick={() => {
                    setMode(value);
                    setErrors({});
                  }}
                  className={`rounded-2xl border-2 p-5 text-left transition-colors ${mode === value ? "border-brand-600 bg-brand-50" : "border-brand-100 bg-white hover:border-brand-300"}`}
                >
                  <span className="font-semibold">{title}</span>
                  <span className="mt-1 block text-sm text-muted">{desc}</span>
                </button>
              ))}
            </div>
            {allErrors.mode && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{allErrors.mode}</p>}
          </div>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="text-lg font-bold">Personal information</h2>
              <p className="mt-1 text-sm text-muted">
                🔒 These details stay on your device. They are added to your resume but are not sent to the AI.
              </p>
            </div>
            <TextField name="fullName" label="Full name" required placeholder="e.g. Maria Santos" value={contact.fullName} onChange={setC("fullName")} error={allErrors.fullName} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="email" type="email" label="Email" required placeholder="e.g. maria.santos@email.com" value={contact.email} onChange={setC("email")} error={allErrors.email} />
              <TextField name="phone" type="tel" label="Phone" placeholder="e.g. +63 917 123 4567" value={contact.phone} onChange={setC("phone")} />
            </div>
            <TextField name="location" label="Location" placeholder="e.g. Cebu City, Philippines (open to remote work)" value={contact.location} onChange={setC("location")} />
            <TextField name="link" label="Professional profile or portfolio link" placeholder="e.g. linkedin.com/in/yourname" value={contact.link} onChange={setC("link")} />
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-lg font-bold">Career background</h2>
              <p className="mt-1 text-sm text-muted">Tell us about your most recent job, even if it was not VA work. Students can describe part-time work, school projects, or organizations.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="previousJobTitle" label="Previous job title" required placeholder="e.g. Customer Service Representative" value={career.previousJobTitle} onChange={setF("previousJobTitle")} error={allErrors.previousJobTitle} />
              <TextField name="companyOrIndustry" label="Company or industry" required placeholder="e.g. BPO / Telecommunications" value={career.companyOrIndustry} onChange={setF("companyOrIndustry")} error={allErrors.companyOrIndustry} />
            </div>
            <TextArea name="responsibilities" label="Work responsibilities" required rows={5} placeholder={"e.g.\n- Answered 60+ customer calls per day\n- Updated customer records in Salesforce\n- Trained new team members"} hint="List what you actually did. Include numbers only if they are true." value={career.responsibilities} onChange={setF("responsibilities")} error={allErrors.responsibilities} />
            <TextField name="experienceDuration" label="Work experience duration" required placeholder="e.g. March 2021 – June 2024 (3 years)" value={career.experienceDuration} onChange={setF("experienceDuration")} error={allErrors.experienceDuration} />
            {isExperienced && (
              <TextArea name="vaExperience" label="Your VA or freelance experience" required rows={5} placeholder={"e.g. Freelance Executive Assistant, Upwork (Jan 2023 – present)\n- Managed inbox and calendar for a US real estate agent\n- Scheduled 20+ client appointments per week"} hint="Include roles, clients or platforms, dates, and tasks. Only include real experience." value={career.vaExperience} onChange={setF("vaExperience")} error={allErrors.vaExperience} />
            )}
            <TextArea name="education" label="Educational background" required rows={3} placeholder="e.g. Bachelor of Science in Business Administration, University of San Carlos, 2020" value={career.education} onChange={setF("education")} error={allErrors.education} />
            <TextArea name="achievements" label="Achievements or results" rows={3} placeholder="e.g. Employee of the Month (Aug 2023); kept a 95% customer satisfaction score" hint="Only real achievements. Leave blank if unsure — we won't make any up." value={career.achievements} onChange={setF("achievements")} error={allErrors.achievements} />
            <TextArea name="certifications" label="Certifications or trainings completed" rows={2} placeholder="e.g. Google Workspace Essentials (Coursera, 2024)" value={career.certifications} onChange={setF("certifications")} error={allErrors.certifications} />
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-lg font-bold">VA skills</h2>
              <p className="mt-1 text-sm text-muted">Fill in any that apply. You need at least one. Separate skills with commas.</p>
            </div>
            {allErrors.adminSkills && <p role="alert" className="text-xs font-medium text-red-600">{allErrors.adminSkills}</p>}
            <TextArea name="adminSkills" label="Administrative skills" rows={2} placeholder="e.g. Email management, calendar scheduling, data entry, file organization" value={career.adminSkills} onChange={setF("adminSkills")} />
            <TextArea name="socialMediaSkills" label="Social media skills" rows={2} placeholder="e.g. Content scheduling, writing captions, basic Canva graphics" value={career.socialMediaSkills} onChange={setF("socialMediaSkills")} />
            <TextArea name="customerServiceSkills" label="Customer service skills" rows={2} placeholder="e.g. Email and chat support, handling complaints, order follow-ups" value={career.customerServiceSkills} onChange={setF("customerServiceSkills")} />
            <TextArea name="technicalSkills" label="Technical skills" rows={2} placeholder="e.g. Basic WordPress editing, fast typing (60 WPM), research" value={career.technicalSkills} onChange={setF("technicalSkills")} />
            <TextArea name="tools" label="Software and tools used" rows={2} placeholder="e.g. Google Workspace, Microsoft Excel, Canva, Trello, Zoom, Slack" value={career.tools} onChange={setF("tools")} />
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 className="text-lg font-bold">Career objective</h2>
              <p className="mt-1 text-sm text-muted">What kind of VA work are you looking for?</p>
            </div>
            <TextField name="niche" label="Preferred VA niche" required placeholder="e.g. Executive assistant, social media VA, e-commerce support" value={career.niche} onChange={setF("niche")} error={allErrors.niche} />
            <TextField name="targetClient" label="Target client" placeholder="e.g. Small business owners, real estate agents, online coaches" value={career.targetClient} onChange={setF("targetClient")} error={allErrors.targetClient} />
            <TextField name="jobType" label="Preferred job type" placeholder="e.g. Full-time remote, part-time, project-based" value={career.jobType} onChange={setF("jobType")} error={allErrors.jobType} />
          </>
        )}

        {gen.loading && <Spinner label="Writing your resume…" />}
        {gen.error && <ErrorBox message={gen.error} />}

        <div className="flex flex-col-reverse gap-3 border-t border-brand-100 pt-5 sm:flex-row sm:justify-between">
          <button type="button" className={btn.ghost} onClick={() => { setErrors({}); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0 || gen.loading}>
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="submit" className={btn.primary}>
              Continue →
            </button>
          ) : (
            <button type="submit" className={btn.primary} disabled={gen.loading}>
              {gen.loading ? "Generating…" : "✨ Generate my resume"}
            </button>
          )}
        </div>
      </form>
      <p className="mt-4 text-center text-xs text-muted">
        Your answers are not saved. If you refresh or close this page, they will be cleared.
      </p>
    </div>
  );
}
