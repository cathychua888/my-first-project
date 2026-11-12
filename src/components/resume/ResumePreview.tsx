import type { ResumeDoc } from "@/lib/resume/model";
import { contactLine, experienceMeta } from "@/lib/resume/model";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="border-b border-brand-200 pb-1 text-xs font-bold uppercase tracking-wider text-brand-800">{title}</h3>
      <div className="mt-2 space-y-1.5">{children}</div>
    </section>
  );
}

/** On-screen preview that mirrors the PDF / Word layout. */
export function ResumePreview({ doc }: { doc: ResumeDoc }) {
  const cl = contactLine(doc.contact);
  return (
    <article aria-label="Resume preview" className="rounded-2xl border border-brand-100 bg-white p-6 text-[13px] leading-relaxed text-ink shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold">{doc.contact.fullName || "Your Name"}</h2>
      {doc.headline && <p className="mt-0.5 text-sm font-medium text-brand-700">{doc.headline}</p>}
      {cl && <p className="mt-1 break-words text-xs text-muted">{cl}</p>}

      {doc.summary && (
        <Section title="Professional Summary">
          <p>{doc.summary}</p>
        </Section>
      )}
      {doc.skills.length > 0 && (
        <Section title="Skills">
          {doc.skills.map((s, i) => (
            <p key={i}>
              {s.category && <strong>{s.category}: </strong>}
              {s.items.join(", ")}
            </p>
          ))}
        </Section>
      )}
      {doc.experience.length > 0 && (
        <Section title="Experience">
          {doc.experience.map((e, i) => (
            <div key={i} className={i > 0 ? "pt-2" : ""}>
              <p className="font-semibold">{e.role}</p>
              {experienceMeta(e) && <p className="text-xs italic text-muted">{experienceMeta(e)}</p>}
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {e.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}
      {doc.transferableSkills.length > 0 && (
        <Section title="Transferable Skills">
          <ul className="list-disc space-y-0.5 pl-5">
            {doc.transferableSkills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Section>
      )}
      {doc.education.length > 0 && (
        <Section title="Education">
          {doc.education.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </Section>
      )}
      {doc.certifications.length > 0 && (
        <Section title="Certifications & Trainings">
          <ul className="list-disc space-y-0.5 pl-5">
            {doc.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
