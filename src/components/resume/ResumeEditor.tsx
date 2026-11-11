"use client";

import type { EditableResume } from "@/lib/resume/model";
import { TextArea, TextField } from "@/components/Field";
import { btn } from "@/lib/ui";

/** Lets the user edit every part of the generated resume. */
export function ResumeEditor({ value, onChange }: { value: EditableResume; onChange: (v: EditableResume) => void }) {
  const set = <K extends keyof EditableResume>(key: K, v: EditableResume[K]) => onChange({ ...value, [key]: v });
  const setContact = (key: keyof EditableResume["contact"], v: string) =>
    onChange({ ...value, contact: { ...value.contact, [key]: v } });
  const setExp = (i: number, key: keyof EditableResume["experience"][number], v: string) =>
    onChange({ ...value, experience: value.experience.map((e, j) => (j === i ? { ...e, [key]: v } : e)) });

  return (
    <div className="space-y-5">
      <fieldset className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-brand-800">Contact details</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField name="ed-name" label="Full name" required value={value.contact.fullName} onChange={(v) => setContact("fullName", v)} />
          <TextField name="ed-email" label="Email" required value={value.contact.email} onChange={(v) => setContact("email", v)} />
          <TextField name="ed-phone" label="Phone" value={value.contact.phone} onChange={(v) => setContact("phone", v)} />
          <TextField name="ed-location" label="Location" value={value.contact.location} onChange={(v) => setContact("location", v)} />
        </div>
        <TextField name="ed-link" label="Profile or portfolio link" value={value.contact.link} onChange={(v) => setContact("link", v)} />
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-brand-800">Headline & summary</legend>
        <TextField name="ed-headline" label="Resume headline" required value={value.headline} onChange={(v) => set("headline", v)} />
        <TextArea name="ed-summary" label="Professional summary" required rows={5} value={value.summary} onChange={(v) => set("summary", v)} />
      </fieldset>

      <fieldset className="rounded-2xl border border-brand-100 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-brand-800">Skills</legend>
        <TextArea
          name="ed-skills"
          label="Skills"
          required
          rows={5}
          hint='One category per line, like "Tools: Canva, Google Sheets, Trello".'
          value={value.skillsText}
          onChange={(v) => set("skillsText", v)}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-brand-100 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-brand-800">Experience</legend>
        {value.experience.map((e, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-brand-50 p-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField name={`ed-role-${i}`} label="Role" required value={e.role} onChange={(v) => setExp(i, "role", v)} />
              <TextField name={`ed-org-${i}`} label="Company / industry" required value={e.organization} onChange={(v) => setExp(i, "organization", v)} />
              <TextField name={`ed-dur-${i}`} label="Duration" required value={e.duration} onChange={(v) => setExp(i, "duration", v)} />
            </div>
            <TextArea
              name={`ed-bullets-${i}`}
              label="Bullet points"
              required
              rows={5}
              hint="One bullet per line."
              value={e.bulletsText}
              onChange={(v) => setExp(i, "bulletsText", v)}
            />
            <button
              type="button"
              className={btn.ghost}
              onClick={() => set("experience", value.experience.filter((_, j) => j !== i))}
            >
              Remove this role
            </button>
          </div>
        ))}
        <button
          type="button"
          className={btn.small}
          onClick={() => set("experience", [...value.experience, { role: "", organization: "", duration: "", bulletsText: "" }])}
        >
          + Add a role
        </button>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-brand-800">Other sections</legend>
        <TextArea name="ed-transferable" label="Transferable skills" rows={4} hint="One per line." value={value.transferableText} onChange={(v) => set("transferableText", v)} />
        <TextArea name="ed-education" label="Education" required rows={3} hint="One per line." value={value.educationText} onChange={(v) => set("educationText", v)} />
        <TextArea name="ed-certs" label="Certifications & trainings" rows={3} hint="Only list ones you actually completed. One per line." value={value.certificationsText} onChange={(v) => set("certificationsText", v)} />
      </fieldset>
    </div>
  );
}
