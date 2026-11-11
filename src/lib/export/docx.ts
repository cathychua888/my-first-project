import type { ResumeDoc } from "../resume/model";
import { contactLine, experienceMeta } from "../resume/model";

/**
 * Word (.docx) exports. The "docx" library is loaded only when needed.
 * Uses real headings and bullet lists so the file is editable and ATS-friendly.
 */

export async function buildResumeDocx(doc: ResumeDoc): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, BorderStyle } = await import("docx");

  const children: InstanceType<typeof Paragraph>[] = [];

  const heading = (title: string) =>
    children.push(
      new Paragraph({
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C9B5F6", space: 2 } },
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: "573397" })],
      }),
    );
  const para = (text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) =>
    children.push(
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text, size: opts.size ?? 21, ...opts })] }),
    );
  const bullet = (text: string) =>
    children.push(
      new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text, size: 21 })] }),
    );

  children.push(
    new Paragraph({ children: [new TextRun({ text: doc.contact.fullName || "Your Name", bold: true, size: 40 })] }),
  );
  if (doc.headline) para(doc.headline, { size: 24, color: "683CB8" });
  const cl = contactLine(doc.contact);
  if (cl) para(cl, { size: 19, color: "5F5873" });

  if (doc.summary) {
    heading("Professional Summary");
    para(doc.summary);
  }
  if (doc.skills.length) {
    heading("Skills");
    for (const s of doc.skills) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: s.category
            ? [new TextRun({ text: `${s.category}: `, bold: true, size: 21 }), new TextRun({ text: s.items.join(", "), size: 21 })]
            : [new TextRun({ text: s.items.join(", "), size: 21 })],
        }),
      );
    }
  }
  if (doc.experience.length) {
    heading("Experience");
    doc.experience.forEach((e) => {
      if (e.role) para(e.role, { bold: true, size: 22 });
      const meta = experienceMeta(e);
      if (meta) para(meta, { italics: true, size: 19, color: "5F5873" });
      e.bullets.forEach(bullet);
    });
  }
  if (doc.transferableSkills.length) {
    heading("Transferable Skills");
    doc.transferableSkills.forEach(bullet);
  }
  if (doc.education.length) {
    heading("Education");
    doc.education.forEach((e) => para(e));
  }
  if (doc.certifications.length) {
    heading("Certifications & Trainings");
    doc.certifications.forEach(bullet);
  }

  const file = new Document({
    creator: "VA Career Launch AI",
    title: `${doc.contact.fullName} Resume`,
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }],
  });
  return Packer.toBlob(file);
}

/** Exports any text tool's sections (proposal, answers, etc.) as a Word document. */
export async function buildSectionsDocx(title: string, sections: { title: string; content: string }[]): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title })] }),
  ];
  for (const s of sections) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240 }, children: [new TextRun({ text: s.title })] }));
    for (const line of s.content.split("\n")) {
      children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: line, size: 22 })] }));
    }
  }
  const file = new Document({
    creator: "VA Career Launch AI",
    title,
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [{ children }],
  });
  return Packer.toBlob(file);
}
