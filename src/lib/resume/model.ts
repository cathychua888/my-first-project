import type { ResumeOutput } from "../ai/schemas";

/** Contact details. These stay in the browser and are never sent to the AI. */
export interface Contact {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  link: string;
}

/** Final resume structure used by the preview, PDF, and Word export. */
export interface ResumeDoc {
  contact: Contact;
  headline: string;
  summary: string;
  skills: { category: string; items: string[] }[];
  experience: { role: string; organization: string; duration: string; bullets: string[] }[];
  education: string[];
  certifications: string[];
  transferableSkills: string[];
}

/**
 * Editable version: list fields are kept as plain text (one item per line)
 * so typing in the editor feels natural.
 */
export interface EditableResume {
  contact: Contact;
  headline: string;
  summary: string;
  skillsText: string; // "Category: item, item" per line
  experience: { role: string; organization: string; duration: string; bulletsText: string }[];
  educationText: string;
  certificationsText: string;
  transferableText: string;
}

const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

export function toEditable(out: ResumeOutput, contact: Contact): EditableResume {
  return {
    contact,
    headline: out.headline,
    summary: out.summary,
    skillsText: out.skills
      .filter((s) => s.items.length)
      .map((s) => `${s.category}: ${s.items.join(", ")}`)
      .join("\n"),
    experience: out.experience.map((e) => ({
      role: e.role,
      organization: e.organization,
      duration: e.duration,
      bulletsText: e.bullets.join("\n"),
    })),
    educationText: out.education.join("\n"),
    certificationsText: out.certifications.join("\n"),
    transferableText: out.transferableSkills.join("\n"),
  };
}

export function toDoc(edit: EditableResume): ResumeDoc {
  return {
    contact: edit.contact,
    headline: edit.headline.trim(),
    summary: edit.summary.trim(),
    skills: lines(edit.skillsText).map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { category: "", items: [line] };
      return {
        category: line.slice(0, idx).trim(),
        items: line
          .slice(idx + 1)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }),
    experience: edit.experience
      .map((e) => ({
        role: e.role.trim(),
        organization: e.organization.trim(),
        duration: e.duration.trim(),
        bullets: lines(e.bulletsText),
      }))
      .filter((e) => e.role || e.organization || e.bullets.length),
    education: lines(edit.educationText),
    certifications: lines(edit.certificationsText),
    transferableSkills: lines(edit.transferableText),
  };
}

export function contactLine(c: Contact): string {
  return [c.email, c.phone, c.location, c.link].map((s) => s.trim()).filter(Boolean).join("  |  ");
}

export function experienceMeta(e: ResumeDoc["experience"][number]): string {
  return [e.organization, e.duration].filter(Boolean).join("  |  ");
}

export function resumeToText(doc: ResumeDoc): string {
  const out: string[] = [];
  out.push(doc.contact.fullName.toUpperCase());
  if (doc.headline) out.push(doc.headline);
  const cl = contactLine(doc.contact);
  if (cl) out.push(cl);
  const section = (title: string, body: string[]) => {
    if (!body.length) return;
    out.push("", title.toUpperCase(), ...body);
  };
  section("Professional Summary", doc.summary ? [doc.summary] : []);
  section(
    "Skills",
    doc.skills.map((s) => (s.category ? `${s.category}: ${s.items.join(", ")}` : s.items.join(", "))),
  );
  section(
    "Experience",
    doc.experience.flatMap((e, i) => [
      ...(i > 0 ? [""] : []),
      e.role,
      experienceMeta(e),
      ...e.bullets.map((b) => `- ${b}`),
    ].filter(Boolean)),
  );
  section("Transferable Skills", doc.transferableSkills.map((s) => `- ${s}`));
  section("Education", doc.education);
  section("Certifications & Trainings", doc.certifications);
  return out.join("\n");
}
