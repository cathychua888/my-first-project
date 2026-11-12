import type { ResumeDoc } from "../resume/model";
import { contactLine, experienceMeta } from "../resume/model";

/**
 * Builds a single-column, text-based PDF resume.
 * Real text (not an image) keeps it ATS-friendly: applicant tracking systems can read it.
 * jsPDF is loaded only when the user clicks Download, so pages load fast.
 */

// Built-in PDF fonts only support basic Latin characters; replace the rest.
function clean(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•●]/g, "-")
    .replace(/ /g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

export async function buildResumePdf(doc: ResumeDoc): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 50;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const write = (text: string, size: number, style: "normal" | "bold" | "italic" = "normal", indent = 0, color: [number, number, number] = [31, 26, 46]) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lineH = size * 1.35;
    for (const line of pdf.splitTextToSize(clean(text), contentW - indent) as string[]) {
      ensure(lineH);
      pdf.text(line, margin + indent, y + size);
      y += lineH;
    }
  };

  const heading = (title: string) => {
    ensure(40);
    y += 10;
    write(title.toUpperCase(), 11, "bold", 0, [87, 51, 151]);
    pdf.setDrawColor(201, 181, 246);
    pdf.setLineWidth(0.8);
    pdf.line(margin, y + 1, pageW - margin, y + 1);
    y += 7;
  };

  const bullet = (text: string) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    ensure(14);
    pdf.setFillColor(31, 26, 46);
    pdf.circle(margin + 4, y + 6.5, 1.4, "F");
    write(text, 10, "normal", 14);
    y += 1;
  };

  // Header
  write(doc.contact.fullName || "Your Name", 20, "bold");
  if (doc.headline) write(doc.headline, 12, "normal", 0, [104, 60, 184]);
  const cl = contactLine(doc.contact);
  if (cl) {
    y += 2;
    write(cl, 9.5, "normal", 0, [95, 88, 115]);
  }

  if (doc.summary) {
    heading("Professional Summary");
    write(doc.summary, 10);
  }

  if (doc.skills.length) {
    heading("Skills");
    for (const s of doc.skills) {
      write(s.category ? `${s.category}: ${s.items.join(", ")}` : s.items.join(", "), 10);
      y += 2;
    }
  }

  if (doc.experience.length) {
    heading("Experience");
    doc.experience.forEach((e, i) => {
      if (i > 0) y += 6;
      ensure(40);
      if (e.role) write(e.role, 11, "bold");
      const meta = experienceMeta(e);
      if (meta) write(meta, 9.5, "italic", 0, [95, 88, 115]);
      y += 2;
      e.bullets.forEach(bullet);
    });
  }

  if (doc.transferableSkills.length) {
    heading("Transferable Skills");
    doc.transferableSkills.forEach(bullet);
  }

  if (doc.education.length) {
    heading("Education");
    doc.education.forEach((e) => write(e, 10));
  }

  if (doc.certifications.length) {
    heading("Certifications & Trainings");
    doc.certifications.forEach(bullet);
  }

  return pdf.output("blob");
}
